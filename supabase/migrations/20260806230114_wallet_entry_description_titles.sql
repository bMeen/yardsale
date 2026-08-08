-- ============================================================================
-- Migration: 0059_wallet_entry_description_titles.sql
-- Purpose:   Audit pass on wallet entry descriptions across all functions
--            that call record_wallet_entry(), following the design of
--            get_wallet_activity() (0058).
--
-- Findings:
--   - initialize_user()  (INITIAL_CREDIT) — no change needed. No auction
--     context applies to this entry type.
--   - reset_wallet()     (WALLET_RESET)   — no change needed. Same reason.
--   - submit_bid()'s two entry types already correctly distinguish WHY a
--     release happened ('outbid') from admin_cancel_auction()'s release
--     ('auction cancelled by admin') — the ambiguity this audit was meant
--     to catch does not actually exist in the current code.
--
--   The real gap: four write sites omit the auction title, even though
--   every one of them already has it in scope (p_title / v_auction.title).
--   In a wallet activity feed spanning many auctions, "Bid reservation" or
--   "Listing fee" alone doesn't identify which auction the entry belongs
--   to — get_wallet_activity() intentionally does not expose reference_id
--   for the frontend to resolve this itself, so the description string
--   must carry that context.
--
-- Changed in this migration (CREATE OR REPLACE — no signature change on
-- any of these three functions, so grants are preserved automatically):
--   create_auction()        LISTING_FEE     : 'Listing fee'
--                                           -> 'Listing fee — "{title}"'
--   submit_bid()             BID_RESERVATION : 'Bid reservation'
--                                           -> 'Bid reserved — "{title}"'
--   submit_bid()             BID_RELEASE (outbid) : 'Reservation released — outbid'
--                                           -> 'Outbid — "{title}"'
--   admin_cancel_auction()   BID_RELEASE     : 'Reservation released — auction cancelled by admin'
--                                           -> 'Auction cancelled — "{title}"'
--
-- Wording now matches the "{Action} — \"{title}\"" pattern established by
-- settle_auction() (0057), for consistency across every entry type a user
-- can see in their wallet activity feed.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- create_auction() — LISTING_FEE description now includes the title.
-- ----------------------------------------------------------------------------

create or replace function create_auction(
  p_title               text,
  p_description         text,
  p_category            auction_category,
  p_starting_price      bigint,
  p_starts_at           timestamptz,
  p_ends_at             timestamptz,
  p_image_storage_paths text[] default null,
  p_auction_id          uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_id      uuid := auth.uid();
  v_available_id   uuid;
  v_platform_id    uuid;
  v_auction_id     uuid := coalesce(p_auction_id, gen_random_uuid());
  v_status         auction_status;
  v_image_count    integer;
  v_listing_fee    bigint;
  i                integer;
begin
  perform assert_profile_active(v_caller_id);

  if is_admin() then
    perform raise_business_error(
      'ADMIN_CANNOT_PARTICIPATE',
      'Administrators cannot create marketplace auctions.'
    );
  end if;

  if p_starting_price <= 0 then
    perform raise_business_error(
      'INVALID_STARTING_PRICE',
      'Starting price must be greater than zero.'
    );
  end if;

  if p_ends_at <= now() then
    perform raise_business_error(
      'AUCTION_END_TIME_IN_PAST',
      'Auction end time must be in the future.'
    );
  end if;

  if p_ends_at - p_starts_at < minimum_auction_duration() then
    perform raise_business_error(
      'AUCTION_DURATION_TOO_SHORT',
      format('Auctions must run for at least %s.', minimum_auction_duration())
    );
  end if;

  v_image_count := coalesce(array_length(p_image_storage_paths, 1), 0);

  if v_image_count > 3 then
    perform raise_business_error(
      'TOO_MANY_IMAGES',
      'An auction may have at most 3 images.'
    );
  end if;

  v_status := determine_initial_auction_status(p_starts_at);

  insert into auctions (
    id, seller_id, title, description, category,
    starting_price, current_price, status, starts_at, ends_at
  )
  values (
    v_auction_id, v_caller_id, p_title, p_description, p_category,
    p_starting_price, p_starting_price, v_status, p_starts_at, p_ends_at
  );

  for i in 1 .. v_image_count loop
    insert into auction_images (auction_id, storage_path, display_order)
    values (v_auction_id, p_image_storage_paths[i], i);
  end loop;

  select id into v_available_id
  from wallet_accounts
  where profile_id = v_caller_id
    and account_type = 'AVAILABLE';

  v_listing_fee := listing_fee_kobo();
  v_platform_id := get_platform_account_id();

  perform assert_wallet_balance(v_available_id, v_listing_fee);

  perform record_wallet_entry(
    p_from_account_id => v_available_id,
    p_to_account_id   => v_platform_id,
    p_amount          => v_listing_fee,
    p_entry_type      => 'LISTING_FEE',
    p_reference_type  => 'AUCTION',
    p_reference_id    => v_auction_id,
    p_description     => format('Listing fee — "%s"', p_title)
  );

  return v_auction_id;
end;
$$;

revoke execute on function create_auction(
  text, text, auction_category, bigint, timestamptz, timestamptz, text[], uuid
) from public;

grant execute on function create_auction(
  text, text, auction_category, bigint, timestamptz, timestamptz, text[], uuid
) to authenticated;

-- ----------------------------------------------------------------------------
-- submit_bid() — BID_RESERVATION and BID_RELEASE descriptions now include
-- the title. The outbid-vs-admin-cancel distinction was already correct;
-- only the missing title context is being added here.
-- ----------------------------------------------------------------------------

create or replace function submit_bid(
  p_auction_id uuid,
  p_amount     bigint
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_id            uuid := auth.uid();
  v_auction              auctions;
  v_old_leader_bidder_id uuid;
  v_old_leader_bid_id    uuid;
  v_reserve_amount       bigint;
  v_caller_available_id  uuid;
  v_caller_reserved_id   uuid;
  v_new_bid              bids;
  v_old_reserved_id      uuid;
  v_old_available_id     uuid;
begin
  perform assert_profile_active(v_caller_id);

  if is_admin() then
    perform raise_business_error(
      'ADMIN_CANNOT_PARTICIPATE',
      'Administrators cannot bid on auctions.'
    );
  end if;

  v_auction := lock_auction(p_auction_id);

  perform validate_auction_state(v_auction);
  perform validate_bid_amount(v_auction, v_caller_id, p_amount);

  v_old_leader_bid_id := v_auction.highest_bid_id;

  if v_old_leader_bid_id is not null then
    select bidder_id into v_old_leader_bidder_id
    from bids
    where id = v_old_leader_bid_id;
  end if;

  if v_old_leader_bidder_id = v_caller_id then
    -- Increasing our own leading bid: only the difference needs
    -- reserving, since current_price is already sitting in our
    -- RESERVED account.
    v_reserve_amount := p_amount - v_auction.current_price;
  else
    -- No prior bid, or a prior bid that was already outbid (and
    -- therefore already released) — zero live reservation right now,
    -- so the full amount must be reserved.
    v_reserve_amount := p_amount;
  end if;

  select id into v_caller_available_id
  from wallet_accounts
  where profile_id = v_caller_id and account_type = 'AVAILABLE';

  select id into v_caller_reserved_id
  from wallet_accounts
  where profile_id = v_caller_id and account_type = 'RESERVED';

  perform assert_wallet_balance(v_caller_available_id, v_reserve_amount);

  v_new_bid := create_bid_record(p_auction_id, v_caller_id, p_amount);

  perform record_wallet_entry(
    p_from_account_id => v_caller_available_id,
    p_to_account_id   => v_caller_reserved_id,
    p_amount          => v_reserve_amount,
    p_entry_type      => 'BID_RESERVATION',
    p_reference_type  => 'BID',
    p_reference_id    => v_new_bid.id,
    p_description     => format('Bid reserved — "%s"', v_auction.title)
  );

  perform update_auction_leader(p_auction_id);

  -- Genuine outbid of a DIFFERENT bidder: release their reservation
  -- immediately and notify them. Skipped entirely when the caller is
  -- increasing their own leading bid (v_old_leader_bidder_id =
  -- v_caller_id in that case).
  if v_old_leader_bidder_id is not null and v_old_leader_bidder_id <> v_caller_id then
    select id into v_old_reserved_id
    from wallet_accounts
    where profile_id = v_old_leader_bidder_id and account_type = 'RESERVED';

    select id into v_old_available_id
    from wallet_accounts
    where profile_id = v_old_leader_bidder_id and account_type = 'AVAILABLE';

    perform record_wallet_entry(
      p_from_account_id => v_old_reserved_id,
      p_to_account_id   => v_old_available_id,
      p_amount          => v_auction.current_price,
      p_entry_type      => 'BID_RELEASE',
      p_reference_type  => 'BID',
      p_reference_id    => v_old_leader_bid_id,
      p_description     => format('Outbid — "%s"', v_auction.title)
    );

    perform create_notification(
      p_profile_id     => v_old_leader_bidder_id,
      p_type           => 'OUTBID',
      p_title          => 'You have been outbid',
      p_message        => format(
        'Someone placed a higher bid on "%s". The new highest bid is %s.',
        v_auction.title,
        format_naira(p_amount)
      ),
      p_reference_type => 'AUCTION',
      p_reference_id   => v_auction.id
    );
  end if;

  return v_new_bid.id;
end;
$$;

revoke execute on function submit_bid(uuid, bigint) from public;
grant execute on function submit_bid(uuid, bigint) to authenticated;

-- ----------------------------------------------------------------------------
-- admin_cancel_auction() — BID_RELEASE description now includes the title.
-- ----------------------------------------------------------------------------

create or replace function admin_cancel_auction(
  p_auction_id uuid,
  p_reason     text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_id           uuid := auth.uid();
  v_auction             auctions;
  v_leader_bidder_id    uuid;
  v_bidder_reserved_id  uuid;
  v_bidder_available_id uuid;
  v_notify_bidder       record;
begin
  if not is_admin() then
    perform raise_business_error(
      'NOT_AUTHORIZED',
      'Only an administrator may perform this action.'
    );
  end if;

  v_auction := lock_auction(p_auction_id);

  if v_auction.status not in ('SCHEDULED', 'ACTIVE', 'ENDED') then
    perform raise_business_error(
      'AUCTION_CANNOT_BE_CANCELLED',
      format('Auctions in status %s cannot be cancelled.', v_auction.status)
    );
  end if;

  -- Release only the current leader's reservation, if one exists.
  -- current_price at this point equals exactly what the leader has
  -- reserved for this specific auction (their single net reservation,
  -- maintained by submit_bid()'s increment-only-the-difference logic).
  if v_auction.highest_bid_id is not null then
    select bidder_id into v_leader_bidder_id
    from bids
    where id = v_auction.highest_bid_id;

    select id into v_bidder_reserved_id
    from wallet_accounts
    where profile_id = v_leader_bidder_id
      and account_type = 'RESERVED';

    select id into v_bidder_available_id
    from wallet_accounts
    where profile_id = v_leader_bidder_id
      and account_type = 'AVAILABLE';

    perform record_wallet_entry(
      p_from_account_id => v_bidder_reserved_id,
      p_to_account_id   => v_bidder_available_id,
      p_amount          => v_auction.current_price,
      p_entry_type      => 'BID_RELEASE',
      p_reference_type  => 'BID',
      p_reference_id    => v_auction.highest_bid_id,
      p_description     => format('Auction cancelled — "%s"', v_auction.title)
    );
  end if;

  -- Notify every distinct historical bidder — purely informational,
  -- doesn't move money, so no wording claiming funds were "just"
  -- released (only true for the leader).
  for v_notify_bidder in
    select distinct bidder_id
    from bids
    where auction_id = p_auction_id
      and status = 'ACTIVE'
  loop
    perform create_notification(
      p_profile_id     => v_notify_bidder.bidder_id,
      p_type           => 'ADMIN_CANCELLED_AUCTION',
      p_title          => 'Auction cancelled',
      p_message        => format(
        '"%s" was cancelled by an administrator. Reason: %s.',
        v_auction.title,
        p_reason
      ),
      p_reference_type => 'AUCTION',
      p_reference_id   => v_auction.id
    );
  end loop;

  update bids
  set status = 'CANCELLED'
  where auction_id = p_auction_id
    and status = 'ACTIVE';

  update auctions
  set status = 'CANCELLED'
  where id = p_auction_id;

  perform create_notification(
    p_profile_id     => v_auction.seller_id,
    p_type           => 'ADMIN_CANCELLED_AUCTION',
    p_title          => 'Your auction was cancelled',
    p_message        => format(
      '"%s" was cancelled by an administrator. Reason: %s. The listing fee is non-refundable.',
      v_auction.title,
      p_reason
    ),
    p_reference_type => 'AUCTION',
    p_reference_id   => v_auction.id
  );

  perform write_audit_log(
    p_admin_profile_id => v_caller_id,
    p_action_type      => 'AUCTION_CANCELLED',
    p_reference_type   => 'AUCTION',
    p_reference_id     => v_auction.id,
    p_reason           => p_reason
  );
end;
$$;

revoke execute on function admin_cancel_auction(uuid, text) from public;

COMMIT;
-- =============================================================================
-- YardSale — Stage 7, Group D: Admin Private RPCs
-- =============================================================================
-- All three are Private RPCs in the sense that only the admin can
-- meaningfully call them (enforced via is_admin() checks inside each
-- function, not via RLS — SECURITY DEFINER functions don't get RLS
-- enforcement on their own internal writes). They ARE invoked directly
-- by the admin's authenticated session (unlike close_auction /
-- settle_auction / process_due_auctions, which run via cron with no
-- session), so auth.uid() is meaningful here.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- admin_set_user_status()
-- -----------------------------------------------------------------------------
-- Single action-based RPC covering suspend / deactivate / reactivate —
-- not three separate functions. The target profile_status determines
-- both the admin_action_type logged and the notification sent.
--
-- reason is required for SUSPENDED and DEACTIVATED (enforced by
-- write_audit_log()'s existing validation), optional for ACTIVE
-- (reactivation) — frozen decision.
--
-- Defensive guard: an admin profile can never be targeted by this
-- function, protecting the sole admin account from ever being
-- accidentally locked out via self-suspension.
create or replace function admin_set_user_status(
  p_target_profile_id uuid,
  p_new_status         profile_status,
  p_reason             text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_id             uuid := auth.uid();
  v_target                profiles;
  v_action_type           admin_action_type;
  v_notification_type     notification_type;
  v_notification_title    text;
  v_notification_message  text;
begin
  if not is_admin() then
    perform raise_business_error(
      'NOT_AUTHORIZED',
      'Only an administrator may perform this action.'
    );
  end if;

  select * into v_target
  from profiles
  where id = p_target_profile_id
  for update;

  if not found then
    perform raise_business_error(
      'PROFILE_NOT_FOUND',
      'No profile exists for the given id.'
    );
  end if;

  if v_target.role = 'ADMIN' then
    perform raise_business_error(
      'CANNOT_MODIFY_ADMIN_STATUS',
      'Admin accounts cannot be suspended, deactivated, or reactivated.'
    );
  end if;

  if p_new_status = 'SUSPENDED' then
    v_action_type          := 'USER_SUSPENDED';
    v_notification_type    := 'ACCOUNT_SUSPENDED';
    v_notification_title   := 'Your account has been suspended';
    v_notification_message := format('Your account has been suspended. Reason: %s', p_reason);
  elsif p_new_status = 'DEACTIVATED' then
    v_action_type          := 'USER_DEACTIVATED';
    v_notification_type    := 'ACCOUNT_DEACTIVATED';
    v_notification_title   := 'Your account has been deactivated';
    v_notification_message := format('Your account has been deactivated. Reason: %s', p_reason);
  elsif p_new_status = 'ACTIVE' then
    v_action_type        := 'USER_REACTIVATED';
    v_notification_type  := 'ACCOUNT_REACTIVATED';
    v_notification_title := 'Your account has been reactivated';
    if p_reason is not null then
      v_notification_message := format('Your account has been reactivated. Reason: %s', p_reason);
    else
      v_notification_message := 'Your account has been reactivated. You now have full access to YardSale.';
    end if;
  end if;

  update profiles
  set status = p_new_status
  where id = p_target_profile_id;

  -- write_audit_log() enforces the reason-required rule for
  -- USER_SUSPENDED / USER_DEACTIVATED. USER_REACTIVATED is not in its
  -- required list, so p_reason may be NULL here without error.
  perform write_audit_log(
    p_admin_profile_id => v_caller_id,
    p_action_type      => v_action_type,
    p_reference_type   => 'USER',
    p_reference_id     => p_target_profile_id,
    p_reason           => p_reason
  );

  perform create_notification(
    p_profile_id     => p_target_profile_id,
    p_type           => v_notification_type,
    p_title          => v_notification_title,
    p_message        => v_notification_message,
    p_reference_type => 'USER',
    p_reference_id    => p_target_profile_id
  );
end;
$$;

revoke execute on function admin_set_user_status(uuid, profile_status, text) from public;


-- -----------------------------------------------------------------------------
-- admin_cancel_auction()
-- -----------------------------------------------------------------------------
-- Force-cancels an auction at any point before settlement (SCHEDULED,
-- ACTIVE, or ENDED — not SETTLED, since money has already moved by
-- then, and not already-CANCELLED). No listing fee refund, matching
-- the same no-refund rule as seller self-cancellation.
--
-- reason has no default here (unlike admin_set_user_status) because
-- this function always logs AUCTION_CANCELLED, which is always in
-- write_audit_log()'s required-reason list — making it a mandatory
-- parameter is a clearer signal than relying solely on the runtime
-- check.
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
  v_bid                 record;
  v_bidder_reserved_id  uuid;
  v_bidder_available_id uuid;
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

  -- Release each distinct bidder's CURRENT net reservation on this
  -- auction — NOT every bid row's amount. A bidder who increased their
  -- own bid multiple times has only one net reservation (their
  -- latest/highest active bid), since submit_bid() only ever reserves
  -- the incremental difference on an increase. DISTINCT ON (bidder_id)
  -- ORDER BY amount DESC correctly picks that single highest row per
  -- bidder, avoiding a double/triple-release bug that a naive loop over
  -- every ACTIVE bid row would cause.
  for v_bid in
    select distinct on (bidder_id) bidder_id, id as bid_id, amount
    from bids
    where auction_id = p_auction_id
      and status = 'ACTIVE'
    order by bidder_id, amount desc
  loop
    select id into v_bidder_reserved_id
    from wallet_accounts
    where profile_id = v_bid.bidder_id
      and account_type = 'RESERVED';

    select id into v_bidder_available_id
    from wallet_accounts
    where profile_id = v_bid.bidder_id
      and account_type = 'AVAILABLE';

    perform record_wallet_entry(
      p_from_account_id => v_bidder_reserved_id,
      p_to_account_id   => v_bidder_available_id,
      p_amount          => v_bid.amount,
      p_entry_type      => 'BID_RELEASE',
      p_reference_type  => 'BID',
      p_reference_id    => v_bid.bid_id,
      p_description     => 'Reservation released — auction cancelled by admin'
    );

    perform create_notification(
      p_profile_id     => v_bid.bidder_id,
      p_type           => 'ADMIN_CANCELLED_AUCTION',
      p_title          => 'Auction cancelled',
      p_message        => format(
        '"%s" was cancelled by an administrator. Reason: %s. Your reserved funds have been released.',
        v_auction.title,
        p_reason
      ),
      p_reference_type => 'AUCTION',
      p_reference_id   => v_auction.id
    );
  end loop;

  -- Mark every active bid row (including any superseded lower bids
  -- from the same bidders) as cancelled, now that release amounts have
  -- already been computed above.
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


-- -----------------------------------------------------------------------------
-- admin_create_system_auction()
-- -----------------------------------------------------------------------------
-- Creates an auction owned by the admin's own profile as seller_id —
-- there is no separate "is_system" flag; settle_auction()'s
-- is_profile_admin(seller_id) check is what triggers the 100%-to-
-- platform settlement branch later.
--
-- Deliberately does NOT charge a listing fee: the admin has no wallet
-- accounts at all (frozen decision — admin never needs one, since
-- system auctions never pay a seller). Charging a fee here would fail
-- outright with no AVAILABLE account to deduct from, so this
-- necessarily diverges from the future create_auction() (Stage 9) flow.
--
-- Image count (max 3) is validated here rather than relying on a table
-- CHECK constraint, matching how auction_images' 3-image cap is
-- enforced everywhere else in the system (application/RPC logic, not
-- SQL constraint — the same reasoning as create_auction() will use).
create or replace function admin_create_system_auction(
  p_title               text,
  p_description         text,
  p_category            auction_category,
  p_starting_price      bigint,
  p_starts_at           timestamptz,
  p_ends_at             timestamptz,
  p_image_storage_paths text[] default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_id  uuid := auth.uid();
  v_auction_id uuid;
  v_status     auction_status;
  v_image_count integer;
  i            integer;
begin
  if not is_admin() then
    perform raise_business_error(
      'NOT_AUTHORIZED',
      'Only an administrator may perform this action.'
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
    seller_id, title, description, category,
    starting_price, current_price, status, starts_at, ends_at
  )
  values (
    v_caller_id, p_title, p_description, p_category,
    p_starting_price, p_starting_price, v_status, p_starts_at, p_ends_at
  )
  returning id into v_auction_id;

  for i in 1 .. v_image_count loop
    insert into auction_images (auction_id, storage_path, display_order)
    values (v_auction_id, p_image_storage_paths[i], i);
  end loop;

  -- reason is optional for SYSTEM_AUCTION_CREATED (not in
  -- write_audit_log()'s required list) — no admin justification needed
  -- to create a promotional/giveaway auction.
  perform write_audit_log(
    p_admin_profile_id => v_caller_id,
    p_action_type      => 'SYSTEM_AUCTION_CREATED',
    p_reference_type   => 'AUCTION',
    p_reference_id     => v_auction_id,
    p_reason           => null
  );

  return v_auction_id;
end;
$$;

revoke execute on function admin_create_system_auction(
  text, text, auction_category, bigint, timestamptz, timestamptz, text[]
) from public;
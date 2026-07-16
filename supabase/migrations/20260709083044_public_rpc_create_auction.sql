-- =============================================================================
-- YardSale — Stage 9, Group C: create_auction()
-- =============================================================================
-- Public RPC. The single entry point for auction creation — there is no
-- separate publish_auction() (merged decision from the original design
-- discussion) and no DRAFT status. Accepts already-finalized
-- storage_path values as input, mirroring admin_create_system_auction()'s
-- signature exactly — moving files from a temp upload location to their
-- permanent auction-scoped path is an Edge Function/Phase 6 concern,
-- entirely out of scope for this SQL function.
--
-- Ordering (confirmed): the auction row is inserted FIRST, then the
-- listing fee is charged referencing the now-known auction_id. Since
-- everything here runs in one transaction, if the fee charge fails
-- (insufficient balance), the entire function — including the auction
-- insert — rolls back. There is no risk of an auction existing without
-- its listing fee ever being charged.
-- =============================================================================

create or replace function create_auction(
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
  v_caller_id      uuid := auth.uid();
  v_available_id   uuid;
  v_platform_id    uuid;
  v_auction_id     uuid;
  v_status         auction_status;
  v_image_count    integer;
  v_listing_fee    bigint;
  i                integer;
begin
  perform assert_profile_active(v_caller_id);

  -- Standardized across every marketplace-participation guard in
  -- Stage 9 (create_auction, submit_bid, cancel_bid, cancel_auction,
  -- toggle_watchlist) — one error code for one underlying rule.
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

  -- Charge the listing fee, referencing the now-known auction_id.
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
    p_description     => 'Listing fee'
  );

  -- No "auction created" notification — nothing in the frozen docs
  -- calls for one, and activate_auction() already covers the
  -- ACTIVE-transition notification for scheduled auctions once cron
  -- picks them up.
  return v_auction_id;
end;
$$;

revoke execute on function create_auction(
  text, text, auction_category, bigint, timestamptz, timestamptz, text[]
) from public;

grant execute on function create_auction(
  text, text, auction_category, bigint, timestamptz, timestamptz, text[]
) to authenticated;
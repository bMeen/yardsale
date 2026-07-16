-- =============================================================================
-- YardSale — update_auction() + mark_all_notifications_read()
-- =============================================================================
-- update_auction(): fills a genuine gap found while reviewing a UX spec
-- against the backend — "seller can edit before first bid" was frozen
-- in the original Auction Domain design ("Seller: ... Can edit only
-- before the first bid") alongside cancel_auction(), but only the
-- cancellation half was ever built. Same gating as cancel_auction():
-- seller-only, SCHEDULED/ACTIVE only, only before the first bid
-- (highest_bid_id IS NULL). Deliberately scoped to auction TABLE fields
-- only — image changes are out of scope for this function; editing
-- images still requires cancel + recreate for now.
--
-- mark_all_notifications_read(): a legitimate new requirement (not a
-- conflict with anything previously decided) — the original
-- mark_notification_read() only ever handled one notification at a
-- time by design.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- update_auction()
-- -----------------------------------------------------------------------------
create or replace function update_auction(
  p_auction_id     uuid,
  p_title          text default null,
  p_description    text default null,
  p_category       auction_category default null,
  p_starting_price bigint default null,
  p_starts_at      timestamptz default null,
  p_ends_at        timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_id     uuid := auth.uid();
  v_auction       auctions;
  v_new_starting  bigint;
  v_new_starts_at timestamptz;
  v_new_ends_at   timestamptz;
  v_new_status    auction_status;
begin
  perform assert_profile_active(v_caller_id);

  if is_admin() then
    perform raise_business_error(
      'ADMIN_CANNOT_PARTICIPATE',
      'Administrators cannot edit marketplace auctions.'
    );
  end if;

  v_auction := lock_auction(p_auction_id);

  if v_auction.seller_id <> v_caller_id then
    perform raise_business_error(
      'NOT_YOUR_AUCTION',
      'You may only edit auctions you created.'
    );
  end if;

  if v_auction.status not in ('SCHEDULED', 'ACTIVE') then
    perform raise_business_error(
      'AUCTION_CANNOT_BE_EDITED',
      format('Auctions in status %s cannot be edited.', v_auction.status)
    );
  end if;

  if v_auction.highest_bid_id is not null then
    perform raise_business_error(
      'AUCTION_HAS_BIDS',
      'Auctions that have already received a bid cannot be edited.'
    );
  end if;

  v_new_starting  := coalesce(p_starting_price, v_auction.starting_price);
  v_new_starts_at := coalesce(p_starts_at, v_auction.starts_at);
  v_new_ends_at   := coalesce(p_ends_at, v_auction.ends_at);

  if v_new_starting <= 0 then
    perform raise_business_error(
      'INVALID_STARTING_PRICE',
      'Starting price must be greater than zero.'
    );
  end if;

  if v_new_ends_at <= now() then
    perform raise_business_error(
      'AUCTION_END_TIME_IN_PAST',
      'Auction end time must be in the future.'
    );
  end if;

  if v_new_ends_at - v_new_starts_at < minimum_auction_duration() then
    perform raise_business_error(
      'AUCTION_DURATION_TOO_SHORT',
      format('Auctions must run for at least %s.', minimum_auction_duration())
    );
  end if;

  -- Status may change if starts_at moved across "now" (e.g. a
  -- SCHEDULED auction rescheduled to start immediately).
  v_new_status := determine_initial_auction_status(v_new_starts_at);

  update auctions
  set title          = coalesce(p_title, title),
      description    = coalesce(p_description, description),
      category       = coalesce(p_category, category),
      starting_price = v_new_starting,
      -- No bids exist yet (guaranteed by the highest_bid_id check
      -- above), so current_price always mirrors starting_price here.
      current_price  = v_new_starting,
      starts_at      = v_new_starts_at,
      ends_at        = v_new_ends_at,
      status         = v_new_status
  where id = p_auction_id;
end;
$$;

revoke execute on function update_auction(
  uuid, text, text, auction_category, bigint, timestamptz, timestamptz
) from public;

grant execute on function update_auction(
  uuid, text, text, auction_category, bigint, timestamptz, timestamptz
) to authenticated;


-- -----------------------------------------------------------------------------
-- mark_all_notifications_read()
-- -----------------------------------------------------------------------------
-- Same exemptions as mark_notification_read(): no assert_profile_active()
-- gate, no is_admin() guard — managing your own notification read-state
-- isn't marketplace participation and should never be blocked.
create or replace function mark_all_notifications_read()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_id uuid := auth.uid();
begin
  update notifications
  set is_read = true
  where profile_id = v_caller_id
    and is_read = false;
end;
$$;

revoke execute on function mark_all_notifications_read() from public;
grant execute on function mark_all_notifications_read() to authenticated;
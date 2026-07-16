-- =============================================================================
-- YardSale — Stage 9, Group E: cancel_auction() + toggle_watchlist()
-- =============================================================================

-- -----------------------------------------------------------------------------
-- cancel_auction()
-- -----------------------------------------------------------------------------
-- Seller self-cancellation, only before the first bid — frozen rule.
-- Uses highest_bid_id IS NULL as the "no bids yet" signal (cheap, reads
-- the already-locked auction row; equivalent in practice to a bids
-- table scan since a bid can't exist without setting highest_bid_id).
--
-- Blocked for admin via the standard participation guard — admin's
-- system auctions (seller_id = admin's own profile) must be cancelled
-- via admin_cancel_auction() instead, which works at any lifecycle
-- stage and handles the system-auction case correctly. This isn't
-- admin being denied a legitimate action; it's routing them to the
-- correct, more powerful path they already have.
--
-- No listing fee refund — same rule as admin cancellation. No wallet
-- operation at all: by definition, no bids exist yet, so there is
-- nothing to release. No notification: the seller just performed this
-- action themselves.
create or replace function cancel_auction(p_auction_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_id uuid := auth.uid();
  v_auction   auctions;
begin
  perform assert_profile_active(v_caller_id);

  if is_admin() then
    perform raise_business_error(
      'ADMIN_CANNOT_PARTICIPATE',
      'Administrators must use admin_cancel_auction() to cancel auctions.'
    );
  end if;

  v_auction := lock_auction(p_auction_id);

  if v_auction.seller_id <> v_caller_id then
    perform raise_business_error(
      'NOT_YOUR_AUCTION',
      'You may only cancel auctions you created.'
    );
  end if;

  if v_auction.status not in ('SCHEDULED', 'ACTIVE') then
    perform raise_business_error(
      'AUCTION_CANNOT_BE_CANCELLED',
      format('Auctions in status %s cannot be cancelled.', v_auction.status)
    );
  end if;

  if v_auction.highest_bid_id is not null then
    perform raise_business_error(
      'AUCTION_HAS_BIDS',
      'Auctions that have already received a bid cannot be cancelled by the seller.'
    );
  end if;

  update auctions
  set status = 'CANCELLED'
  where id = p_auction_id;
end;
$$;

revoke execute on function cancel_auction(uuid) from public;
grant execute on function cancel_auction(uuid) to authenticated;


-- -----------------------------------------------------------------------------
-- toggle_watchlist()
-- -----------------------------------------------------------------------------
-- Single toggle entry point (frozen decision — not separate add/remove
-- functions). Returns true if the auction is now being watched, false
-- if it was just removed.
--
-- Enforces the frozen rule that sellers cannot watchlist their own
-- auction (redundant with "My Auctions" already showing it).
--
-- Defensively handles a double-click race: two concurrent calls both
-- seeing "not currently watching" would otherwise collide on
-- uq_watchlists_profile_auction — caught and treated as a successful
-- "now watching" rather than surfaced as a raw constraint error.
create or replace function toggle_watchlist(p_auction_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_id   uuid := auth.uid();
  v_seller_id   uuid;
  v_existing_id uuid;
begin
  perform assert_profile_active(v_caller_id);

  if is_admin() then
    perform raise_business_error(
      'ADMIN_CANNOT_PARTICIPATE',
      'Administrators cannot maintain a watchlist.'
    );
  end if;

  select seller_id into v_seller_id
  from auctions
  where id = p_auction_id;

  if not found then
    perform raise_business_error(
      'AUCTION_NOT_FOUND',
      'No auction exists for the given id.'
    );
  end if;

  if v_seller_id = v_caller_id then
    perform raise_business_error(
      'CANNOT_WATCH_OWN_AUCTION',
      'You cannot add your own auction to your watchlist.'
    );
  end if;

  select id into v_existing_id
  from watchlists
  where profile_id = v_caller_id
    and auction_id = p_auction_id;

  if v_existing_id is not null then
    delete from watchlists where id = v_existing_id;
    return false;
  else
    begin
      insert into watchlists (profile_id, auction_id)
      values (v_caller_id, p_auction_id);
      return true;
    exception
      when unique_violation then
        return true;
    end;
  end if;
end;
$$;

revoke execute on function toggle_watchlist(uuid) from public;
grant execute on function toggle_watchlist(uuid) to authenticated;
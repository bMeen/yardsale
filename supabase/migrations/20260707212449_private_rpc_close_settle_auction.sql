-- =============================================================================
-- YardSale — Stage 7 (Group B): close_auction() + settle_auction()
-- =============================================================================
-- Both are private RPCs, invoked exclusively by process_due_auctions()
-- (Group C). Never called directly by the frontend.
--
-- Both are idempotent by design (frozen requirement for scheduled-job
-- targets): re-invoking either on an auction that's already past the
-- relevant state is a silent no-op, not an error. This is what lets
-- process_due_auctions() retry safely after a partial cron failure.
--
-- Status split rationale: ENDED and SETTLED remain distinct so that a
-- settlement failure (e.g. a transient error mid-transfer) never leaves
-- an auction stuck without a determined winner — the outcome (ENDED) is
-- durable and independent of whether payment has cleared (SETTLED) yet.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- format_naira()
-- -----------------------------------------------------------------------------
-- All monetary amounts are stored as bigint kobo. Centralizes the kobo
-- -> readable Naira string conversion for embedding in stored
-- notification message text (which is rendered once and kept immutable,
-- per the Notification Domain's "store the rendered notification"
-- decision), rather than repeating to_char() formatting inline or —
-- worse — leaking raw kobo integers directly into user-facing text.
create or replace function format_naira(p_amount_kobo bigint)
returns text
language sql
immutable
as $$
  select '₦' || to_char(p_amount_kobo / 100.0, 'FM999,999,999.00');
$$;

revoke execute on function format_naira(bigint) from public;

-- -----------------------------------------------------------------------------
-- close_auction()
-- -----------------------------------------------------------------------------
-- ACTIVE -> ENDED. Determines the winner from the auction's own
-- highest_bid_id (already maintained incrementally by
-- update_auction_leader() during bidding — no need to re-scan bids for
-- the max). Sends outcome notifications: AUCTION_WON to the winner,
-- AUCTION_ENDED to the seller, AUCTION_LOST to every other bidder with
-- an ACTIVE (non-cancelled) bid on this auction. Bidders who explicitly
-- cancelled before the auction ended are excluded, per the frozen
-- Notification Domain rule that a user who withdrew is no longer
-- considered a participant.
create or replace function close_auction(p_auction_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_auction    auctions;
  v_winner_bid bids;
  v_winner_id  uuid;
  v_loser_id   uuid;
begin
  v_auction := lock_auction(p_auction_id);

  -- Idempotent: already past ACTIVE (ended/settled/cancelled elsewhere).
  if v_auction.status <> 'ACTIVE' then
    return;
  end if;

  -- Defensive guard against a caller invoking this before the auction's
  -- actual end time — should never happen if process_due_auctions()'s
  -- scan condition is correct, but fails loudly rather than silently if
  -- it ever does.
  if v_auction.ends_at > now() then
    perform raise_business_error(
      'AUCTION_NOT_YET_ENDED',
      'close_auction() called before the auction end time.'
    );
  end if;

  if v_auction.highest_bid_id is not null then
    select * into v_winner_bid
    from bids
    where id = v_auction.highest_bid_id;

    v_winner_id := v_winner_bid.bidder_id;
  end if;

  update auctions
  set status    = 'ENDED',
      winner_id = v_winner_id
  where id = p_auction_id;

  if v_winner_id is not null then
    perform create_notification(
      p_profile_id     => v_winner_id,
      p_type           => 'AUCTION_WON',
      p_title          => 'You won the auction!',
      p_message        => format(
        'Congratulations — you won "%s" for %s.',
        v_auction.title,
        format_naira(v_auction.current_price)
      ),
      p_reference_type => 'AUCTION',
      p_reference_id   => p_auction_id
    );

    perform create_notification(
      p_profile_id     => v_auction.seller_id,
      p_type           => 'AUCTION_ENDED',
      p_title          => 'Your auction has ended',
      p_message        => format(
        '"%s" has ended with a winning bid of %s.',
        v_auction.title,
        format_naira(v_auction.current_price)
      ),
      p_reference_type => 'AUCTION',
      p_reference_id   => p_auction_id
    );

    for v_loser_id in
      select distinct bidder_id
      from bids
      where auction_id = p_auction_id
        and status = 'ACTIVE'
        and bidder_id <> v_winner_id
    loop
      perform create_notification(
        p_profile_id     => v_loser_id,
        p_type           => 'AUCTION_LOST',
        p_title          => 'Auction ended',
        p_message        => format('"%s" has ended. You did not win this time.', v_auction.title),
        p_reference_type => 'AUCTION',
        p_reference_id   => p_auction_id
      );
    end loop;
  else
    -- No bids were ever placed.
    perform create_notification(
      p_profile_id     => v_auction.seller_id,
      p_type           => 'AUCTION_ENDED',
      p_title          => 'Your auction has ended',
      p_message        => format('"%s" ended with no bids.', v_auction.title),
      p_reference_type => 'AUCTION',
      p_reference_id   => p_auction_id
    );
  end if;
end;
$$;

revoke execute on function close_auction(uuid) from public;

-- -----------------------------------------------------------------------------
-- settle_auction()
-- -----------------------------------------------------------------------------
-- ENDED -> SETTLED. Moves money out of the winner's RESERVED account.
--
-- Three cases:
--   1. No-bid auction (winner_id IS NULL): trivially settled, no wallet
--      movement at all.
--   2. System auction (seller is an admin profile): the ENTIRE winning
--      bid routes to PLATFORM as a single SETTLEMENT entry. No seller
--      payout leg exists — admin has no wallet accounts to pay out to,
--      and none are needed.
--   3. Normal auction: two entries — SETTLEMENT (winner RESERVED ->
--      seller AVAILABLE, the payout) and SETTLEMENT_FEE (winner
--      RESERVED -> PLATFORM, the platform's 3% cut).
create or replace function settle_auction(p_auction_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_auction              auctions;
  v_platform_id          uuid;
  v_winner_reserved_id   uuid;
  v_seller_available_id  uuid;
  v_fee                  bigint;
  v_seller_payout        bigint;
  v_seller_is_admin      boolean;
begin
  v_auction := lock_auction(p_auction_id);

  -- Idempotent: only ENDED auctions awaiting settlement are processed.
  if v_auction.status <> 'ENDED' then
    return;
  end if;

  -- Case 1: no-bid auction. Nothing to move.
  if v_auction.winner_id is null then
    update auctions
    set status     = 'SETTLED',
        settled_at = now()
    where id = p_auction_id;

    return;
  end if;

  v_platform_id := get_platform_account_id();

  select id into v_winner_reserved_id
  from wallet_accounts
  where profile_id = v_auction.winner_id
    and account_type = 'RESERVED';

  if v_winner_reserved_id is null then
    perform raise_business_error(
      'WALLET_ACCOUNT_NOT_FOUND',
      'Winner has no RESERVED wallet account.'
    );
  end if;

  v_seller_is_admin := is_profile_admin(v_auction.seller_id);

  if v_seller_is_admin then
    -- Case 2: system auction. Entire winning bid -> PLATFORM.
    perform record_wallet_entry(
      p_from_account_id => v_winner_reserved_id,
      p_to_account_id   => v_platform_id,
      p_amount          => v_auction.current_price,
      p_entry_type      => 'SETTLEMENT',
      p_reference_type  => 'AUCTION',
      p_reference_id    => p_auction_id,
      p_description     => 'System auction settlement'
    );
  else
    -- Case 3: normal auction. Seller payout + platform fee.
    v_fee           := calculate_settlement_fee(v_auction.current_price);
    v_seller_payout := v_auction.current_price - v_fee;

    select id into v_seller_available_id
    from wallet_accounts
    where profile_id = v_auction.seller_id
      and account_type = 'AVAILABLE';

    if v_seller_available_id is null then
      perform raise_business_error(
        'WALLET_ACCOUNT_NOT_FOUND',
        'Seller has no AVAILABLE wallet account.'
      );
    end if;

    perform record_wallet_entry(
      p_from_account_id => v_winner_reserved_id,
      p_to_account_id   => v_seller_available_id,
      p_amount          => v_seller_payout,
      p_entry_type      => 'SETTLEMENT',
      p_reference_type  => 'AUCTION',
      p_reference_id    => p_auction_id,
      p_description     => 'Auction settlement payout'
    );

    perform record_wallet_entry(
      p_from_account_id => v_winner_reserved_id,
      p_to_account_id   => v_platform_id,
      p_amount          => v_fee,
      p_entry_type      => 'SETTLEMENT_FEE',
      p_reference_type  => 'AUCTION',
      p_reference_id    => p_auction_id,
      p_description     => 'Platform settlement fee'
    );

    perform create_notification(
      p_profile_id     => v_auction.seller_id,
      p_type           => 'PAYMENT_RECEIVED',
      p_title          => 'Payment received',
      p_message        => format(
        'You received a payment of %s for "%s".',
        format_naira(v_seller_payout),
        v_auction.title
      ),
      p_reference_type => 'AUCTION',
      p_reference_id   => p_auction_id
    );
  end if;

  update auctions
  set status     = 'SETTLED',
      settled_at = now()
  where id = p_auction_id;
end;
$$;

revoke execute on function settle_auction(uuid) from public;
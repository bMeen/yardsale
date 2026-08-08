-- ============================================================================
-- Migration: 0057_settle_auction_waterfall.sql
-- Purpose:   Replace settle_auction()'s parallel settlement transfers with a
--            sequential waterfall model.
--
-- Previous model (parallel, both from winner.RESERVED):
--     winner.RESERVED -> seller.AVAILABLE   (net payout)
--     winner.RESERVED -> PLATFORM           (fee)
--   Winner therefore saw TWO debit rows (SETTLEMENT + SETTLEMENT_FEE) in
--   their wallet activity for what is conceptually one purchase — risking
--   the appearance of being charged twice if not explained carefully in
--   the UI.
--
-- New model (sequential waterfall):
--     winner.RESERVED -> seller.AVAILABLE   (FULL winning bid)
--     seller.AVAILABLE -> PLATFORM          (fee, deducted after payment)
--   Winner now sees exactly ONE debit (the full bid amount). Seller sees
--   TWO entries — a credit for the sale, then a separate debit for the
--   platform fee — which mirrors how real marketplaces (fee deducted from
--   proceeds) display settlement, and is not confusing because the two
--   entries have genuinely different counterparties (buyer, then
--   platform).
--
-- HARD ORDERING RULE:
--   The two record_wallet_entry() calls in the seller branch below MUST
--   remain sequential and in this exact order. The fee transfer draws
--   from seller.AVAILABLE, which only holds sufficient balance AFTER the
--   first transfer's balance-projection trigger has run. These are NOT
--   independent operations and must never be parallelized, reordered, or
--   refactored to both source from winner.RESERVED. Both statements run
--   within this function's single transaction; Postgres fires the
--   wallet_entries -> wallet_accounts trigger immediately (non-deferred)
--   after each INSERT, so sequential statement order is sufficient to
--   guarantee correct balances — no explicit locking beyond the existing
--   lock_auction() call is required.
--
-- Descriptions are intentionally viewer-neutral: a single SETTLEMENT row
-- is read by both the winner (as a DEBIT) and the seller (as a CREDIT) via
-- get_wallet_activity()'s account-ownership-based direction resolution.
-- The description text does not say "paid" or "received" — direction and
-- styling are derived at read time from which side of from/to the viewer
-- is on, not from the stored text.
--
-- Unaffected by this patch:
--   - No-bid auctions (still settle with no wallet movement).
--   - System/admin auctions (still a single winner.RESERVED -> PLATFORM
--     transfer for the full amount, since admin has no AVAILABLE account
--     to route through).
--   - Idempotency (still gated by the leading status <> 'ENDED' check).
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION settle_auction(p_auction_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
declare
  v_auction              auctions;
  v_platform_id          uuid;
  v_winner_reserved_id   uuid;
  v_seller_available_id  uuid;
  v_fee                  bigint;
  v_seller_net           bigint;
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
    -- Case 2: system auction. No seller AVAILABLE account exists to route
    -- through — entire winning bid goes directly winner.RESERVED -> PLATFORM.
    perform record_wallet_entry(
      p_from_account_id => v_winner_reserved_id,
      p_to_account_id   => v_platform_id,
      p_amount          => v_auction.current_price,
      p_entry_type      => 'SETTLEMENT',
      p_reference_type  => 'AUCTION',
      p_reference_id    => p_auction_id,
      p_description     => format('Auction settlement — "%s"', v_auction.title)
    );
  else
    -- Case 3: normal auction. Sequential waterfall — see hard ordering
    -- rule above. Do not reorder or parallelize these two transfers.
    v_fee       := calculate_settlement_fee(v_auction.current_price);
    v_seller_net := v_auction.current_price - v_fee;

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

    -- Step 1: winner pays seller in full (gross winning bid, before fee).
    perform record_wallet_entry(
      p_from_account_id => v_winner_reserved_id,
      p_to_account_id   => v_seller_available_id,
      p_amount          => v_auction.current_price,
      p_entry_type      => 'SETTLEMENT',
      p_reference_type  => 'AUCTION',
      p_reference_id    => p_auction_id,
      p_description     => format('Auction settlement — "%s"', v_auction.title)
    );

    -- Step 2: platform fee is deducted from the seller's proceeds, after
    -- the payment above has been recorded (and its trigger has run).
    perform record_wallet_entry(
      p_from_account_id => v_seller_available_id,
      p_to_account_id   => v_platform_id,
      p_amount          => v_fee,
      p_entry_type      => 'SETTLEMENT_FEE',
      p_reference_type  => 'AUCTION',
      p_reference_id    => p_auction_id,
      p_description     => format('Platform fee — "%s"', v_auction.title)
    );

    perform create_notification(
      p_profile_id     => v_auction.seller_id,
      p_type           => 'PAYMENT_RECEIVED',
      p_title          => 'Payment received',
      p_message        => format(
        'You received %s for "%s" (platform fee of %s already deducted — net %s).',
        format_naira(v_auction.current_price),
        v_auction.title,
        format_naira(v_fee),
        format_naira(v_seller_net)
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

REVOKE EXECUTE ON FUNCTION settle_auction(uuid) FROM PUBLIC;

COMMENT ON FUNCTION settle_auction(uuid) IS
    'Settles an ENDED auction. Normal auctions use a sequential waterfall: winner.RESERVED pays seller.AVAILABLE in full, then seller.AVAILABLE pays the platform fee — winner sees one SETTLEMENT debit, seller sees a SETTLEMENT credit followed by a SETTLEMENT_FEE debit. System/admin auctions remain a single direct winner.RESERVED -> PLATFORM transfer. Idempotent via the leading ENDED-status check. Private RPC — invoked only by process_due_auctions(), never callable from the frontend.';

COMMIT;
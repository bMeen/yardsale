-- ============================================================================
-- Migration: 0052_auction_bid_count.sql
-- Purpose:   Add a denormalized bid_count column to auctions, backfill it
--            from existing bid history, and maintain it going forward via
--            an append-only trigger on bids.
--
-- Semantics: bid_count is MONOTONIC. It counts every bid ever placed on the
--            auction (including bids later cancelled, and every new row
--            created when a user increases their own bid). It is NOT a
--            count of currently-active bids. This mirrors how current_price,
--            highest_bid_id, and winner_id are treated: derived facts cached
--            on auctions for cheap reads, with bids remaining the immutable
--            source of truth.
--
-- Rule:      No RPC or application code may update auctions.bid_count
--            directly. Only the trigger defined below (reacting to INSERT
--            on bids) is permitted to change it. This is the same rule we
--            enforce for wallet_accounts.balance relative to wallet_entries.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- Step 1: Add the column.
-- New rows/auctions created after this migration start at 0, which is
-- correct since they have no bids yet.
-- ----------------------------------------------------------------------------

ALTER TABLE auctions
    ADD COLUMN bid_count integer NOT NULL DEFAULT 0;

ALTER TABLE auctions
    ADD CONSTRAINT ck_auctions_bid_count_non_negative
    CHECK (bid_count >= 0);

-- ----------------------------------------------------------------------------
-- Step 2: Backfill from actual bid history.
-- Auctions with zero rows in `bids` are left at the default 0 (correct,
-- since this UPDATE only touches auctions that have a matching group in
-- the subquery).
-- ----------------------------------------------------------------------------

UPDATE auctions a
SET bid_count = sub.total_bids
FROM (
    SELECT auction_id, COUNT(*) AS total_bids
    FROM bids
    GROUP BY auction_id
) sub
WHERE a.id = sub.auction_id;

-- ----------------------------------------------------------------------------
-- Step 3: Create the trigger that maintains bid_count going forward.
-- Fires only on INSERT — bid_count never decrements, including on
-- cancellation (status change is an UPDATE, not an INSERT, and is
-- intentionally not handled here).
--
-- This must run AFTER the backfill above, so the one-time reconciliation
-- in Step 2 is never double-counted or interfered with.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION increment_auction_bid_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE auctions
    SET bid_count = bid_count + 1
    WHERE id = NEW.auction_id;

    RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION increment_auction_bid_count() FROM PUBLIC;

CREATE TRIGGER trg_bids_increment_auction_bid_count
    AFTER INSERT ON bids
    FOR EACH ROW
    EXECUTE FUNCTION increment_auction_bid_count();

COMMENT ON COLUMN auctions.bid_count IS
    'Total number of bids ever placed on this auction (monotonic; includes cancelled bids and bid increases). Maintained exclusively by trg_bids_increment_auction_bid_count — never updated directly by application code or RPCs.';

COMMENT ON FUNCTION increment_auction_bid_count() IS
    'Synchronization trigger only (no business logic). Increments auctions.bid_count by 1 whenever a row is inserted into bids. Runs within the same transaction as submit_bid(), which already holds a row lock on the auction via lock_auction(), so no additional locking is required here.';

COMMIT;
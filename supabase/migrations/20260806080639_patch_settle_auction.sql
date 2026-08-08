-- ============================================================================
-- Migration: 0056_wallet_entries_clock_timestamp.sql
-- Purpose:   Switch wallet_entries.created_at's default from now() to
--            clock_timestamp().
--
-- Why: now() is frozen for the duration of a transaction — every row
-- inserted within the same transaction gets the identical timestamp.
-- settle_auction() is being patched (see 0057) to insert two sequential,
-- order-dependent wallet_entries rows for a seller (full payment credit,
-- then platform fee debit) within one transaction. If both rows share a
-- timestamp, a UI sorting purely by created_at cannot reliably show
-- "payment received" before "platform fee" — ordering would depend on
-- incidental tie-breaking (e.g. insertion/physical row order) rather than
-- a guaranteed value.
--
-- clock_timestamp() advances on every call, including within a single
-- transaction, so sequential inserts are guaranteed to sort correctly by
-- created_at with no further changes required to any calling function.
-- ============================================================================

BEGIN;

ALTER TABLE wallet_entries
    ALTER COLUMN created_at SET DEFAULT clock_timestamp();

COMMENT ON COLUMN wallet_entries.created_at IS
    'Uses clock_timestamp() (not now()) so that multiple entries inserted within the same transaction — e.g. by settle_auction()''s sequential seller payment + platform fee transfers — receive distinct, correctly ordered timestamps.';

COMMIT;
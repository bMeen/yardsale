-- ============================================================================
-- Migration: 0058_get_wallet_activity.sql
-- Purpose:   Read-only RPC returning the calling user's wallet activity
--            feed, resolved into display-ready rows.
--
-- Direction logic (no entry_type branching required):
--   from = viewer, to = viewer, to.account_type = RESERVED  -> HOLD
--   from = viewer, to = viewer, to.account_type = AVAILABLE -> RELEASE
--   from = viewer, to = someone else (or PLATFORM/SYSTEM)   -> DEBIT
--   from = someone else (or SYSTEM),   to = viewer          -> CREDIT
--
-- This holds uniformly across every entry_type, including the settle_auction()
-- waterfall (0057): a single SETTLEMENT row (winner.RESERVED -> seller.AVAILABLE)
-- resolves to DEBIT when the winner queries this RPC, and CREDIT when the
-- seller does — same row, correct direction for each viewer, with no special
-- casing needed in this function. A SETTLEMENT_FEE row (seller.AVAILABLE ->
-- PLATFORM) has no leg belonging to the winner, so it simply never appears
-- in the winner's feed at all (excluded by the WHERE clause below).
--
-- description is intentionally pre-rendered at write time by whichever
-- helper function created the entry (record_wallet_entry() callers), and
-- is viewer-neutral where a row is shared between two profiles (e.g. the
-- SETTLEMENT row above) — this function does not rewrite or interpret it,
-- only attaches direction/amount context alongside it.
--
-- entry_type is included in the output as a debug/verification aid during
-- frontend development (e.g. confirming a RELEASE row is actually a
-- BID_RELEASE). Not required for display; direction + description already
-- cover that.
--
-- reference_id is intentionally NOT returned — tap-through navigation is
-- handled via notifications, not wallet activity.
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION get_wallet_activity(
    p_page  integer DEFAULT 1,
    p_limit integer DEFAULT 10
)
RETURNS TABLE (
    id             uuid,
    direction      text,
    amount         bigint,
    description    text,
    entry_type     wallet_entry_type,
    reference_type reference_type,
    created_at     timestamptz,
    total_count    bigint
)
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT
        e.id,
        CASE
            WHEN fa.profile_id = auth.uid()
             AND ta.profile_id = auth.uid()
             AND ta.account_type = 'RESERVED' THEN 'HOLD'

            WHEN fa.profile_id = auth.uid()
             AND ta.profile_id = auth.uid()
             AND ta.account_type = 'AVAILABLE' THEN 'RELEASE'

            WHEN fa.profile_id = auth.uid() THEN 'DEBIT'

            WHEN ta.profile_id = auth.uid() THEN 'CREDIT'
        END AS direction,
        e.amount,
        e.description,
        e.entry_type,
        e.reference_type,
        e.created_at,
        count(*) OVER () AS total_count
    FROM wallet_entries e
    JOIN wallet_accounts fa ON fa.id = e.from_account_id
    JOIN wallet_accounts ta ON ta.id = e.to_account_id
    WHERE fa.profile_id = auth.uid()
       OR ta.profile_id = auth.uid()
    ORDER BY e.created_at DESC
    LIMIT p_limit
    OFFSET (GREATEST(p_page, 1) - 1) * p_limit;
$$;

REVOKE EXECUTE ON FUNCTION get_wallet_activity(integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_wallet_activity(integer, integer) TO authenticated;

COMMENT ON FUNCTION get_wallet_activity(integer, integer) IS
    'Returns the calling user''s (auth.uid()) paginated wallet activity, with direction (CREDIT/DEBIT/HOLD/RELEASE) derived from wallet account ownership rather than entry_type. Rows are excluded entirely if neither leg belongs to the caller — e.g. a seller''s SETTLEMENT_FEE debit never appears in the winner''s feed. description is pre-rendered at write time by the entry-creating function; this RPC does not interpret or rewrite it.';

COMMIT;
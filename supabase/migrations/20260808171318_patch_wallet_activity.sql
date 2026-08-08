-- ============================================================================
-- Migration: 0060_get_wallet_activity_security_definer.sql
-- Purpose:   Fix get_wallet_activity() (0058) returning only
--            BID_RESERVATION / BID_RELEASE entries and silently dropping
--            LISTING_FEE, INITIAL_CREDIT, WALLET_RESET, SETTLEMENT, and
--            SETTLEMENT_FEE for authenticated app users.
--
-- Root cause:
--   The function was declared STABLE (invoker rights), so its internal
--   joins to wallet_accounts were subject to that table's RLS policy
--   (profile_id = auth.uid() OR is_admin()) independently for EACH table
--   reference — the fa (from_account) join and the ta (to_account) join
--   are each RLS-filtered BEFORE the INNER JOIN is evaluated, not after.
--
--   For entry types where both legs belong to the viewer (BID_RESERVATION,
--   BID_RELEASE — both AVAILABLE<->RESERVED transfers on the same profile),
--   both joined rows pass RLS independently, so the join succeeds.
--
--   For every other entry type, one leg belongs to PLATFORM or SYSTEM
--   (profile_id IS NULL) or, in the settle_auction() waterfall, to a
--   DIFFERENT user's account. That leg is invisible under RLS to the
--   current caller, so the INNER JOIN produces no row at all for that
--   wallet_entries record — regardless of what the function's own WHERE
--   clause says. The WHERE clause (fa.profile_id = auth.uid() OR
--   ta.profile_id = auth.uid()) was never wrong; it simply never got a
--   chance to evaluate, because RLS had already discarded the row upstream
--   of it.
--
--   This is why querying wallet_entries directly via the Supabase
--   dashboard (running as a role that bypasses RLS) showed all 10 real
--   rows for a settled auction, while the RPC — running with the
--   authenticated caller's own privileges — returned only 5.
--
-- Fix:
--   Switch to SECURITY DEFINER so the function's internal joins are not
--   subject to wallet_accounts RLS. This is safe because the function's
--   WHERE clause was already a correct and sufficient authorization
--   boundary on its own: it hardcodes auth.uid() and accepts no
--   caller-supplied profile_id, so there is no way for a user to see
--   another user's activity even with RLS bypassed internally. This
--   mirrors every write-side wallet RPC in the project (submit_bid(),
--   settle_auction(), etc.), which are SECURITY DEFINER for the same
--   reason: enforce authorization explicitly in the function body rather
--   than relying on table-level RLS for logic that spans account
--   ownership boundaries.
--
-- No change to the function's parameters, query logic, or WHERE clause —
-- only the security attribute. CREATE OR REPLACE is sufficient; no DROP
-- required since the signature is unchanged.
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
SECURITY DEFINER
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
    'Returns the calling user''s (auth.uid()) paginated wallet activity, with direction (CREDIT/DEBIT/HOLD/RELEASE) derived from wallet account ownership. SECURITY DEFINER: internal joins to wallet_accounts must not be subject to that table''s RLS, since legitimate entries routinely involve a second leg (PLATFORM, SYSTEM, or another user''s account in the settlement waterfall) that the caller cannot see under RLS but that the caller is nonetheless entitled to a row for. Authorization is enforced explicitly via the hardcoded auth.uid() WHERE clause, not via RLS.';

COMMIT;
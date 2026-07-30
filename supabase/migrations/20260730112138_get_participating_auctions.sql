-- ============================================================================
-- Migration: 0053_get_participating_auctions.sql
-- Purpose:   Read-only RPC returning auctions the current user has placed at
--            least one bid on (any status — includes cancelled bids, so a
--            user remains a "participant" in history even after being
--            outbid or cancelling). Supports the same category / search /
--            pagination params as the "All" and "My Auctions" client-side
--            queries, and returns rows shaped identically to the
--            AUCTION_FULL_QUERY PostgREST embed so the frontend can treat
--            all three tabs as one FullAuction[] type.
--
-- Why an RPC instead of a PostgREST embed filter:
--   Filtering auctions via bids!inner(bidder_id) would duplicate an auction
--   row once per matching bid (a user can have multiple bid rows on the
--   same auction), which breaks both row uniqueness and count: "exact"
--   pagination math. Resolving to DISTINCT auction_ids first, inside SQL,
--   avoids that entirely.
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION get_participating_auctions(
    p_category auction_category DEFAULT NULL,
    p_search   text            DEFAULT NULL,
    p_page     integer         DEFAULT 1,
    p_limit    integer         DEFAULT 10
)
RETURNS TABLE (
    auction     jsonb,
    total_count bigint
)
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
    WITH participating AS (
        SELECT DISTINCT b.auction_id
        FROM bids b
        WHERE b.bidder_id = auth.uid()
    ),
    filtered AS (
        SELECT a.*
        FROM auctions a
        JOIN participating p ON p.auction_id = a.id
        WHERE (p_category IS NULL OR a.category = p_category)
          AND (p_search IS NULL OR a.title ILIKE '%' || p_search || '%')
    )
    SELECT
        to_jsonb(f) || jsonb_build_object(
            'auction_images', COALESCE(
                (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'storage_path', ai.storage_path,
                            'display_order', ai.display_order
                        )
                        ORDER BY ai.display_order
                    )
                    FROM auction_images ai
                    WHERE ai.auction_id = f.id
                ),
                '[]'::jsonb
            ),
            'highest_bid', (
                SELECT jsonb_build_object(
                    'id', b.id,
                    'bidder_id', b.bidder_id,
                    'amount', b.amount
                )
                FROM bids b
                WHERE b.id = f.highest_bid_id
                -- Returns no rows (→ NULL) when f.highest_bid_id is NULL,
                -- matching PostgREST's null embed for auctions with no bids yet.
            )
        ) AS auction,
        count(*) OVER () AS total_count
    FROM filtered f
    ORDER BY f.created_at DESC
    LIMIT p_limit
    OFFSET (GREATEST(p_page, 1) - 1) * p_limit;
$$;

-- Read-only, but still requires an authenticated caller since it relies on
-- auth.uid(). Follows the same public-RPC grant pattern as our other
-- Stage 9 functions: revoke from PUBLIC, grant only to authenticated.
REVOKE EXECUTE ON FUNCTION get_participating_auctions(auction_category, text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_participating_auctions(auction_category, text, integer, integer) TO authenticated;

COMMENT ON FUNCTION get_participating_auctions(auction_category, text, integer, integer) IS
    'Returns paginated auctions the calling user (auth.uid()) has placed at least one bid on, including cancelled bids. Each row is shaped to match the AUCTION_FULL_QUERY PostgREST embed (auction_images array, highest_bid object-or-null) so the frontend can treat All/My Auctions/Participating as one unified FullAuction type. Read-only — no wallet or auction state is modified.';

COMMIT;
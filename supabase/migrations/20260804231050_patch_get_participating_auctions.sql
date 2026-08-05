-- ============================================================================
-- Migration: 0054_get_participating_auctions_add_status.sql
-- Purpose:   Add an optional p_status filter to get_participating_auctions.
--
-- Note: This changes the function's parameter list, which is part of its
-- identity in Postgres. Per project convention, signature changes require
-- an explicit DROP FUNCTION (old signature) + CREATE FUNCTION (new
-- signature) rather than CREATE OR REPLACE, since DROP wipes existing
-- grants — they are reapplied below.
-- ============================================================================

BEGIN;

DROP FUNCTION IF EXISTS get_participating_auctions(auction_category, text, integer, integer);

CREATE FUNCTION get_participating_auctions(
    p_category auction_category DEFAULT NULL,
    p_status   auction_status   DEFAULT NULL,
    p_search   text             DEFAULT NULL,
    p_page     integer          DEFAULT 1,
    p_limit    integer          DEFAULT 10
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
          AND (p_status IS NULL OR a.status = p_status)
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
            )
        ) AS auction,
        count(*) OVER () AS total_count
    FROM filtered f
    ORDER BY f.created_at DESC
    LIMIT p_limit
    OFFSET (GREATEST(p_page, 1) - 1) * p_limit;
$$;

REVOKE EXECUTE ON FUNCTION get_participating_auctions(auction_category, auction_status, text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_participating_auctions(auction_category, auction_status, text, integer, integer) TO authenticated;

COMMENT ON FUNCTION get_participating_auctions(auction_category, auction_status, text, integer, integer) IS
    'Returns paginated auctions the calling user (auth.uid()) has placed at least one bid on, including cancelled bids. Supports optional category, status, and title-search filters. Each row is shaped to match the AUCTION_FULL_QUERY PostgREST embed so the frontend can treat All/My Auctions/Participating/Watchlist as one unified FullAuction type.';

COMMIT;
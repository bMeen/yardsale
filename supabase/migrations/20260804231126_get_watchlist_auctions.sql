-- ============================================================================
-- Migration: 0055_get_watchlist_auctions.sql
-- Purpose:   Read-only RPC returning auctions on the current user's
--            watchlist. Unlike get_participating_auctions, watchlists has a
--            UNIQUE(profile_id, auction_id) constraint, so a plain
--            watchlists!inner PostgREST embed wouldn't duplicate rows.
--            Implemented as an RPC anyway for interface consistency with
--            the other user-relative tabs (Participating, and previously
--            All/My Auctions via .from()), so the frontend has one uniform
--            calling pattern for "auctions filtered by a related table".
--
-- Ordering:  By watchlists.created_at DESC — most recently added to the
--            watchlist first. This intentionally differs from the other
--            three tabs, which order by auctions.created_at DESC (when the
--            auction was listed). A "saved items" view should surface what
--            the user just added, not what's newest in the marketplace.
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION get_watchlist_auctions(
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
    WITH watched AS (
        SELECT w.auction_id, w.created_at AS watched_at
        FROM watchlists w
        WHERE w.profile_id = auth.uid()
    ),
    filtered AS (
        SELECT a.*, wa.watched_at
        FROM auctions a
        JOIN watched wa ON wa.auction_id = a.id
        WHERE (p_category IS NULL OR a.category = p_category)
          AND (p_status IS NULL OR a.status = p_status)
          AND (p_search IS NULL OR a.title ILIKE '%' || p_search || '%')
    )
    SELECT
        -- Subtract watched_at before serializing: it's a join artifact for
        -- ordering, not an auctions column, and must not leak into the
        -- FullAuction shape the frontend expects.
        (to_jsonb(f) - 'watched_at') || jsonb_build_object(
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
    ORDER BY f.watched_at DESC
    LIMIT p_limit
    OFFSET (GREATEST(p_page, 1) - 1) * p_limit;
$$;

REVOKE EXECUTE ON FUNCTION get_watchlist_auctions(auction_category, auction_status, text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_watchlist_auctions(auction_category, auction_status, text, integer, integer) TO authenticated;

COMMENT ON FUNCTION get_watchlist_auctions(auction_category, auction_status, text, integer, integer) IS
    'Returns paginated auctions on the calling user''s (auth.uid()) watchlist, ordered by most-recently-added. Supports optional category, status, and title-search filters. Row shape matches get_participating_auctions / AUCTION_FULL_QUERY so the frontend treats all list tabs as one unified FullAuction type.';

COMMIT;
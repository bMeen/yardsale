-- ============================================================================
-- Migration: 0062_get_auction_bids.sql
-- Purpose:   Read-only, paginated RPC returning full bid history for an
--            auction — separate from get_auction_detail() (0061), which
--            only carries the caller's own most recent bid (my_bid) and
--            the current leader (highest_bid), not the full list.
--
-- Returns BOTH ACTIVE and CANCELLED bids, ordered created_at DESC. bids is
-- an immutable public ledger by design; the frontend is expected to style
-- cancelled rows differently (e.g. struck through) rather than the
-- backend hiding them.
--
-- bidder is resolved to { id, username, avatar_url } — the same shape as
-- seller/winner/highest_bid.bidder in get_auction_detail() — so a Bid's
-- bidder is represented identically everywhere it appears in the app.
--
-- No AUCTION_NOT_FOUND check here (unlike get_auction_detail()): an
-- invalid or nonexistent p_auction_id simply yields an empty result set
-- with total_count = 0, consistent with how every other paginated list
-- RPC in the app behaves for a filter that matches nothing.
--
-- STABLE — bids and profiles both have public-read RLS, no cross-ownership
-- join involved.
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION get_auction_bids(
    p_auction_id uuid,
    p_page       integer DEFAULT 1,
    p_limit      integer DEFAULT 10
)
RETURNS TABLE (
    id          uuid,
    bidder      jsonb,
    amount      bigint,
    status      bid_status,
    created_at  timestamptz,
    total_count bigint
)
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT
        b.id,
        jsonb_build_object('id', p.id, 'username', p.username, 'avatar_url', p.avatar_url) AS bidder,
        b.amount,
        b.status,
        b.created_at,
        count(*) OVER () AS total_count
    FROM bids b
    JOIN profiles p ON p.id = b.bidder_id
    WHERE b.auction_id = p_auction_id
    ORDER BY b.created_at DESC
    LIMIT p_limit
    OFFSET (GREATEST(p_page, 1) - 1) * p_limit;
$$;

REVOKE EXECUTE ON FUNCTION get_auction_bids(uuid, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_auction_bids(uuid, integer, integer) TO authenticated;

COMMENT ON FUNCTION get_auction_bids(uuid, integer, integer) IS
    'Returns paginated bid history (both ACTIVE and CANCELLED) for an auction, most recent first, with each row''s bidder resolved to { id, username, avatar_url } — matching the profile-embed shape used in get_auction_detail(). Authenticated callers only. No existence check on p_auction_id; an invalid id simply returns an empty page.';

COMMIT;
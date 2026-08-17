-- ============================================================================
-- Migration: 0061_get_auction_detail.sql
-- Purpose:   Read-only RPC returning everything the individual auction
--            screen needs in one call: the full auctions row with its
--            relational fields resolved (seller, winner, images, leading
--            bid), plus viewer-specific context for the calling user.
--
-- Authenticated only (no anonymous access) — matches the product decision
-- that this screen requires login.
--
-- Raw FK columns (seller_id, winner_id, highest_bid_id) are dropped from
-- the output once resolved into their embedded objects, and
-- ending_soon_notified is dropped entirely — it is internal scheduler
-- bookkeeping (used by the watchlist-reminder job) with no use on a
-- user-facing screen.
--
-- highest_bid.bidder and get_auction_bids()'s per-row bidder (0062) both
-- use the same { id, username, avatar_url } shape as seller/winner, so a
-- Bid's bidder is represented identically everywhere it appears in the
-- app — no screen shows a raw bidder_id while another shows a resolved
-- profile for what is conceptually the same entity.
--
-- my_bid is the caller's single most recent bid row on this auction,
-- regardless of status (ORDER BY created_at DESC LIMIT 1) — NOT "most
-- recent ACTIVE". submit_bid() does not mark a bid CANCELLED when a user
-- increases their own leading bid; it simply supersedes it with a new
-- row. Filtering to ACTIVE-only here would either return a stale
-- superseded bid or hide a genuinely cancelled one, both wrong. This
-- also means a paginated bid-history view (0062) cannot reliably answer
-- "what is my current stake" on its own — my_bid exists specifically to
-- answer that in O(1), independent of how deep the caller's real bid sits
-- in a long history.
--
-- is_leading is computed here (comparing highest_bid_id to the caller's
-- own bidder_id) rather than left for the frontend to derive from
-- my_bid.id === highest_bid.id, since the RPC already has both values in
-- hand.
--
-- No cross-ownership RLS concern here (unlike get_wallet_activity(),
-- 0060): auctions, auction_images, bids, and profiles all have
-- public-read RLS, and the watchlists / my_bid lookups are filtered
-- directly by auth.uid(), not joined across a different owner's rows.
-- STABLE (invoker rights) is therefore correct — no SECURITY DEFINER
-- needed. Verify this holds against the actual deployed RLS policies
-- before relying on it, the same caution that applied to the
-- get_wallet_activity() bug.
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION get_auction_detail(p_auction_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_temp
AS $$
declare
  v_result jsonb;
begin
  if not exists (select 1 from auctions where id = p_auction_id) then
    perform raise_business_error(
      'AUCTION_NOT_FOUND',
      'The requested auction does not exist.'
    );
  end if;

  select
    (to_jsonb(a) - 'seller_id' - 'winner_id' - 'highest_bid_id' - 'ending_soon_notified')
    || jsonb_build_object(
        'seller', (
          select jsonb_build_object('id', p.id, 'username', p.username, 'avatar_url', p.avatar_url)
          from profiles p
          where p.id = a.seller_id
        ),
        'winner', (
          select jsonb_build_object('id', p.id, 'username', p.username, 'avatar_url', p.avatar_url)
          from profiles p
          where p.id = a.winner_id
        ),
        'auction_images', coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'storage_path', ai.storage_path,
                'display_order', ai.display_order
              )
              order by ai.display_order
            )
            from auction_images ai
            where ai.auction_id = a.id
          ),
          '[]'::jsonb
        ),
        'highest_bid', (
          select jsonb_build_object(
            'id', b.id,
            'bidder', jsonb_build_object('id', bp.id, 'username', bp.username, 'avatar_url', bp.avatar_url),
            'amount', b.amount,
            'created_at', b.created_at
          )
          from bids b
          join profiles bp on bp.id = b.bidder_id
          where b.id = a.highest_bid_id
        ),
        'is_watchlisted', exists (
          select 1 from watchlists w
          where w.profile_id = auth.uid() and w.auction_id = a.id
        ),
        'my_bid', (
          select jsonb_build_object(
            'id', mb.id,
            'amount', mb.amount,
            'status', mb.status,
            'created_at', mb.created_at
          )
          from bids mb
          where mb.auction_id = a.id and mb.bidder_id = auth.uid()
          order by mb.created_at desc
          limit 1
        ),
        'is_leading', (
          a.highest_bid_id is not null
          and exists (
            select 1 from bids lb
            where lb.id = a.highest_bid_id and lb.bidder_id = auth.uid()
          )
        )
      )
  into v_result
  from auctions a
  where a.id = p_auction_id;

  return v_result;
end;
$$;

REVOKE EXECUTE ON FUNCTION get_auction_detail(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_auction_detail(uuid) TO authenticated;

COMMENT ON FUNCTION get_auction_detail(uuid) IS
    'Returns the full detail payload for a single auction, with seller/winner/highest_bid resolved into embedded profile objects, plus viewer-specific context (is_watchlisted, my_bid, is_leading) for the calling user (auth.uid()). Raises AUCTION_NOT_FOUND if the auction does not exist. Authenticated callers only.';

COMMIT;
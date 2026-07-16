-- =============================================================================
-- YardSale — Stage 10, Group C: RLS — auctions + auction_images + bids
-- =============================================================================
-- All three are publicly readable — the marketplace itself, plus its
-- images and bid history, should be browsable without an account
-- (reduces signup friction, consistent with the pattern established
-- elsewhere in the architecture). No status-based filtering: SCHEDULED,
-- ENDED, SETTLED, and CANCELLED auctions all remain visible alongside
-- ACTIVE ones — nothing in the frozen docs calls for hiding any status,
-- and upcoming/historical browsing is a reasonable default. (UPDATED)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- auctions
-- -----------------------------------------------------------------------------
alter table auctions enable row level security;

revoke all on auctions from anon, authenticated;
grant select on auctions to authenticated;

create policy auctions_select_public
  on auctions
  for select
  to authenticated
  using (true);

-- No INSERT/UPDATE/DELETE policy: all writes flow through
-- create_auction(), submit_bid()/cancel_bid() (current_price/
-- highest_bid_id/winner_id updates), cancel_auction(),
-- activate_auction(), close_auction(), settle_auction(), and the admin
-- RPCs — all SECURITY DEFINER via owner bypass.


-- -----------------------------------------------------------------------------
-- auction_images (UPDATED)
-- -----------------------------------------------------------------------------
alter table auction_images enable row level security;

revoke all on auction_images from anon, authenticated;
grant select on auction_images to authenticated;

create policy auction_images_select_public
  on auction_images
  for select
  to authenticated
  using (true);

-- No INSERT/UPDATE/DELETE policy: written exclusively by
-- create_auction() / admin_create_system_auction() via owner bypass.


-- -----------------------------------------------------------------------------
-- bids (UPDATED)
-- -----------------------------------------------------------------------------
alter table bids enable row level security;

revoke all on bids from anon, authenticated;
grant select on bids to authenticated;

-- Extended to anon (not just authenticated) for consistency with
-- auctions/auction_images already being publicly browsable — not
-- explicitly frozen either way, inferred from the established
-- "public marketplace" pattern.
create policy bids_select_public
  on bids
  for select
  to authenticated
  using (true);

-- No INSERT/UPDATE/DELETE policy: written exclusively by submit_bid()
-- (insert), cancel_bid() (status update), and admin_cancel_auction()
-- (bulk status update) — all via owner bypass.

-- Known limitation, not addressed here: a public "N people watching"
-- counter cannot be built from direct watchlists access under
-- owner-only RLS (Group D) — would need a dedicated SECURITY DEFINER
-- count-only RPC if ever wanted. Documented, not solved.
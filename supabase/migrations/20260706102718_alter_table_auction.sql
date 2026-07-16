-- =============================================================================
-- YardSale — Stage 5: Deferred Constraints
-- =============================================================================
-- The only deferred constraint in the schema: auctions.highest_bid_id
-- references bids(id), while bids.auction_id references auctions(id).
-- This circular relationship cannot be expressed with both FKs declared
-- inline at CREATE TABLE time — one side must be added afterward.
--
-- bids was created after auctions specifically so this ALTER TABLE could
-- run once both tables exist.
--
-- ON DELETE RESTRICT for consistency with the rest of the financial/
-- historical integrity rules, even though bids rows are never deleted in
-- practice (bid cancellation is a status change, not a DELETE).
-- =============================================================================

alter table auctions
  add constraint fk_auctions_highest_bid
  foreign key (highest_bid_id)
  references bids (id)
  on delete restrict;
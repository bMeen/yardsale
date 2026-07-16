-- =============================================================================
-- YardSale — Patch: AUCTION_ENDING_SOON rename + ending_soon_notified column
-- =============================================================================
-- Rename: the original Notification Domain doc specified
-- AUCTION_ENDING_SOON; Stage 2 named the enum value WATCHLIST_ENDING
-- instead. Safe to rename with zero downstream impact — this value was
-- never actually consumed by any create_notification() call in any
-- function written before Stage 12.
--
-- New column: without a "have we already sent this?" marker, a job
-- running every 15 minutes would re-notify every eligible auction on
-- every run until it closes. One-way boolean flag, consistent with how
-- winner_id / settled_at already work — never reset once set.
-- =============================================================================

alter type notification_type rename value 'WATCHLIST_ENDING' to 'AUCTION_ENDING_SOON';

alter table auctions
  add column ending_soon_notified boolean not null default false;

comment on column auctions.ending_soon_notified is
  'Set true once send_watchlist_reminders() has notified the seller, '
  'current highest bidder, and watchlist followers that this auction '
  'ends within 30 minutes. Never reset.';

-- Serves send_watchlist_reminders()'s exact query pattern: ACTIVE
-- auctions not yet notified, ordered/filtered by ends_at.
create index idx_auctions_ending_soon_pending
  on auctions (ends_at)
  where status = 'ACTIVE' and ending_soon_notified = false;
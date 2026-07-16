-- =============================================================================
-- YardSale — Stage 4: Indexes
-- =============================================================================
-- Two categories in this file:
--   A) Structural — enforce a business invariant that couldn't be expressed
--      as a plain table-level UNIQUE constraint (deferred from Stage 3).
--   B) Performance — support the known, already-designed query patterns
--      (My Auctions, My Bids, wallet history, notification feed, the
--      auction-closing cron scan, admin activity).
--
-- Naming convention: idx_<table>_<column(s)>
-- =============================================================================


-- =============================================================================
-- A) Structural Indexes (business invariants)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles: case-insensitive username uniqueness
-- -----------------------------------------------------------------------------
-- Frozen decision: functional unique index over citext extension.
create unique index uq_profiles_username_lower
  on profiles (lower(username));

-- -----------------------------------------------------------------------------
-- wallet_accounts: exactly one PLATFORM account may ever exist
-- -----------------------------------------------------------------------------
-- The plain UNIQUE(profile_id, account_type) constraint from Stage 3 does
-- NOT protect this, because profile_id is NULL for every PLATFORM row and
-- NULLs are never considered equal under standard UNIQUE semantics. A
-- partial index keyed on account_type, scoped to rows where profile_id
-- IS NULL, closes that gap.
create unique index uq_wallet_accounts_single_platform
  on wallet_accounts (account_type)
  where profile_id is null;


-- =============================================================================
-- B) Performance Indexes
-- =============================================================================

-- -----------------------------------------------------------------------------
-- wallet_accounts
-- -----------------------------------------------------------------------------
-- profile_id lookups are already served by the leading column of
-- uq_wallet_accounts_profile_type (Stage 3). This index supports queries
-- that filter by account_type alone (e.g. "fetch the platform account").
create index idx_wallet_accounts_account_type
  on wallet_accounts (account_type);

-- -----------------------------------------------------------------------------
-- wallet_entries
-- -----------------------------------------------------------------------------
-- "My wallet activity" needs to find entries where the user's account is
-- EITHER the sender or the receiver — both directions need an index.
create index idx_wallet_entries_from_account
  on wallet_entries (from_account_id);

create index idx_wallet_entries_to_account
  on wallet_entries (to_account_id);

-- Trace every ledger entry back to the auction/bid/system event that
-- caused it (used by admin investigation tooling and settlement logic).
create index idx_wallet_entries_reference
  on wallet_entries (reference_type, reference_id);

-- Chronological ordering for the wallet activity feed.
create index idx_wallet_entries_created_at
  on wallet_entries (created_at desc);

-- -----------------------------------------------------------------------------
-- auctions
-- -----------------------------------------------------------------------------
-- "My Auctions" (auctions a user created).
create index idx_auctions_seller_id
  on auctions (seller_id);

-- Browsing the marketplace by status (e.g. all ACTIVE auctions).
create index idx_auctions_status
  on auctions (status);

-- Supports process_due_auctions() scanning for SCHEDULED auctions whose
-- starts_at has arrived.
create index idx_auctions_starts_at
  on auctions (starts_at);

-- Composite index is the one that actually matters most operationally:
-- process_due_auctions() runs every minute filtering
-- "status = ACTIVE AND ends_at <= now()" to find auctions to close, and
-- "status = ENDED" (paired with settled_at IS NULL, see below) to find
-- auctions to settle. This composite serves the closing scan directly.
create index idx_auctions_status_ends_at
  on auctions (status, ends_at);

-- Supports the settlement scan: "status = ENDED AND settled_at IS NULL".
create index idx_auctions_pending_settlement
  on auctions (status)
  where settled_at is null;

-- -----------------------------------------------------------------------------
-- auction_images
-- -----------------------------------------------------------------------------
-- No additional index needed — uq_auction_images_auction_display_order
-- (Stage 3) already leads with auction_id, which serves
-- "fetch images for this auction, in order" directly.

-- -----------------------------------------------------------------------------
-- bids
-- -----------------------------------------------------------------------------
-- "My Bids" (bids a user has placed).
create index idx_bids_bidder_id
  on bids (bidder_id);

-- Bid history for a given auction, most recent first — this is the
-- primary access pattern for both the auction detail page and
-- find_next_highest_bid().
create index idx_bids_auction_created_at
  on bids (auction_id, created_at desc);

-- -----------------------------------------------------------------------------
-- watchlists
-- -----------------------------------------------------------------------------
-- profile_id lookups ("My Watchlist") are already served by the leading
-- column of uq_watchlists_profile_auction (Stage 3). auction_id needs its
-- own index for the reverse direction (e.g. "how many users are watching
-- this auction" / watchlist-ending-soon reminders).
create index idx_watchlists_auction_id
  on watchlists (auction_id);

-- -----------------------------------------------------------------------------
-- notifications
-- -----------------------------------------------------------------------------
-- The notification feed: most recent first, per user.
create index idx_notifications_profile_created_at
  on notifications (profile_id, created_at desc);

-- Unread count / unread list per user.
create index idx_notifications_profile_unread
  on notifications (profile_id)
  where is_read = false;

-- -----------------------------------------------------------------------------
-- admin_audit_logs
-- -----------------------------------------------------------------------------
-- Recent admin activity feed.
create index idx_admin_audit_logs_created_at
  on admin_audit_logs (created_at desc);

-- Audit history for a specific target (e.g. "every action taken against
-- this auction" or "every action taken against this user").
create index idx_admin_audit_logs_reference
  on admin_audit_logs (reference_type, reference_id);

-- Actions performed by a given admin (moot with a single admin today,
-- but costs nothing and future-proofs multi-admin support).
create index idx_admin_audit_logs_admin_profile
  on admin_audit_logs (admin_profile_id);
-- =============================================================================
-- YardSale — Stage 2: Enums
-- =============================================================================
-- Purpose: Define every custom PostgreSQL type used across the schema.
-- These map 1:1 to the enums frozen during Phase 4 (Supabase Architecture).
--
-- Naming convention: snake_case, singular type name, UPPER_CASE values.
--
-- Explicitly rejected here:
--   - auction_category as a lookup table (kept as enum — content is stable
--     enough for V1, revisit only if admin-managed categories become a
--     real requirement)
--   - per-domain reference type enums (wallet_reference_type,
--     notification_reference_type, admin_reference_type) — consolidated
--     into a single shared `reference_type`
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Identity Domain
-- -----------------------------------------------------------------------------

create type profile_status as enum (
  'ACTIVE',
  'SUSPENDED',
  'DEACTIVATED'
);

-- Named user_role (not `role`) to avoid ambiguity with PostgreSQL's own
-- ROLE concept (database roles, GRANT/REVOKE, etc.)
create type user_role as enum (
  'USER',
  'ADMIN'
);

-- -----------------------------------------------------------------------------
-- Wallet Domain
-- -----------------------------------------------------------------------------

create type wallet_account_type as enum (
  'AVAILABLE',
  'RESERVED',
  'PLATFORM'
);

create type wallet_entry_type as enum (
  'LISTING_FEE',
  'BID_RESERVATION',
  'BID_RELEASE',
  'SETTLEMENT',
  'SETTLEMENT_FEE',
  'WALLET_RESET'
);

-- -----------------------------------------------------------------------------
-- Auction Domain
-- -----------------------------------------------------------------------------

-- No DRAFT status — auctions are only ever created "real" (SCHEDULED covers
-- future-dated auctions; there is no unpublished/editable pre-state).
create type auction_status as enum (
  'SCHEDULED',
  'ACTIVE',
  'ENDED',
  'SETTLED',
  'CANCELLED'
);

create type auction_category as enum (
  'ELECTRONICS',
  'PHONES_TABLETS',
  'COMPUTERS',
  'HOME_APPLIANCES',
  'FURNITURE',
  'FASHION',
  'BOOKS',
  'SPORTS',
  'TOYS',
  'AUTOMOTIVE',
  'OTHERS'
);

-- Deliberately simplified: no WINNING / OUTBID. "Winning" is derived by
-- comparing bids.id to auctions.highest_bid_id at read time.
create type bid_status as enum (
  'ACTIVE',
  'CANCELLED'
);

-- -----------------------------------------------------------------------------
-- Notification Domain
-- -----------------------------------------------------------------------------

create type notification_type as enum (
  'AUCTION_STARTED',
  'AUCTION_ENDED',
  'OUTBID',
  'BID_CANCELLED',
  'AUCTION_WON',
  'AUCTION_LOST',
  'PAYMENT_RECEIVED',
  'WALLET_RESET',
  'WATCHLIST_ENDING',
  'ADMIN_CANCELLED_AUCTION'
);

-- -----------------------------------------------------------------------------
-- Admin Domain
-- -----------------------------------------------------------------------------

create type admin_action_type as enum (
  'USER_SUSPENDED',
  'USER_DEACTIVATED',
  'AUCTION_CANCELLED',
  'SYSTEM_AUCTION_CREATED',
  'WALLET_RESET_TRIGGERED'
);

-- -----------------------------------------------------------------------------
-- Shared
-- -----------------------------------------------------------------------------

-- Used by wallet_entries.reference_type, notifications.reference_type, and
-- admin_audit_logs.reference_type. One enum, one source of truth for
-- "what kind of business object does this record point at?"
create type reference_type as enum (
  'USER',
  'AUCTION',
  'BID',
  'WALLET',
  'SYSTEM'
);
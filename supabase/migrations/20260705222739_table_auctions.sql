-- =============================================================================
-- YardSale — Stage 3: Tables — Auction Domain
-- =============================================================================
-- auctions is the aggregate root. No separate Listing/Catalog domain exists —
-- item information (title/description/category) lives directly on auctions
-- (frozen decision).
--
-- NOTE: auctions.highest_bid_id is declared here WITHOUT its foreign key.
-- The FK to bids(id) is added in Stage 5 via ALTER TABLE, because bids
-- references auctions(id) — this is the one deliberate circular dependency
-- in the schema, resolved by deferring one side of it.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- auctions
-- -----------------------------------------------------------------------------

create table auctions (
  id              uuid primary key default gen_random_uuid(),

  seller_id       uuid not null references profiles (id) on delete restrict,

  title           text not null,
  description     text not null,
  category        auction_category not null,

  starting_price  bigint not null,
  -- Initialized to starting_price by create_auction() — no DB default,
  -- since it depends on another column's value at insert time.
  current_price   bigint not null,

  -- FK added in Stage 5 (circular dependency with bids).
  highest_bid_id  uuid,

  winner_id       uuid references profiles (id) on delete restrict,

  status          auction_status not null default 'SCHEDULED',

  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  settled_at      timestamptz,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint ck_auctions_starting_price_positive
    check (starting_price > 0),
  constraint ck_auctions_current_price_gte_starting
    check (current_price >= starting_price),
  constraint ck_auctions_starts_before_ends
    check (starts_at < ends_at),
  constraint ck_auctions_title_not_blank
    check (char_length(btrim(title)) > 0),
  constraint ck_auctions_description_not_blank
    check (char_length(btrim(description)) > 0)
);

comment on table auctions is
  'Aggregate root of the Auction Domain. No DRAFT status — SCHEDULED covers '
  'future-dated auctions. Item metadata lives here directly (no Listing '
  'domain). current_price / highest_bid_id / winner_id are intentional '
  'denormalizations for read performance.';

-- -----------------------------------------------------------------------------
-- auction_images
-- -----------------------------------------------------------------------------

create table auction_images (
  id             uuid primary key default gen_random_uuid(),

  auction_id     uuid not null references auctions (id) on delete cascade,

  -- Path within Supabase Storage, not a public URL (frozen decision —
  -- storage identity is stable, URLs/CDNs are not).
  storage_path   text not null,

  display_order  smallint not null,

  created_at     timestamptz not null default now(),

  constraint ck_auction_images_display_order_range
    check (display_order between 1 and 3),
  constraint uq_auction_images_auction_display_order
    unique (auction_id, display_order)
);

comment on table auction_images is
  'Image metadata only — actual files live in Supabase Storage bucket '
  'auction-images. Maximum 3 rows per auction, enforced in create_auction() '
  '(cannot be expressed as a simple table CHECK).';

-- -----------------------------------------------------------------------------
-- bids
-- -----------------------------------------------------------------------------

create table bids (
  id           uuid primary key default gen_random_uuid(),

  auction_id   uuid not null references auctions (id) on delete restrict,
  bidder_id    uuid not null references profiles (id) on delete restrict,

  amount       bigint not null,

  -- Simplified lifecycle: ACTIVE / CANCELLED only. "Winning" and "outbid"
  -- are derived by comparing bids.id to auctions.highest_bid_id — never
  -- stored (frozen decision, avoids dual-state inconsistency).
  status       bid_status not null default 'ACTIVE',

  -- Immutable — no updated_at (every bid increase creates a new row).
  created_at   timestamptz not null default now(),

  constraint ck_bids_amount_positive
    check (amount > 0)
);

comment on table bids is
  'Immutable bid history. Bid increases create new rows rather than '
  'mutating amount. Minimum increment (+1000) is enforced in submit_bid(), '
  'not as a table constraint, since it depends on the auction''s current '
  'highest bid.';

-- -----------------------------------------------------------------------------
-- watchlists
-- -----------------------------------------------------------------------------

create table watchlists (
  id           uuid primary key default gen_random_uuid(),

  profile_id   uuid not null references profiles (id) on delete cascade,
  auction_id   uuid not null references auctions (id) on delete cascade,

  created_at   timestamptz not null default now(),

  constraint uq_watchlists_profile_auction
    unique (profile_id, auction_id)
);

comment on table watchlists is
  'User-to-auction follow relationship. Not a business event — removal is '
  'a hard DELETE, not a status change (unlike bids/wallet_entries). '
  'Sellers watching their own auction is a business rule enforced in '
  'toggle_watchlist(), not here.';
-- =============================================================================
-- YardSale — Stage 3: Tables — Wallet Domain
-- =============================================================================
-- wallet_accounts: projection of current balances (NOT source of truth).
-- wallet_entries:  immutable ledger — the ONLY source of financial truth.
--
-- Critical invariant (enforced from Stage 8 onward, not here):
--   No function other than the wallet_entries trigger may ever write to
--   wallet_accounts.balance.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- wallet_accounts
-- -----------------------------------------------------------------------------

create table wallet_accounts (
  id           uuid primary key default gen_random_uuid(),

  -- NULL only for the single PLATFORM account.
  profile_id   uuid references profiles (id) on delete restrict,

  account_type wallet_account_type not null,

  -- Cached projection, maintained transactionally by the wallet_entries
  -- trigger (Stage 8). Never updated directly by any RPC.
  balance      bigint not null default 0,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint ck_wallet_accounts_balance_non_negative
    check (balance >= 0),

  -- PLATFORM accounts have no owning profile; USER accounts always do.
  constraint ck_wallet_accounts_owner_matches_type
    check (
      (account_type = 'PLATFORM' and profile_id is null)
      or
      (account_type in ('AVAILABLE', 'RESERVED') and profile_id is not null)
    ),

  -- Prevents a user from having two AVAILABLE or two RESERVED accounts.
  -- NOTE: this does NOT protect against multiple PLATFORM accounts, since
  -- profile_id is NULL for all of them (NULLs are distinct under UNIQUE).
  -- The single-platform-account rule is enforced via a partial index in
  -- Stage 4.
  constraint uq_wallet_accounts_profile_type
    unique (profile_id, account_type)
);

comment on table wallet_accounts is
  'Balance projection only. Source of truth is wallet_entries. '
  'balance is written exclusively by the wallet_entries AFTER INSERT trigger.';

-- -----------------------------------------------------------------------------
-- wallet_entries
-- -----------------------------------------------------------------------------

create table wallet_entries (
  id               uuid primary key default gen_random_uuid(),

  from_account_id  uuid not null references wallet_accounts (id) on delete restrict,
  to_account_id    uuid not null references wallet_accounts (id) on delete restrict,

  amount           bigint not null,

  entry_type       wallet_entry_type not null,
  reference_type   reference_type not null,
  reference_id     uuid not null,

  description      text,

  -- Immutable — no updated_at by design (append-only ledger).
  created_at       timestamptz not null default now(),

  constraint ck_wallet_entries_amount_positive
    check (amount > 0),
  constraint ck_wallet_entries_no_self_transfer
    check (from_account_id <> to_account_id)
);

comment on table wallet_entries is
  'Immutable financial ledger. Append-only — no UPDATE or DELETE permitted '
  '(enforced via RLS/grants in later stages). This table is the sole source '
  'of financial truth for the entire platform.';
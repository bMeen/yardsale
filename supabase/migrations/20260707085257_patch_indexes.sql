-- =============================================================================
-- YardSale — Patch: Rename Singleton Account Index
-- =============================================================================
-- Gap 2: the original index (Stage 4) already generalizes to cover any
-- profile-less account_type, since it keys purely on account_type WHERE
-- profile_id IS NULL. It already protects SYSTEM the moment that value
-- exists (0011) — no definition change needed, only a rename so the
-- index name accurately reflects that it now guards two singleton
-- account types (PLATFORM and SYSTEM), not just one.
-- =============================================================================

drop index uq_wallet_accounts_single_platform;

create unique index uq_wallet_accounts_singleton_types
  on wallet_accounts (account_type)
  where profile_id is null;
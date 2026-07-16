-- =============================================================================
-- YardSale — Patch: wallet_accounts Owner/Type Constraint
-- =============================================================================
-- Gap 2: the original CHECK from Stage 3 only recognized PLATFORM as a
-- profile-less singleton account. Now that SYSTEM exists (0011), it must
-- be recognized the same way.
-- =============================================================================

alter table wallet_accounts
  drop constraint ck_wallet_accounts_owner_matches_type;

alter table wallet_accounts
  add constraint ck_wallet_accounts_owner_matches_type
    check (
      (account_type in ('PLATFORM', 'SYSTEM') and profile_id is null)
      or
      (account_type in ('AVAILABLE', 'RESERVED') and profile_id is not null)
    );
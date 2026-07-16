-- =============================================================================
-- YardSale — Bootstrap: Singleton Wallet Accounts
-- =============================================================================
-- Unlike Stage 5.7's throwaway dev/sample seed data, these two rows are
-- REQUIRED in every environment (dev, staging, production) — the system
-- cannot process a single listing fee, settlement, or wallet reset
-- without them existing. This is bootstrap data, not sample data, hence
-- its own dedicated migration rather than living in a seed script.
--
-- Idempotent: safe to re-run. Relies on the partial unique index
-- (0014) as the ON CONFLICT arbiter.
-- =============================================================================

insert into wallet_accounts (account_type, profile_id)
values ('PLATFORM', null)
on conflict (account_type) where profile_id is null do nothing;

insert into wallet_accounts (account_type, profile_id)
values ('SYSTEM', null)
on conflict (account_type) where profile_id is null do nothing;
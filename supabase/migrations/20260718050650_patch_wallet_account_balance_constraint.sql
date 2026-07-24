-- ============================================================================
-- 0053_fix_wallet_accounts_balance_constraint.sql
--
-- PROBLEM
-- -------
-- ck_wallet_accounts_balance_non_negative currently applies to every
-- wallet_accounts row unconditionally, including SYSTEM.
--
-- SYSTEM is a deliberate money-printer per the frozen Wallet Domain design
-- — it mints INITIAL_CREDIT (on signup) and WALLET_RESET (on reset) funds
-- "from nowhere." Every mint debits SYSTEM's balance by the minted amount,
-- which means SYSTEM's balance is *supposed* to go negative and keep
-- going more negative over time (it represents cumulative test-currency
-- printed, not a real backed reserve).
--
-- The blanket non-negative constraint blocks this, so the very first
-- mint — meaning the very first user ever created, seed or real — fails
-- inside initialize_user() with SQLSTATE 23514.
--
-- FIX
-- ---
-- Scope the constraint to real accounts only. AVAILABLE, RESERVED, and
-- PLATFORM must still never go negative (nothing in the business logic
-- should ever legitimately debit them past zero) — only SYSTEM is exempt.
-- ============================================================================

alter table wallet_accounts
  drop constraint if exists ck_wallet_accounts_balance_non_negative;

alter table wallet_accounts
  add constraint ck_wallet_accounts_balance_non_negative
  check (account_type = 'SYSTEM' or balance >= 0);

comment on constraint ck_wallet_accounts_balance_non_negative on wallet_accounts is
  'AVAILABLE, RESERVED, and PLATFORM balances must never go negative. '
  'SYSTEM is exempt — it is a deliberate mint source (INITIAL_CREDIT, '
  'WALLET_RESET) whose balance is expected to go negative and further '
  'negative over time, representing cumulative test-currency printed. '
  'Fixed in 0053 after this blocked every user signup at initialize_user().';


alter table app_config enable row level security;
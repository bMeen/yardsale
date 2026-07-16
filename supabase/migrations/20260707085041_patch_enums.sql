-- =============================================================================
-- YardSale — Patch: Enum Extensions
-- =============================================================================
-- Additive changes surfaced during Stage 7 gap analysis. Each is a plain
-- ALTER TYPE ... ADD VALUE — no existing values are removed or renamed,
-- so nothing already written (Stages 2–10) needs to change as a result
-- of this file itself.
--
-- IMPORTANT: these new values are not referenced by anything in THIS file
-- — Postgres does not allow a newly added enum value to be used in the
-- same transaction that adds it. Every file that consumes these values
-- (0012 onward) runs as its own separate migration/transaction, so this
-- is safe.
-- =============================================================================

-- Gap 2: a real "money minted from nowhere" account, distinct from
-- PLATFORM (fee revenue). Used for initial signup credit and wallet
-- resets. Keeps admin revenue reporting uncontaminated by non-revenue
-- mints.
alter type wallet_account_type add value if not exists 'SYSTEM';

-- Gap 2: distinguishes the first-ever signup credit from a later
-- WALLET_RESET, for cleaner activity history / admin reporting.
alter type wallet_entry_type add value if not exists 'INITIAL_CREDIT';

-- Gap 6: restores notification types present in the original Identity
-- Domain doc but dropped when the enum was first frozen in Stage 2.
alter type notification_type add value if not exists 'ACCOUNT_SUSPENDED';
alter type notification_type add value if not exists 'ACCOUNT_REACTIVATED';

-- Gap 8: reactivation is a distinct auditable admin action, not covered
-- by the existing USER_SUSPENDED / USER_DEACTIVATED values.
alter type admin_action_type add value if not exists 'USER_REACTIVATED';
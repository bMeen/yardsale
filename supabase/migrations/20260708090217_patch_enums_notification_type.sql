-- =============================================================================
-- YardSale — Patch: notification_type — ACCOUNT_DEACTIVATED
-- =============================================================================
-- Gap found while implementing admin_set_user_status() (Stage 7, Group D):
-- ACCOUNT_SUSPENDED and ACCOUNT_REACTIVATED were added in 0011, but
-- ACCOUNT_DEACTIVATED was overlooked despite DEACTIVATED being a valid
-- profile_status and admin_set_user_status() needing to notify the user
-- for all three possible outcomes.
-- =============================================================================

alter type notification_type add value if not exists 'ACCOUNT_DEACTIVATED';
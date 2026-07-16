-- =============================================================================
-- YardSale — Stage 8: Triggers — auth.users → initialize_user()
-- =============================================================================
-- The reason this trigger had to wait until Stage 8: initialize_user()
-- (Stage 7, Group A) had to exist first for this CREATE TRIGGER
-- statement to reference it — this is the exact dependency inversion
-- flagged back in Phase 4 (Private RPCs before Triggers).
--
-- initialize_user() itself already contains the early-exit for the
-- admin's email-provider signup — this trigger fires unconditionally
-- for every auth.users insert, and the function decides internally
-- whether to do anything.
-- =============================================================================

create trigger trg_auth_users_initialize_user
  after insert on auth.users
  for each row
  execute function initialize_user();
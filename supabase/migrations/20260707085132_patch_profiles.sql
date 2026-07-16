-- =============================================================================
-- YardSale — Patch: Placeholder Username Sequence
-- =============================================================================
-- Gap 1: initialize_user() (Stage 7) fires immediately on Google OAuth
-- completion, before the user has chosen a username. This sequence
-- backs a guaranteed-unique placeholder ('user_' || nextval(...)),
-- avoiding UUID-substring collision risk and any retry logic.
--
-- NOTE: the "changeable after a 30-day cooldown" rule was explicitly
-- dropped — usernames may be changed freely at any time via
-- update_profile(), subject only to the existing length/uniqueness
-- constraints from Stage 3. No additional column is needed for cooldown
-- tracking.
-- =============================================================================

create sequence profile_username_seq;

comment on sequence profile_username_seq is
  'Backs placeholder usernames (user_<n>) assigned by initialize_user() '
  'at signup. Users may change their username freely afterward — no '
  'cooldown is enforced.';
-- =============================================================================
-- YardSale — Stage 10, Group D: RLS — watchlists + notifications
-- =============================================================================
-- Both owner-only, `authenticated` scope only (anon has no personal
-- data to read on either table). No admin exception on either — nothing
-- in the frozen RPCs or admin tooling references another user's
-- watchlist or notifications, so no scope creep beyond what's actually
-- required.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- watchlists
-- -----------------------------------------------------------------------------
alter table watchlists enable row level security;

revoke all on watchlists from anon, authenticated;
grant select on watchlists to authenticated;

create policy watchlists_select_owner
  on watchlists
  for select
  to authenticated
  using (profile_id = auth.uid());

-- No INSERT/UPDATE/DELETE policy: exclusively via toggle_watchlist()
-- (owner bypass), which also enforces "cannot watch your own auction."


-- -----------------------------------------------------------------------------
-- notifications
-- -----------------------------------------------------------------------------
alter table notifications enable row level security;

revoke all on notifications from anon, authenticated;
grant select on notifications to authenticated;

create policy notifications_select_owner
  on notifications
  for select
  to authenticated
  using (profile_id = auth.uid());

-- No INSERT policy: written exclusively by create_notification() via
-- owner bypass. No UPDATE policy: read-state changes flow exclusively
-- through mark_notification_read(), which also scopes its own WHERE
-- clause to profile_id = auth.uid() — RLS forcing this route isn't
-- redundant with that check, it's what prevents anyone from bypassing
-- mark_notification_read() entirely via a direct UPDATE statement.
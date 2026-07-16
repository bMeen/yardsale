-- =============================================================================
-- YardSale — Stage 10, Group A: RLS — profiles
-- =============================================================================
-- Two-layer defense: table-level GRANTs control whether a role can even
-- attempt an operation; RLS policies then control which rows. Every
-- mutation on this table flows through initialize_user() (INSERT) or
-- update_profile() (UPDATE), both SECURITY DEFINER functions that write
-- via the table-owner bypass — RLS never restricts them regardless of
-- what policies exist here.
--
-- IMPORTANT — never apply FORCE ROW LEVEL SECURITY to this or any
-- other table. By default, Postgres table owners bypass RLS entirely;
-- that owner-bypass is the exact mechanism every SECURITY DEFINER
-- function in this system relies on to write through RLS-locked
-- tables. FORCE ROW LEVEL SECURITY revokes that owner exemption and
-- would break every write-performing function simultaneously.
--
-- Confirmed decision: full-row public read, including role and status
-- columns — Postgres RLS is row-level, not column-level, and
-- restricting those two columns specifically would require a separate
-- view (new schema surface not in the frozen design) for limited
-- privacy benefit.  (UPDATED)
-- =============================================================================

alter table profiles enable row level security;

-- Table-level grants: only SELECT is ever granted directly. No role
-- gets direct INSERT/UPDATE/DELETE — those are exclusively performed
-- by SECURITY DEFINER functions via the owner bypass. (UPDATED)
revoke all on profiles from anon, authenticated;
grant select on profiles to authenticated;

-- Public read: anyone (including unauthenticated visitors browsing the
-- marketplace) can see any profile. (UPDATED)
create policy profiles_select_public
  on profiles
  for select
  to authenticated
  using (true);

-- No INSERT policy: rows are created exclusively by initialize_user()
-- via the owner bypass.

-- No UPDATE policy: all edits flow through update_profile(), which
-- validates username/full_name and blocks changes to role/status.
-- Expressing "user can update these columns but not role/status"
-- directly in RLS would require column-level GRANTs — heavier
-- machinery than just routing through the existing RPC.

-- No DELETE policy: profiles are never hard-deleted (DEACTIVATED status
-- instead).
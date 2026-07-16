-- =============================================================================
-- YardSale — Patch: is_admin() / is_profile_admin() for RLS Use
-- =============================================================================
-- Gap found during Stage 10 analysis: both functions were plain
-- LANGUAGE SQL STABLE with no SECURITY DEFINER, which was safe for
-- every call site so far (always from inside an already-SECURITY
-- DEFINER function, inheriting its elevated ambient role). Stage 10
-- calls these directly from RLS policy expressions, which evaluate
-- under the ORIGINAL querying role (anon/authenticated) — there is no
-- enclosing privileged context to inherit.
--
-- Two corrections:
--   1. SECURITY DEFINER + search_path hardening, so is_admin()'s own
--      internal query against profiles is never subject to profiles'
--      RLS policy (avoiding a fragile dependency and any recursion
--      risk).
--   2. EXECUTE granted to `authenticated` only (not anon) — every RLS
--      policy that references these functions is scoped to `TO
--      authenticated`, so anon callers are denied at the role-match
--      level before the policy body (and therefore is_admin()) ever
--      evaluates. Granting to anon as well would be unnecessary
--      surface area.
-- =============================================================================

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from profiles
    where id = auth.uid()
      and role = 'ADMIN'
  );
$$;

create or replace function is_profile_admin(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from profiles
    where id = p_profile_id
      and role = 'ADMIN'
  );
$$;

grant execute on function is_admin() to authenticated;
grant execute on function is_profile_admin(uuid) to authenticated;
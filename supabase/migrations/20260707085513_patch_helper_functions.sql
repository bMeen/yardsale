-- =============================================================================
-- YardSale — Patch: Helper Functions (Singleton Accounts + Profile Admin Check)
-- =============================================================================
-- Three additions surfaced during Stage 7 gap analysis. Same rules as
-- Stage 6: no business logic, no transaction control, EXECUTE revoked
-- from PUBLIC.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- get_platform_account_id()
-- -----------------------------------------------------------------------------
-- Looks up the single PLATFORM wallet account (bootstrapped in 0015).
-- Used by settle_auction() and create_auction() (listing fee) instead of
-- querying wallet_accounts inline in every RPC.
create or replace function get_platform_account_id()
returns uuid
language sql
stable
as $$
  select id
  from wallet_accounts
  where account_type = 'PLATFORM'
  limit 1;
$$;

-- -----------------------------------------------------------------------------
-- get_system_account_id()
-- -----------------------------------------------------------------------------
-- Looks up the single SYSTEM wallet account (bootstrapped in 0015).
-- Used by initialize_user() (initial credit) and reset_wallet()
-- (WALLET_RESET), so these mint operations never touch PLATFORM
-- (revenue) accounting.
create or replace function get_system_account_id()
returns uuid
language sql
stable
as $$
  select id
  from wallet_accounts
  where account_type = 'SYSTEM'
  limit 1;
$$;

-- -----------------------------------------------------------------------------
-- is_profile_admin()
-- -----------------------------------------------------------------------------
-- Distinct from is_admin(): is_admin() checks the CURRENT SESSION's
-- caller (auth.uid()), which is meaningless in a cron context where
-- there is no session. This checks an arbitrary profile passed by the
-- caller — used by settle_auction() to check whether an auction's
-- SELLER is an admin (system auction), not who is currently invoking
-- the function.
create or replace function is_profile_admin(p_profile_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from profiles
    where id = p_profile_id
      and role = 'ADMIN'
  );
$$;


-- =============================================================================
-- Permissions
-- =============================================================================

revoke execute on function get_platform_account_id() from public;
revoke execute on function get_system_account_id() from public;
revoke execute on function is_profile_admin(uuid) from public;
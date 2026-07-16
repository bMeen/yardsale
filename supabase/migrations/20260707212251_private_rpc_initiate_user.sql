-- =============================================================================
-- YardSale — Stage 7 (Group A): initialize_user()
-- =============================================================================
-- Private RPC. Fires via the auth.users AFTER INSERT trigger (Stage 8).
-- Never called directly — and structurally CANNOT be, since trigger
-- functions (return type `trigger`) can only be invoked by the trigger
-- mechanism itself, not via SELECT/PostgREST. REVOKE EXECUTE FROM PUBLIC
-- is therefore omitted here — it would be a no-op.
--
-- IMPORTANT — supersedes an earlier framing in Phase 3.1: that phase
-- described initialize_user() as a controlled onboarding RPC where
-- failure leaves the user "authenticated but not onboarded, able to
-- retry." Once the implementation moved to an auth.users AFTER INSERT
-- trigger (Phase 4.3), that framing no longer holds — a trigger function
-- runs INSIDE the same transaction as the row it's reacting to. If this
-- function raises, the entire transaction rolls back, including the
-- auth.users insert itself. This is intentional and stronger: it
-- guarantees no auth identity can ever exist without a profile + wallet,
-- with zero exceptions, rather than allowing a half-onboarded state to
-- persist. The later, more specific decision (trigger-based) supersedes
-- the earlier, more general one (retry-based RPC).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- default_wallet_balance_kobo()
-- -----------------------------------------------------------------------------
-- The frozen ₦1,000,000 figure serves two purposes that are the same
-- number for the same reason: the initial signup credit, and the
-- wallet-reset target balance. One shared constant avoids two
-- coincidentally-equal magic numbers living in different functions.
create or replace function default_wallet_balance_kobo()
returns bigint
language sql
immutable
as $$
  select 100000000::bigint; -- ₦1,000,000.00
$$;

revoke execute on function default_wallet_balance_kobo() from public;


-- -----------------------------------------------------------------------------
-- initialize_user()
-- -----------------------------------------------------------------------------
create or replace function initialize_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_username      text;
  v_full_name     text;
  v_avatar_url    text;
  v_available_id  uuid;
  v_reserved_id   uuid;
  v_system_id     uuid;
begin
  -- Admin authenticates via email/password (frozen decision). Only
  -- Google OAuth signups get a marketplace profile + wallet. The admin's
  -- profile is created manually — see 0017_admin_bootstrap.sql.
  if new.raw_app_meta_data ->> 'provider' = 'email' then
    return new;
  end if;

  v_username := 'user_' || nextval('profile_username_seq')::text;

  -- Google's metadata shape varies slightly by Supabase version/config —
  -- coalesce across the keys actually observed, with a final fallback
  -- so profile creation never fails on missing metadata.
  v_full_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    'YardSale User'
  );

  v_avatar_url := coalesce(
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'picture'
  );

  insert into profiles (id, username, full_name, avatar_url, status, role)
  values (new.id, v_username, v_full_name, v_avatar_url, 'ACTIVE', 'USER');

  insert into wallet_accounts (profile_id, account_type)
  values (new.id, 'AVAILABLE')
  returning id into v_available_id;

  insert into wallet_accounts (profile_id, account_type)
  values (new.id, 'RESERVED')
  returning id into v_reserved_id;

  v_system_id := get_system_account_id();

  -- Money minted from the SYSTEM account, not PLATFORM — this is not
  -- platform fee revenue, it's a non-revenue test-currency mint.
  --
  -- reference_type = 'SYSTEM' here, matching the frozen WALLET_RESET
  -- mapping (entry_type WALLET_RESET -> reference_type SYSTEM from the
  -- original Wallet Domain design). INITIAL_CREDIT and WALLET_RESET are
  -- twin operations — both mint money into a user's AVAILABLE account
  -- with no real business-object row behind them — so they share the
  -- same reference_type for consistency. reference_id is the affected
  -- profile_id in both cases, since reference_id is NOT NULL and there
  -- is no other natural target.
  perform record_wallet_entry(
    p_from_account_id => v_system_id,
    p_to_account_id   => v_available_id,
    p_amount          => default_wallet_balance_kobo(),
    p_entry_type      => 'INITIAL_CREDIT',
    p_reference_type  => 'SYSTEM',
    p_reference_id    => new.id,
    p_description     => 'Initial signup credit'
  );

  return new;
end;
$$;
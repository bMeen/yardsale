-- ============================================================================
-- 0052_fix_initialize_user_admin_discriminator.sql
--
-- PROBLEM
-- -------
-- initialize_user() currently early-exits when
--   NEW.raw_app_meta_data ->> 'provider' = 'email'
-- as a proxy for "this is the admin account, skip profile/wallet creation."
--
-- supabase.auth.admin.createUser() ALSO defaults new users to
-- provider = 'email' unless explicitly overridden, which any dev/seed
-- account created via the Admin API would trigger — silently skipping
-- profile + wallet initialization for every seed user.
--
-- FIX
-- ---
-- Replace the provider-based discriminator with an explicit check against
-- the real admin auth.users.id, stored in a small config table rather than
-- hardcoded into function source (so rotating the admin account later
-- doesn't require a DROP/CREATE of this function).
--
-- Everything else below is your existing initialize_user() body, unchanged
-- — only the discriminator condition at the top is replaced. This is NOT
-- a rewrite of your wallet/profile logic.
--
-- ORDERING
-- --------
-- Apply this migration immediately after 0017 (admin bootstrap), since it
-- needs the real admin UUID that 0017 creates. Not part of the automated
-- 0001-0016 + 0018-0051 push.
-- ============================================================================

do $$
declare
  v_admin_id uuid := '48811e36-f1b2-4f0d-8dc1-b43c42c6db24';
begin
  if v_admin_id = '00000000-0000-0000-0000-000000000000' then
    raise exception
      'ADMIN_UUID_PLACEHOLDER_NOT_REPLACED';
  end if;

  create table if not exists app_config (
    key   text primary key,
    value text not null
  );

  insert into app_config (key, value)
  values ('admin_user_id', v_admin_id::text)
  on conflict (key) do update set value = excluded.value;
end $$;

-- ----------------------------------------------------------------------------
-- Same signature (trigger function, no args) — CREATE OR REPLACE is safe
-- per the frozen rule (signature changes only would require DROP + CREATE).
-- ----------------------------------------------------------------------------

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
  v_admin_id      uuid;
begin
  -- Admin is now identified by UUID, not auth provider. This is the only
  -- change from the previous version of this function — the provider
  -- check broke the moment seed/dev accounts (also provider='email' via
  -- the Admin API) needed to go through the normal init path. The admin's
  -- profile continues to be created manually — see 0017_admin_bootstrap.sql.
  select value::uuid into v_admin_id
  from app_config
  where key = 'admin_user_id';

  if v_admin_id is not null and new.id = v_admin_id then
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

comment on function initialize_user() is
  'AFTER INSERT trigger on auth.users. Skips initialization for the single '
  'admin account (matched by app_config.admin_user_id — changed from a '
  'provider=email check in migration 0052 so seed/dev accounts created via '
  'the Admin API are not mistaken for the admin), otherwise creates profile '
  '+ wallet accounts + initial credit exactly as before.';
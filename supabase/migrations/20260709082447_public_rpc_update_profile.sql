-- =============================================================================
-- YardSale — Stage 9, Group A: update_profile()
-- =============================================================================
-- Public RPC. Callable only by an authenticated user, updating their own
-- profile. No is_admin() guard — editing your own display identity is
-- not "marketplace participation," so the admin is allowed to call this
-- for themselves (gap-analysis decision #12).
--
-- Gated by assert_profile_active() per the blanket Stage 9 policy (gap-
-- analysis decision #8): a suspended/deactivated user cannot change
-- their profile.
--
-- Partial update: any parameter left NULL keeps its existing value.
-- There is deliberately no way to clear avatar_url back to NULL via
-- this function in V1 (would need an explicit sentinel/flag) — not a
-- requirement surfaced anywhere in the frozen docs, so not built now.
-- =============================================================================

create or replace function update_profile(
  p_username   text default null,
  p_full_name  text default null,
  p_avatar_url text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_id uuid := auth.uid();
begin
  perform assert_profile_active(v_caller_id);

  -- Pre-validate before hitting raw table constraints, so the caller
  -- gets a clean business error code rather than a generic Postgres
  -- constraint-violation message.
  if p_username is not null and char_length(p_username) not between 3 and 30 then
    perform raise_business_error(
      'INVALID_USERNAME_LENGTH',
      'Username must be between 3 and 30 characters.'
    );
  end if;

  if p_full_name is not null and char_length(btrim(p_full_name)) = 0 then
    perform raise_business_error(
      'INVALID_FULL_NAME',
      'Full name cannot be blank.'
    );
  end if;

  begin
    update profiles
    set username   = coalesce(p_username, username),
        full_name  = coalesce(p_full_name, full_name),
        avatar_url = coalesce(p_avatar_url, avatar_url)
    where id = v_caller_id;

    if not found then
      perform raise_business_error(
        'PROFILE_NOT_FOUND',
        'No profile exists for the current user.'
      );
    end if;
  exception
    when unique_violation then
      perform raise_business_error(
        'USERNAME_TAKEN',
        'This username is already in use.'
      );
  end;
end;
$$;

revoke execute on function update_profile(text, text, text) from public;
grant execute on function update_profile(text, text, text) to authenticated;
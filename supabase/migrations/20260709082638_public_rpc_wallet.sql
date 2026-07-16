-- =============================================================================
-- YardSale — Stage 9, Group B: reset_wallet() + get_wallet_summary()
-- =============================================================================
-- Both are Public RPCs, authenticated-only.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- reset_wallet()
-- -----------------------------------------------------------------------------
-- Resets the caller's AVAILABLE balance back to
-- default_wallet_balance_kobo() (₦1,000,000), only when their current
-- balance is at or below wallet_reset_threshold_kobo() (₦100,000).
--
-- Explicit is_admin() guard: admin has no wallet accounts at all (frozen
-- decision), so without this check the account lookup below would
-- simply fail with a generic WALLET_ACCOUNT_NOT_FOUND — this gives a
-- clearer, more accurate error instead (gap-analysis decision #8).
--
-- Money is minted from the SYSTEM account (not PLATFORM), same
-- reasoning as initialize_user()'s initial credit — this is not fee
-- revenue.
create or replace function reset_wallet()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_id       uuid := auth.uid();
  v_available_id    uuid;
  v_system_id       uuid;
  v_current_balance bigint;
  v_top_up          bigint;
begin
  perform assert_profile_active(v_caller_id);

  if is_admin() then
    perform raise_business_error(
      'ADMIN_HAS_NO_WALLET',
      'Administrator accounts do not have wallets to reset.'
    );
  end if;

  select id, balance into v_available_id, v_current_balance
  from wallet_accounts
  where profile_id = v_caller_id
    and account_type = 'AVAILABLE'
  for update;

  if not found then
    perform raise_business_error(
      'WALLET_ACCOUNT_NOT_FOUND',
      'No wallet account exists for the current user.'
    );
  end if;

  if v_current_balance > wallet_reset_threshold_kobo() then
    perform raise_business_error(
      'WALLET_RESET_NOT_ALLOWED',
      format(
        'Wallet reset is only available when your available balance is %s or below.',
        format_naira(wallet_reset_threshold_kobo())
      )
    );
  end if;

  v_system_id := get_system_account_id();
  v_top_up    := default_wallet_balance_kobo() - v_current_balance;

  perform record_wallet_entry(
    p_from_account_id => v_system_id,
    p_to_account_id   => v_available_id,
    p_amount          => v_top_up,
    p_entry_type      => 'WALLET_RESET',
    p_reference_type  => 'SYSTEM',
    p_reference_id    => v_caller_id,
    p_description     => 'Wallet reset to default balance'
  );

  -- No reference_type/reference_id — there is no specific business
  -- object for the frontend to navigate to from this notification
  -- (unlike e.g. AUCTION_WON, which links to the auction).
  perform create_notification(
    p_profile_id     => v_caller_id,
    p_type           => 'WALLET_RESET',
    p_title          => 'Wallet reset',
    p_message        => format(
      'Your wallet has been reset to %s.',
      format_naira(default_wallet_balance_kobo())
    ),
    p_reference_type => null,
    p_reference_id   => null
  );
end;
$$;

revoke execute on function reset_wallet() from public;
grant execute on function reset_wallet() to authenticated;


-- -----------------------------------------------------------------------------
-- get_wallet_summary()
-- -----------------------------------------------------------------------------
-- Read-only convenience aggregation: available balance, reserved
-- balance, and the 20 most recent ledger entries touching either of the
-- caller's own accounts (as sender OR receiver — a single wallet_entry
-- doesn't "belong" to one account, so both directions must be checked).
-- Returns jsonb so the frontend gets everything in one call instead of
-- 2-3 separate queries.
--
-- No is_admin() guard needed: this is read-only and harmless even for
-- an admin profile (would simply raise WALLET_ACCOUNT_NOT_FOUND, same
-- as any profile with no wallet accounts).
create or replace function get_wallet_summary()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_id         uuid := auth.uid();
  v_available_id      uuid;
  v_reserved_id       uuid;
  v_available_balance bigint;
  v_reserved_balance  bigint;
  v_recent_entries    jsonb;
begin
  select id, balance into v_available_id, v_available_balance
  from wallet_accounts
  where profile_id = v_caller_id
    and account_type = 'AVAILABLE';

  select id, balance into v_reserved_id, v_reserved_balance
  from wallet_accounts
  where profile_id = v_caller_id
    and account_type = 'RESERVED';

  if v_available_id is null or v_reserved_id is null then
    perform raise_business_error(
      'WALLET_ACCOUNT_NOT_FOUND',
      'No wallet accounts exist for the current user.'
    );
  end if;

  -- LIMIT must apply BEFORE aggregation (hence the subquery) — jsonb_agg
  -- over an unlimited outer query would aggregate every matching row,
  -- not just the most recent 20.
  select coalesce(jsonb_agg(entry_json order by created_at desc), '[]'::jsonb)
  into v_recent_entries
  from (
    select
      we.created_at,
      jsonb_build_object(
        'id',          we.id,
        'direction',   case
                         when we.from_account_id in (v_available_id, v_reserved_id)
                         then 'debit'
                         else 'credit'
                       end,
        'amount',      we.amount,
        'entry_type',  we.entry_type,
        'description', we.description,
        'created_at',  we.created_at
      ) as entry_json
    from wallet_entries we
    where we.from_account_id in (v_available_id, v_reserved_id)
       or we.to_account_id   in (v_available_id, v_reserved_id)
    order by we.created_at desc
    limit 20
  ) sub;

  return jsonb_build_object(
    'available_balance', v_available_balance,
    'reserved_balance',  v_reserved_balance,
    'recent_entries',    v_recent_entries
  );
end;
$$;

revoke execute on function get_wallet_summary() from public;
grant execute on function get_wallet_summary() to authenticated;
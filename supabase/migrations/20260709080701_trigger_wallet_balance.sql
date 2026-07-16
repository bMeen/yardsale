-- =============================================================================
-- YardSale — Stage 8: Triggers — Wallet Balance Projection
-- =============================================================================
-- This is the single most important trigger in the system. It is the
-- ONLY mechanism permitted to modify wallet_accounts.balance — every
-- function written so far (record_wallet_entry, initialize_user,
-- close_auction/settle_auction, the admin RPCs) has assumed this rule
-- holds true; this trigger is what actually makes it true.
--
-- SECURITY DEFINER is required here: this trigger fires on wallet_entries
-- but writes to a DIFFERENT table (wallet_accounts), which Stage 10 will
-- lock down via RLS to allow no direct UPDATE for any role. The trigger
-- must bypass that restriction to perform its projection regardless of
-- who/what inserted the triggering wallet_entries row.
--
-- Does NOT set updated_at explicitly — the UPDATE statements below fire
-- wallet_accounts' own BEFORE UPDATE trigger (trg_wallet_accounts_set_
-- updated_at, from 0024) automatically, so setting it here would be
-- redundant.
--
-- Relies on the balance >= 0 CHECK constraint (Stage 3) as the backstop:
-- if a debit would ever take a balance negative — which should never
-- happen given the reservation/settlement invariants maintained
-- throughout every RPC — this trigger's UPDATE fails loudly with a
-- constraint violation rather than silently corrupting state.
-- =============================================================================

create or replace function project_wallet_entry_to_balances()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update wallet_accounts
  set balance = balance - new.amount
  where id = new.from_account_id;

  update wallet_accounts
  set balance = balance + new.amount
  where id = new.to_account_id;

  return new;
end;
$$;

create trigger trg_wallet_entries_project_balance
  after insert on wallet_entries
  for each row
  execute function project_wallet_entry_to_balances();

revoke execute on function project_wallet_entry_to_balances() from public;
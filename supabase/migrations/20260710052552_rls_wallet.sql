-- =============================================================================
-- YardSale — Stage 10, Group B: RLS — wallet_accounts + wallet_entries
-- =============================================================================
-- Both scoped to `authenticated` only — anon has no legitimate reason
-- to query wallet data, so these tables are closed to anon entirely at
-- the role-match level (no policy applies, no evaluation of is_admin()
-- ever occurs for an anon caller here).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- wallet_accounts
-- -----------------------------------------------------------------------------
alter table wallet_accounts enable row level security;

revoke all on wallet_accounts from anon, authenticated;
grant select on wallet_accounts to authenticated;

-- Owner sees their own AVAILABLE/RESERVED accounts. Admin additionally
-- sees the PLATFORM/SYSTEM accounts (profile_id IS NULL for both, so
-- `profile_id = auth.uid()` alone would never match them — is_admin()
-- is what grants that visibility, needed for revenue monitoring).
create policy wallet_accounts_select_owner_or_admin
  on wallet_accounts
  for select
  to authenticated
  using (
    profile_id = auth.uid()
    or is_admin()
  );

-- No INSERT/UPDATE/DELETE policy: accounts are created exclusively by
-- initialize_user() (via owner bypass); balance is written exclusively
-- by the wallet_entries projection trigger (also via owner bypass, per
-- the frozen invariant that no function may update balance directly).


-- -----------------------------------------------------------------------------
-- wallet_entries
-- -----------------------------------------------------------------------------
alter table wallet_entries enable row level security;

revoke all on wallet_entries from anon, authenticated;
grant select on wallet_entries to authenticated;

-- A ledger entry doesn't "belong" to one account — it references two
-- (from_account_id / to_account_id). Ownership here means EITHER side
-- of the transfer belongs to the caller. Necessary for full paginated
-- wallet history (get_wallet_summary() only returns the most recent 20
-- entries as a convenience aggregate; direct table access is still
-- needed for "see all my wallet activity").
create policy wallet_entries_select_owner_or_admin
  on wallet_entries
  for select
  to authenticated
  using (
    is_admin()
    or exists (
      select 1
      from wallet_accounts wa
      where wa.id in (wallet_entries.from_account_id, wallet_entries.to_account_id)
        and wa.profile_id = auth.uid()
    )
  );

-- No INSERT/UPDATE/DELETE policy: append-only ledger, written
-- exclusively by record_wallet_entry() via owner bypass. No role ever
-- gets direct write access, not even the caller who triggered the
-- entry — every write goes through the RPC layer's validation first.
-- =============================================================================
-- YardSale — Stage 8: Triggers — updated_at Maintenance
-- =============================================================================
-- Category: Data Integrity (per the frozen trigger philosophy — triggers
-- maintain synchronization/integrity, never business workflows).
--
-- Applies to every mutable table with an updated_at column: profiles,
-- auctions, wallet_accounts. Immutable tables (wallet_entries, bids,
-- notifications-as-history, admin_audit_logs) deliberately have no
-- updated_at at all, so this trigger is never attached to them.
-- =============================================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_set_updated_at
  before update on profiles
  for each row
  execute function set_updated_at();

create trigger trg_auctions_set_updated_at
  before update on auctions
  for each row
  execute function set_updated_at();

create trigger trg_wallet_accounts_set_updated_at
  before update on wallet_accounts
  for each row
  execute function set_updated_at();
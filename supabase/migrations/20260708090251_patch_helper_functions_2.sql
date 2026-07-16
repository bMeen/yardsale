-- =============================================================================
-- YardSale — Patch: determine_initial_auction_status() helper
-- =============================================================================
-- Both admin_create_system_auction() (Stage 7, Group D) and the future
-- create_auction() (Stage 9) need identical logic: SCHEDULED if starts_at
-- is in the future, ACTIVE if it's now or in the past. Centralized here
-- rather than duplicating the ternary in both places.
-- =============================================================================

create or replace function determine_initial_auction_status(p_starts_at timestamptz)
returns auction_status
language sql
stable
as $$
  select case
    when p_starts_at > now() then 'SCHEDULED'::auction_status
    else 'ACTIVE'::auction_status
  end;
$$;

revoke execute on function determine_initial_auction_status(timestamptz) from public;
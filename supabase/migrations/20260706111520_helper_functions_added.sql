-- -----------------------------------------------------------------------------
-- listing_fee_kobo()
-- -----------------------------------------------------------------------------
-- Frozen: fixed ₦300 listing fee, charged on auction creation. Centralized
-- here rather than hardcoded in create_auction() (Stage 7).
create or replace function listing_fee_kobo()
returns bigint
language sql
immutable
as $$
  select 30000::bigint; -- ₦300.00
$$;

-- -----------------------------------------------------------------------------
-- platform_fee_rate()
-- -----------------------------------------------------------------------------
-- Frozen: 3% platform fee on the winning bid at settlement. Exposed as
-- its own function (rather than inlined only in
-- calculate_settlement_fee()) so the raw rate is available if ever
-- needed for display/reporting (e.g. admin revenue breakdown).
create or replace function platform_fee_rate()
returns numeric
language sql
immutable
as $$
  select 0.03::numeric; -- 3%
$$;

-- -----------------------------------------------------------------------------
-- calculate_settlement_fee()
-- -----------------------------------------------------------------------------
-- Centralizes the settlement fee calculation, including rounding, so
-- settle_auction() (Stage 7) never performs this arithmetic inline.
-- Rounds to the nearest kobo — since amounts are bigint, a fee
-- calculation on an odd winning bid (e.g. ₦33,333) must resolve to a
-- whole kobo value.
create or replace function calculate_settlement_fee(p_winning_bid_kobo bigint)
returns bigint
language sql
immutable
as $$
  select round(p_winning_bid_kobo * platform_fee_rate())::bigint;
$$;

-- =============================================================================
-- Permissions
-- =============================================================================

revoke execute on function listing_fee_kobo() from public;
revoke execute on function platform_fee_rate() from public;
revoke execute on function calculate_settlement_fee(bigint) from public;
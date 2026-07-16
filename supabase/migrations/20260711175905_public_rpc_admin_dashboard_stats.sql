-- =============================================================================
-- YardSale — get_admin_dashboard_stats()
-- =============================================================================
-- Gap found during post-migration analysis: this was a stated PRD
-- requirement from the very first product conversation ("Admin should
-- be able to get a general stats about the activities on the app") but
-- was never implemented across Stages 7-9 — every admin MODERATION
-- action was built, but the admin REPORTING requirement was missed
-- entirely until this pass.
--
-- Revenue breakdown note: system-auction settlements route the FULL
-- winning bid to PLATFORM under entry_type = 'SETTLEMENT' (no
-- seller-payout leg exists for those), while normal auctions use
-- 'SETTLEMENT' for the SELLER's payout and a separate
-- 'SETTLEMENT_FEE' for the platform's cut. Filtering by
-- to_account_id = platform first (rather than relying on entry_type
-- alone) correctly captures both cases without any fragile
-- description-text matching.
-- =============================================================================

create or replace function get_admin_dashboard_stats()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_platform_id uuid;
  v_result      jsonb;
begin
  if not is_admin() then
    perform raise_business_error(
      'NOT_AUTHORIZED',
      'Only an administrator may view platform statistics.'
    );
  end if;

  v_platform_id := get_platform_account_id();

  select jsonb_build_object(
    'users', jsonb_build_object(
      'total',       (select count(*) from profiles where role = 'USER'),
      'active',      (select count(*) from profiles where role = 'USER' and status = 'ACTIVE'),
      'suspended',   (select count(*) from profiles where role = 'USER' and status = 'SUSPENDED'),
      'deactivated', (select count(*) from profiles where role = 'USER' and status = 'DEACTIVATED')
    ),
    'auctions', jsonb_build_object(
      'total',     (select count(*) from auctions),
      'scheduled', (select count(*) from auctions where status = 'SCHEDULED'),
      'active',    (select count(*) from auctions where status = 'ACTIVE'),
      'ended',     (select count(*) from auctions where status = 'ENDED'),
      'settled',   (select count(*) from auctions where status = 'SETTLED'),
      'cancelled', (select count(*) from auctions where status = 'CANCELLED')
    ),
    'bids', jsonb_build_object(
      'total', (select count(*) from bids)
    ),
    'revenue', jsonb_build_object(
      'total_kobo', coalesce(
        (select sum(amount) from wallet_entries where to_account_id = v_platform_id),
        0
      ),
      'listing_fees_kobo', coalesce(
        (select sum(amount) from wallet_entries
         where to_account_id = v_platform_id and entry_type = 'LISTING_FEE'),
        0
      ),
      -- Covers both normal-auction SETTLEMENT_FEE and system-auction
      -- SETTLEMENT (full amount) — see header comment.
      'settlement_revenue_kobo', coalesce(
        (select sum(amount) from wallet_entries
         where to_account_id = v_platform_id
           and entry_type in ('SETTLEMENT_FEE', 'SETTLEMENT')),
        0
      )
    ),
    'recent_24h', jsonb_build_object(
      'new_users', (
        select count(*) from profiles
        where role = 'USER' and created_at >= now() - interval '24 hours'
      ),
      'new_auctions', (
        select count(*) from auctions
        where created_at >= now() - interval '24 hours'
      ),
      'completed_auctions', (
        select count(*) from auctions
        where status = 'SETTLED' and settled_at >= now() - interval '24 hours'
      )
    )
  )
  into v_result;

  return v_result;
end;
$$;

revoke execute on function get_admin_dashboard_stats() from public;
grant execute on function get_admin_dashboard_stats() to authenticated;
-- =============================================================================
-- YardSale — Stage 7, Group C: activate_auction() + process_due_auctions()
-- =============================================================================
-- process_due_auctions() is the SOLE cron entry point (Stage 12) for the
-- entire auction lifecycle. It never contains business logic itself —
-- it only scans for due auctions and delegates to the three lifecycle
-- functions (activate_auction, close_auction, settle_auction), all of
-- which are independently idempotent and lockable.
--
-- Three sequential scans per run: activate all due, THEN close all due,
-- THEN settle all due. No auction can match more than one phase's WHERE
-- condition at the same instant, so there's no ordering conflict between
-- auctions across phases.
--
-- Failure isolation: each auction is processed inside its own nested
-- BEGIN...EXCEPTION block, which PL/pgSQL implements via an implicit
-- savepoint. A failure on one auction rolls back only that auction's
-- partial work and is logged via RAISE WARNING — the rest of the run
-- continues unaffected. No dead-letter table (frozen decision).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- activate_auction()
-- -----------------------------------------------------------------------------
-- SCHEDULED -> ACTIVE. Idempotent (no-op if not currently SCHEDULED).
-- Notifies the seller their auction is now live — the first practical
-- use of the AUCTION_STARTED notification type.
create or replace function activate_auction(p_auction_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_auction auctions;
begin
  v_auction := lock_auction(p_auction_id);

  if v_auction.status <> 'SCHEDULED' then
    return;
  end if;

  update auctions
  set status = 'ACTIVE'
  where id = p_auction_id;

  perform create_notification(
    p_profile_id     => v_auction.seller_id,
    p_type           => 'AUCTION_STARTED',
    p_title          => 'Your auction is now live',
    p_message        => format('"%s" is now accepting bids.', v_auction.title),
    p_reference_type => 'AUCTION',
    p_reference_id   => v_auction.id
  );
end;
$$;

revoke execute on function activate_auction(uuid) from public;

-- -----------------------------------------------------------------------------
-- process_due_auctions()
-- -----------------------------------------------------------------------------
-- The only function Supabase Cron ever calls for auction lifecycle
-- processing (Stage 12). Pure orchestration — no direct table writes of
-- its own beyond what activate_auction() / close_auction() /
-- settle_auction() already perform.
create or replace function process_due_auctions()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_auction_id uuid;
begin
  -- Phase 1: activate SCHEDULED auctions whose start time has arrived.
  for v_auction_id in
    select id
    from auctions
    where status = 'SCHEDULED'
      and starts_at <= now()
  loop
    begin
      perform activate_auction(v_auction_id);
    exception when others then
      raise warning
        'process_due_auctions: failed to activate auction %: %',
        v_auction_id, sqlerrm;
    end;
  end loop;

  -- Phase 2: close ACTIVE auctions whose end time has passed.
  for v_auction_id in
    select id
    from auctions
    where status = 'ACTIVE'
      and ends_at <= now()
  loop
    begin
      perform close_auction(v_auction_id);
    exception when others then
      raise warning
        'process_due_auctions: failed to close auction %: %',
        v_auction_id, sqlerrm;
    end;
  end loop;

  -- Phase 3: settle ENDED auctions not yet settled.
  for v_auction_id in
    select id
    from auctions
    where status = 'ENDED'
      and settled_at is null
  loop
    begin
      perform settle_auction(v_auction_id);
    exception when others then
      raise warning
        'process_due_auctions: failed to settle auction %: %',
        v_auction_id, sqlerrm;
    end;
  end loop;
end;
$$;

revoke execute on function process_due_auctions() from public;
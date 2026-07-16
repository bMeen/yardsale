-- =============================================================================
-- YardSale — Stage 6: Helper Functions (Internal Services)
-- =============================================================================
-- These are Layer 3 of the backend architecture: reusable building blocks
-- called by Private RPCs (Stage 7) and Public RPCs (Stage 9). They are
-- NEVER called directly by the frontend.
--
-- Security model:
--   - These functions default to SECURITY INVOKER (Postgres default).
--     They don't need SECURITY DEFINER themselves — when called from
--     within a SECURITY DEFINER RPC, the "current user" is already the
--     definer's role for the duration of that call, so privileges flow
--     through automatically.
--   - EXECUTE is explicitly revoked from PUBLIC at the end of this file,
--     since Postgres grants it by default on creation. This is what
--     actually prevents the frontend from calling these directly via
--     PostgREST, regardless of what a Stage 9 RPC calls internally.
--
-- Rule enforced throughout: no function here starts or commits a
-- transaction, and no function here acquires a row lock except
-- lock_auction() — which is the ONLY function permitted to lock the
-- auctions row (avoids nested-lock/deadlock risk).
-- =============================================================================


-- =============================================================================
-- Shared
-- =============================================================================

-- -----------------------------------------------------------------------------
-- raise_business_error()
-- -----------------------------------------------------------------------------
-- Centralized business-error mechanism. p_code is the stable, exact-match
-- string the frontend reacts to (e.g. 'INSUFFICIENT_AVAILABLE_BALANCE') —
-- it is returned verbatim as the exception MESSAGE, never wrapped in
-- prose, so the frontend can do a plain equality check rather than
-- parsing free text. p_detail carries the human-readable explanation in
-- the exception DETAIL field for logging/debugging.
--
-- All business errors share one custom SQLSTATE ('YS001'), letting
-- callers distinguish "expected business rule violation" from "unexpected
-- database error" at the ERRCODE level if ever needed, while precise
-- identification comes from the exact-match code in MESSAGE.
create or replace function raise_business_error(
  p_code   text,
  p_detail text default null
)
returns void
language plpgsql
as $$
begin
  raise exception using
    errcode = 'YS001',
    message = p_code,
    detail  = coalesce(p_detail, p_code);
end;
$$;

-- -----------------------------------------------------------------------------
-- is_admin()
-- -----------------------------------------------------------------------------
-- Single source of truth for "is the current authenticated user an admin?"
-- Every RLS policy and RPC that needs an admin check calls this rather
-- than repeating the role lookup inline.
create or replace function is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from profiles
    where id = auth.uid()
      and role = 'ADMIN'
  );
$$;

-- -----------------------------------------------------------------------------
-- assert_profile_active()
-- -----------------------------------------------------------------------------
-- Guards any business operation that requires the acting profile to be in
-- good standing. Distinguishes SUSPENDED vs DEACTIVATED so the frontend
-- can show an accurate message.
create or replace function assert_profile_active(p_profile_id uuid)
returns void
language plpgsql
as $$
declare
  v_status profile_status;
begin
  select status into v_status
  from profiles
  where id = p_profile_id;

  if v_status is null then
    perform raise_business_error(
      'PROFILE_NOT_FOUND',
      'No profile exists for the given id.'
    );
  elsif v_status = 'SUSPENDED' then
    perform raise_business_error(
      'PROFILE_SUSPENDED',
      'This account is currently suspended.'
    );
  elsif v_status = 'DEACTIVATED' then
    perform raise_business_error(
      'PROFILE_DEACTIVATED',
      'This account has been deactivated.'
    );
  end if;
end;
$$;


-- =============================================================================
-- Wallet Services
-- =============================================================================

-- -----------------------------------------------------------------------------
-- record_wallet_entry()
-- -----------------------------------------------------------------------------
-- The single generic primitive for every financial movement in the
-- system (bid reservation, bid release, settlement, listing fee, wallet
-- reset). It does exactly one thing: write one immutable ledger row.
--
-- It deliberately does NOT touch wallet_accounts.balance — that's the
-- exclusive responsibility of the wallet_entries AFTER INSERT trigger
-- (Stage 8). This collapses what were earlier discussed as three
-- separate helpers (reserve_funds / release_reserved_funds /
-- transfer_funds) into one, since all three are identical at the ledger
-- level — they only differ in which accounts and entry_type are passed
-- in.
--
-- Also deliberately does NOT validate balance — that's
-- assert_wallet_balance()'s job, called separately by the orchestrating
-- RPC before this is invoked.
create or replace function record_wallet_entry(
  p_from_account_id uuid,
  p_to_account_id   uuid,
  p_amount          bigint,
  p_entry_type      wallet_entry_type,
  p_reference_type  reference_type,
  p_reference_id    uuid,
  p_description     text default null
)
returns uuid
language plpgsql
as $$
declare
  v_entry_id uuid;
begin
  insert into wallet_entries (
    from_account_id, to_account_id, amount,
    entry_type, reference_type, reference_id, description
  )
  values (
    p_from_account_id, p_to_account_id, p_amount,
    p_entry_type, p_reference_type, p_reference_id, p_description
  )
  returning id into v_entry_id;

  return v_entry_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- assert_wallet_balance()
-- -----------------------------------------------------------------------------
-- Validates sufficient balance AND locks the account row (SELECT ... FOR
-- UPDATE) for the remainder of the transaction. This is our concurrency
-- control mechanism (row locking, not a version column — frozen
-- decision) preventing two concurrent operations from both reading a
-- stale balance and over-drawing the same account.
create or replace function assert_wallet_balance(
  p_account_id uuid,
  p_amount     bigint
)
returns void
language plpgsql
as $$
declare
  v_balance bigint;
begin
  select balance into v_balance
  from wallet_accounts
  where id = p_account_id
  for update;

  if not found then
    perform raise_business_error(
      'WALLET_ACCOUNT_NOT_FOUND',
      'No wallet account exists for the given id.'
    );
  end if;

  if v_balance < p_amount then
    perform raise_business_error(
      'INSUFFICIENT_AVAILABLE_BALANCE',
      format('Required %s, available %s.', p_amount, v_balance)
    );
  end if;
end;
$$;


-- =============================================================================
-- Auction Services
-- =============================================================================

-- -----------------------------------------------------------------------------
-- minimum_bid_increment_kobo()
-- -----------------------------------------------------------------------------
-- Centralizes the frozen ₦1,000 minimum bid increment as a single
-- constant (in kobo, matching our bigint-in-kobo monetary storage
-- convention) rather than hardcoding it inline in validate_bid_amount().
create or replace function minimum_bid_increment_kobo()
returns bigint
language sql
immutable
as $$
  select 100000::bigint; -- ₦1,000.00
$$;

-- -----------------------------------------------------------------------------
-- lock_auction()
-- -----------------------------------------------------------------------------
-- The ONLY function in the system permitted to acquire a row lock on
-- auctions. Every bidding/cancellation/settlement RPC calls this exactly
-- once at the start of its transaction; no helper function locks the
-- auction again after this.
create or replace function lock_auction(p_auction_id uuid)
returns auctions
language plpgsql
as $$
declare
  v_auction auctions;
begin
  select *
  into v_auction
  from auctions
  where id = p_auction_id
  for update;

  if not found then
    perform raise_business_error(
      'AUCTION_NOT_FOUND',
      'No auction exists for the given id.'
    );
  end if;

  return v_auction;
end;
$$;

-- -----------------------------------------------------------------------------
-- validate_auction_state()
-- -----------------------------------------------------------------------------
-- Confirms the (already-locked) auction is currently biddable. Checks
-- both status and ends_at defensively, in case process_due_auctions()
-- hasn't yet run for an auction whose end time has technically passed.
create or replace function validate_auction_state(p_auction auctions)
returns void
language plpgsql
as $$
begin
  if p_auction.status <> 'ACTIVE' then
    perform raise_business_error(
      'AUCTION_NOT_ACTIVE',
      'This auction is not currently accepting bids.'
    );
  end if;

  if p_auction.ends_at <= now() then
    perform raise_business_error(
      'AUCTION_NOT_ACTIVE',
      'This auction has already ended.'
    );
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- validate_bid_amount()
-- -----------------------------------------------------------------------------
-- Enforces: seller cannot bid on their own auction, and the bid must
-- clear the current price by at least the minimum increment.
create or replace function validate_bid_amount(
  p_auction   auctions,
  p_bidder_id uuid,
  p_amount    bigint
)
returns void
language plpgsql
as $$
begin
  if p_auction.seller_id = p_bidder_id then
    perform raise_business_error(
      'SELLER_CANNOT_BID',
      'You cannot bid on your own auction.'
    );
  end if;

  if p_amount < p_auction.current_price + minimum_bid_increment_kobo() then
    perform raise_business_error(
      'BID_TOO_LOW',
      format(
        'Bid must be at least %s.',
        p_auction.current_price + minimum_bid_increment_kobo()
      )
    );
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- find_next_highest_bid()
-- -----------------------------------------------------------------------------
-- Returns the current highest ACTIVE bid for an auction, or a null row
-- if none exist (e.g. after the sole bidder cancels). Ties are prevented
-- by validate_bid_amount() in normal operation; created_at ASC is kept
-- as a defensive tie-break only.
create or replace function find_next_highest_bid(p_auction_id uuid)
returns bids
language sql
stable
as $$
  select *
  from bids
  where auction_id = p_auction_id
    and status = 'ACTIVE'
  order by amount desc, created_at asc
  limit 1;
$$;

-- -----------------------------------------------------------------------------
-- update_auction_leader()
-- -----------------------------------------------------------------------------
-- Recomputes auctions.current_price and auctions.highest_bid_id from the
-- bids table. Assumes the auction row is already locked by the caller
-- (via lock_auction()) — does not lock again itself. Falls back to
-- starting_price / NULL when no active bids remain.
create or replace function update_auction_leader(p_auction_id uuid)
returns void
language plpgsql
as $$
declare
  v_next_bid bids;
  v_starting bigint;
begin
  v_next_bid := find_next_highest_bid(p_auction_id);

  select starting_price into v_starting
  from auctions
  where id = p_auction_id;

  if v_next_bid.id is null then
    update auctions
    set current_price  = v_starting,
        highest_bid_id = null
    where id = p_auction_id;
  else
    update auctions
    set current_price  = v_next_bid.amount,
        highest_bid_id = v_next_bid.id
    where id = p_auction_id;
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- create_bid_record()
-- -----------------------------------------------------------------------------
-- Pure insert into bids. All validation happens before this is called.
create or replace function create_bid_record(
  p_auction_id uuid,
  p_bidder_id  uuid,
  p_amount     bigint
)
returns bids
language plpgsql
as $$
declare
  v_bid bids;
begin
  insert into bids (auction_id, bidder_id, amount)
  values (p_auction_id, p_bidder_id, p_amount)
  returning * into v_bid;

  return v_bid;
end;
$$;


-- =============================================================================
-- Notification Service
-- =============================================================================

-- -----------------------------------------------------------------------------
-- create_notification()
-- -----------------------------------------------------------------------------
-- The exclusive writer of notifications. RPCs never insert into
-- notifications directly.
create or replace function create_notification(
  p_profile_id     uuid,
  p_type           notification_type,
  p_title          text,
  p_message        text,
  p_reference_type reference_type default null,
  p_reference_id   uuid default null
)
returns uuid
language plpgsql
as $$
declare
  v_notification_id uuid;
begin
  insert into notifications (
    profile_id, type, title, message, reference_type, reference_id
  )
  values (
    p_profile_id, p_type, p_title, p_message, p_reference_type, p_reference_id
  )
  returning id into v_notification_id;

  return v_notification_id;
end;
$$;


-- =============================================================================
-- Admin Service
-- =============================================================================

-- -----------------------------------------------------------------------------
-- write_audit_log()
-- -----------------------------------------------------------------------------
-- The exclusive writer of admin_audit_logs. Also enforces the frozen
-- rule that USER_SUSPENDED / USER_DEACTIVATED / AUCTION_CANCELLED require
-- a non-blank reason — centralized here rather than duplicated across
-- every admin RPC that calls it.
create or replace function write_audit_log(
  p_admin_profile_id uuid,
  p_action_type      admin_action_type,
  p_reference_type   reference_type,
  p_reference_id     uuid default null,
  p_reason           text default null
)
returns uuid
language plpgsql
as $$
declare
  v_log_id uuid;
begin
  if p_action_type in ('USER_SUSPENDED', 'USER_DEACTIVATED', 'AUCTION_CANCELLED')
     and (p_reason is null or char_length(btrim(p_reason)) = 0) then
    perform raise_business_error(
      'ADMIN_REASON_REQUIRED',
      'A reason is required for this administrative action.'
    );
  end if;

  insert into admin_audit_logs (
    admin_profile_id, action_type, reference_type, reference_id, reason
  )
  values (
    p_admin_profile_id, p_action_type, p_reference_type, p_reference_id, p_reason
  )
  returning id into v_log_id;

  return v_log_id;
end;
$$;


-- =============================================================================
-- Permissions — lock these down as private (frontend must never call
-- these directly via PostgREST)
-- =============================================================================

revoke execute on function raise_business_error(text, text) from public;
revoke execute on function is_admin() from public;
revoke execute on function assert_profile_active(uuid) from public;
revoke execute on function record_wallet_entry(uuid, uuid, bigint, wallet_entry_type, reference_type, uuid, text) from public;
revoke execute on function assert_wallet_balance(uuid, bigint) from public;
revoke execute on function minimum_bid_increment_kobo() from public;
revoke execute on function lock_auction(uuid) from public;
revoke execute on function validate_auction_state(auctions) from public;
revoke execute on function validate_bid_amount(auctions, uuid, bigint) from public;
revoke execute on function find_next_highest_bid(uuid) from public;
revoke execute on function update_auction_leader(uuid) from public;
revoke execute on function create_bid_record(uuid, uuid, bigint) from public;
revoke execute on function create_notification(uuid, notification_type, text, text, reference_type, uuid) from public;
revoke execute on function write_audit_log(uuid, admin_action_type, reference_type, uuid, text) from public;
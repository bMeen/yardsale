-- =============================================================================
-- YardSale — Patch: admin_cancel_auction() Correctness Fix + New Constants
-- =============================================================================
-- Bug found during Stage 9 gap analysis, tracing submit_bid()'s
-- outbid-release mechanics:
--
--   The moment a bidder is outbid, their reservation is released
--   IMMEDIATELY (not when the auction ends, not when they explicitly
--   cancel) — per the original walkthrough: "No wallet action needed
--   because funds were already released when she was outbid." This
--   means at any instant, ONLY the current leader (auctions.
--   highest_bid_id) has money actually reserved for a given auction.
--   Every other bidder's bid row stays ACTIVE (historical fact) but
--   carries zero live reservation.
--
--   The original admin_cancel_auction() (0023) looped over
--   DISTINCT ON (bidder_id) across ALL active bids and released each
--   historical bidder's highest amount — crediting money that had
--   already been returned to non-leading bidders, creating value from
--   nowhere. This patch corrects it to release only the current
--   leader's single reservation, while still notifying every distinct
--   historical bidder (notifications don't move money, so that part of
--   the original design was already correct).
-- =============================================================================

create or replace function admin_cancel_auction(
  p_auction_id uuid,
  p_reason     text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_id           uuid := auth.uid();
  v_auction             auctions;
  v_leader_bidder_id    uuid;
  v_bidder_reserved_id  uuid;
  v_bidder_available_id uuid;
  v_notify_bidder       record;
begin
  if not is_admin() then
    perform raise_business_error(
      'NOT_AUTHORIZED',
      'Only an administrator may perform this action.'
    );
  end if;

  v_auction := lock_auction(p_auction_id);

  if v_auction.status not in ('SCHEDULED', 'ACTIVE', 'ENDED') then
    perform raise_business_error(
      'AUCTION_CANNOT_BE_CANCELLED',
      format('Auctions in status %s cannot be cancelled.', v_auction.status)
    );
  end if;

  -- Release only the current leader's reservation, if one exists.
  -- current_price at this point equals exactly what the leader has
  -- reserved for this specific auction (their single net reservation,
  -- maintained by submit_bid()'s increment-only-the-difference logic).
  if v_auction.highest_bid_id is not null then
    select bidder_id into v_leader_bidder_id
    from bids
    where id = v_auction.highest_bid_id;

    select id into v_bidder_reserved_id
    from wallet_accounts
    where profile_id = v_leader_bidder_id
      and account_type = 'RESERVED';

    select id into v_bidder_available_id
    from wallet_accounts
    where profile_id = v_leader_bidder_id
      and account_type = 'AVAILABLE';

    perform record_wallet_entry(
      p_from_account_id => v_bidder_reserved_id,
      p_to_account_id   => v_bidder_available_id,
      p_amount          => v_auction.current_price,
      p_entry_type      => 'BID_RELEASE',
      p_reference_type  => 'BID',
      p_reference_id    => v_auction.highest_bid_id,
      p_description     => 'Reservation released — auction cancelled by admin'
    );
  end if;

  -- Notify every distinct historical bidder — purely informational,
  -- doesn't move money, so no wording claiming funds were "just"
  -- released (only true for the leader).
  for v_notify_bidder in
    select distinct bidder_id
    from bids
    where auction_id = p_auction_id
      and status = 'ACTIVE'
  loop
    perform create_notification(
      p_profile_id     => v_notify_bidder.bidder_id,
      p_type           => 'ADMIN_CANCELLED_AUCTION',
      p_title          => 'Auction cancelled',
      p_message        => format(
        '"%s" was cancelled by an administrator. Reason: %s.',
        v_auction.title,
        p_reason
      ),
      p_reference_type => 'AUCTION',
      p_reference_id   => v_auction.id
    );
  end loop;

  update bids
  set status = 'CANCELLED'
  where auction_id = p_auction_id
    and status = 'ACTIVE';

  update auctions
  set status = 'CANCELLED'
  where id = p_auction_id;

  perform create_notification(
    p_profile_id     => v_auction.seller_id,
    p_type           => 'ADMIN_CANCELLED_AUCTION',
    p_title          => 'Your auction was cancelled',
    p_message        => format(
      '"%s" was cancelled by an administrator. Reason: %s. The listing fee is non-refundable.',
      v_auction.title,
      p_reason
    ),
    p_reference_type => 'AUCTION',
    p_reference_id   => v_auction.id
  );

  perform write_audit_log(
    p_admin_profile_id => v_caller_id,
    p_action_type      => 'AUCTION_CANCELLED',
    p_reference_type   => 'AUCTION',
    p_reference_id     => v_auction.id,
    p_reason           => p_reason
  );
end;
$$;

revoke execute on function admin_cancel_auction(uuid, text) from public;


-- =============================================================================
-- New constants needed for Stage 9
-- =============================================================================

-- -----------------------------------------------------------------------------
-- wallet_reset_threshold_kobo()
-- -----------------------------------------------------------------------------
-- Frozen: users may reset their wallet when available balance is <=
-- ₦100,000. Centralized here rather than hardcoded inline in
-- reset_wallet() (Stage 9), consistent with every other monetary
-- constant.
create or replace function wallet_reset_threshold_kobo()
returns bigint
language sql
immutable
as $$
  select 10000000::bigint; -- ₦100,000.00
$$;

revoke execute on function wallet_reset_threshold_kobo() from public;

-- -----------------------------------------------------------------------------
-- minimum_auction_duration()
-- -----------------------------------------------------------------------------
-- New rule (this patch): auctions must run for at least 20 minutes.
-- Prevents an auction from being created with both starts_at and
-- ends_at in the past relative to each other in a way that leaves no
-- real bidding window before the next cron tick closes it. Centralized
-- as an interval constant, following the same pattern as every other
-- business-rule number in the system.
create or replace function minimum_auction_duration()
returns interval
language sql
immutable
as $$
  select interval '20 minutes';
$$;

revoke execute on function minimum_auction_duration() from public;
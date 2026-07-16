-- =============================================================================
-- YardSale — Stage 9, Group D: submit_bid() + cancel_bid()
-- =============================================================================
-- Both incorporate the critical correction from Stage 9 gap analysis:
-- the moment a bidder is outbid, their reservation is released
-- IMMEDIATELY — not at auction end, not at explicit cancellation. At
-- any instant, only auctions.highest_bid_id's bidder has a live
-- reservation on a given auction; every other bid row is historical
-- fact with zero live money behind it.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- submit_bid()
-- -----------------------------------------------------------------------------
-- Single entry point covering both a first bid and a bid increase —
-- there is no separate place_bid()/increase_bid() split (merged
-- decision from the original design discussion). The backend decides
-- which case applies; the frontend just says "I want to bid this
-- amount."
--
-- Reservation sizing (the critical correction): only reserve the
-- incremental difference (p_amount - current_price) when the CALLER is
-- currently the leader — their existing reservation is still live in
-- that case. In every other case (no prior bid, or a prior bid that
-- was since outbid and already released), the caller has ZERO live
-- reservation on this auction, so the FULL p_amount must be reserved.
create or replace function submit_bid(
  p_auction_id uuid,
  p_amount     bigint
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_id            uuid := auth.uid();
  v_auction              auctions;
  v_old_leader_bidder_id uuid;
  v_old_leader_bid_id    uuid;
  v_reserve_amount       bigint;
  v_caller_available_id  uuid;
  v_caller_reserved_id   uuid;
  v_new_bid              bids;
  v_old_reserved_id      uuid;
  v_old_available_id     uuid;
begin
  perform assert_profile_active(v_caller_id);

  if is_admin() then
    perform raise_business_error(
      'ADMIN_CANNOT_PARTICIPATE',
      'Administrators cannot bid on auctions.'
    );
  end if;

  v_auction := lock_auction(p_auction_id);

  perform validate_auction_state(v_auction);
  perform validate_bid_amount(v_auction, v_caller_id, p_amount);

  v_old_leader_bid_id := v_auction.highest_bid_id;

  if v_old_leader_bid_id is not null then
    select bidder_id into v_old_leader_bidder_id
    from bids
    where id = v_old_leader_bid_id;
  end if;

  if v_old_leader_bidder_id = v_caller_id then
    -- Increasing our own leading bid: only the difference needs
    -- reserving, since current_price is already sitting in our
    -- RESERVED account.
    v_reserve_amount := p_amount - v_auction.current_price;
  else
    -- No prior bid, or a prior bid that was already outbid (and
    -- therefore already released) — zero live reservation right now,
    -- so the full amount must be reserved.
    v_reserve_amount := p_amount;
  end if;

  select id into v_caller_available_id
  from wallet_accounts
  where profile_id = v_caller_id and account_type = 'AVAILABLE';

  select id into v_caller_reserved_id
  from wallet_accounts
  where profile_id = v_caller_id and account_type = 'RESERVED';

  perform assert_wallet_balance(v_caller_available_id, v_reserve_amount);

  v_new_bid := create_bid_record(p_auction_id, v_caller_id, p_amount);

  perform record_wallet_entry(
    p_from_account_id => v_caller_available_id,
    p_to_account_id   => v_caller_reserved_id,
    p_amount          => v_reserve_amount,
    p_entry_type      => 'BID_RESERVATION',
    p_reference_type  => 'BID',
    p_reference_id    => v_new_bid.id,
    p_description     => 'Bid reservation'
  );

  perform update_auction_leader(p_auction_id);

  -- Genuine outbid of a DIFFERENT bidder: release their reservation
  -- immediately and notify them. Skipped entirely when the caller is
  -- increasing their own leading bid (v_old_leader_bidder_id =
  -- v_caller_id in that case).
  if v_old_leader_bidder_id is not null and v_old_leader_bidder_id <> v_caller_id then
    select id into v_old_reserved_id
    from wallet_accounts
    where profile_id = v_old_leader_bidder_id and account_type = 'RESERVED';

    select id into v_old_available_id
    from wallet_accounts
    where profile_id = v_old_leader_bidder_id and account_type = 'AVAILABLE';

    perform record_wallet_entry(
      p_from_account_id => v_old_reserved_id,
      p_to_account_id   => v_old_available_id,
      p_amount          => v_auction.current_price,
      p_entry_type      => 'BID_RELEASE',
      p_reference_type  => 'BID',
      p_reference_id    => v_old_leader_bid_id,
      p_description     => 'Reservation released — outbid'
    );

    perform create_notification(
      p_profile_id     => v_old_leader_bidder_id,
      p_type           => 'OUTBID',
      p_title          => 'You have been outbid',
      p_message        => format(
        'Someone placed a higher bid on "%s". The new highest bid is %s.',
        v_auction.title,
        format_naira(p_amount)
      ),
      p_reference_type => 'AUCTION',
      p_reference_id   => v_auction.id
    );
  end if;

  return v_new_bid.id;
end;
$$;

revoke execute on function submit_bid(uuid, bigint) from public;
grant execute on function submit_bid(uuid, bigint) to authenticated;


-- -----------------------------------------------------------------------------
-- cancel_bid()
-- -----------------------------------------------------------------------------
-- Pure status-flip. No wallet operation whatsoever — a cancellable bid
-- (by definition, not the current leader) already carries zero live
-- reservation, released back to AVAILABLE the instant its bidder was
-- outbid. No notification either: BID_CANCELLED is intentionally
-- unused, since a user doesn't need to be told about their own action.
--
-- Frozen rule: cancellable only while NOT the current highest bidder
-- ("Option C" from the original bid-cancellation discussion).
create or replace function cancel_bid(p_bid_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_id uuid := auth.uid();
  v_bid       bids;
  v_auction   auctions;
begin
  perform assert_profile_active(v_caller_id);

  if is_admin() then
    perform raise_business_error(
      'ADMIN_CANNOT_PARTICIPATE',
      'Administrators cannot place or cancel bids.'
    );
  end if;

  select * into v_bid
  from bids
  where id = p_bid_id;

  if not found then
    perform raise_business_error('BID_NOT_FOUND', 'No bid exists for the given id.');
  end if;

  if v_bid.bidder_id <> v_caller_id then
    perform raise_business_error('NOT_YOUR_BID', 'You may only cancel your own bids.');
  end if;

  if v_bid.status <> 'ACTIVE' then
    perform raise_business_error('BID_ALREADY_CANCELLED', 'This bid has already been cancelled.');
  end if;

  v_auction := lock_auction(v_bid.auction_id);

  if v_auction.status <> 'ACTIVE' then
    perform raise_business_error(
      'AUCTION_NOT_ACTIVE',
      'This auction is no longer accepting changes.'
    );
  end if;

  if v_auction.highest_bid_id = p_bid_id then
    perform raise_business_error(
      'CANNOT_CANCEL_LEADING_BID',
      'You cannot cancel your bid while you are the current highest bidder.'
    );
  end if;

  update bids
  set status = 'CANCELLED'
  where id = p_bid_id;
end;
$$;

revoke execute on function cancel_bid(uuid) from public;
grant execute on function cancel_bid(uuid) to authenticated;
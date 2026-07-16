-- =============================================================================
-- YardSale — Stage 12, Group A: send_watchlist_reminders()
-- =============================================================================
-- Private RPC, called only by pg_cron (Group C). Notifies three
-- audiences per the frozen Notification Domain spec — seller, current
-- highest bidder, and watchlist followers — not just watchers, despite
-- the function name (kept for continuity with the originally-named job).
--
-- Seller notification is skipped for system auctions (seller is an
-- admin profile), consistent with settle_auction() already skipping
-- PAYMENT_RECEIVED for admin sellers — applying the same established
-- precedent, not inventing a new rule.
--
-- Per-auction failure isolation via nested BEGIN...EXCEPTION, same
-- pattern as process_due_auctions(). Idempotent: the eligibility check
-- (status = ACTIVE and NOT ending_soon_notified) is re-verified inside
-- the lock, protecting against a race with process_due_auctions()
-- closing the same auction concurrently.
--
-- No de-duplication between the three notification roles: a user who
-- is both the current highest bidder AND a watchlist follower on the
-- same auction receives two separate reminders. Minor UX redundancy,
-- not a correctness issue — not resolved here since exact cross-role
-- dedup was never specified.
create or replace function send_watchlist_reminders()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_auction_id       uuid;
  v_auction          auctions;
  v_leader_bidder_id uuid;
  v_watcher          record;
begin
  for v_auction_id in
    select id
    from auctions
    where status = 'ACTIVE'
      and ending_soon_notified = false
      and ends_at > now()
      and ends_at <= now() + interval '30 minutes'
  loop
    begin
      v_auction := lock_auction(v_auction_id);

      if v_auction.status <> 'ACTIVE' or v_auction.ending_soon_notified then
        continue;
      end if;

      if not is_profile_admin(v_auction.seller_id) then
        perform create_notification(
          p_profile_id     => v_auction.seller_id,
          p_type           => 'AUCTION_ENDING_SOON',
          p_title          => 'Your auction is ending soon',
          p_message        => format(
            '"%s" ends in less than 30 minutes.',
            v_auction.title
          ),
          p_reference_type => 'AUCTION',
          p_reference_id   => v_auction.id
        );
      end if;

      if v_auction.highest_bid_id is not null then
        select bidder_id into v_leader_bidder_id
        from bids
        where id = v_auction.highest_bid_id;

        perform create_notification(
          p_profile_id     => v_leader_bidder_id,
          p_type           => 'AUCTION_ENDING_SOON',
          p_title          => 'Auction ending soon',
          p_message        => format(
            '"%s" ends in less than 30 minutes. You are currently the highest bidder.',
            v_auction.title
          ),
          p_reference_type => 'AUCTION',
          p_reference_id   => v_auction.id
        );
      end if;

      for v_watcher in
        select profile_id
        from watchlists
        where auction_id = v_auction.id
      loop
        perform create_notification(
          p_profile_id     => v_watcher.profile_id,
          p_type           => 'AUCTION_ENDING_SOON',
          p_title          => 'Auction ending soon',
          p_message        => format(
            '"%s" is on your watchlist and ends in less than 30 minutes.',
            v_auction.title
          ),
          p_reference_type => 'AUCTION',
          p_reference_id   => v_auction.id
        );
      end loop;

      update auctions
      set ending_soon_notified = true
      where id = v_auction.id;

    exception when others then
      raise warning
        'send_watchlist_reminders: failed to process auction %: %',
        v_auction_id, sqlerrm;
    end;
  end loop;
end;
$$;

revoke execute on function send_watchlist_reminders() from public;
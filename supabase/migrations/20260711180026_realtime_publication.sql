-- =============================================================================
-- YardSale — Enable Realtime (Phase 4.6 Implementation)
-- =============================================================================
-- Gap found during post-migration analysis: Phase 4.6 designed WHICH
-- tables should be realtime (auctions, bids, wallet_accounts,
-- wallet_entries, notifications) but no migration ever actually
-- enabled it — deciding the design isn't the same as turning it on.
-- Live-updating bids ("no polling required") was a headline product
-- requirement from the very first PRD conversation, making this a
-- material gap, not a nice-to-have.
--
-- Assumption documented explicitly: `supabase_realtime` is a
-- publication created by default in every Supabase project. This
-- migration doesn't create it, only adds tables to it.
--
-- Supabase Realtime (Postgres Changes) respects RLS by default for
-- authenticated subscriptions — our existing Stage 10 policies should
-- correctly gate what each subscriber receives without any additional
-- work here.
--
-- Idempotency: `ALTER PUBLICATION ... ADD TABLE` is NOT safe to re-run
-- against a table already in the publication (raises an error, not a
-- silent no-op), and the exact exception class isn't worth guessing at.
-- Checking pg_publication_tables explicitly first is more certain and
-- makes this migration genuinely safe to re-run.
-- =============================================================================

do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'auctions',
    'bids',
    'wallet_accounts',
    'wallet_entries',
    'notifications'
  ]
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = v_table
    ) then
      execute format('alter publication supabase_realtime add table public.%I', v_table);
    end if;
  end loop;
end
$$;
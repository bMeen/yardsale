-- =============================================================================
-- YardSale — Stage 12, Group C: Scheduled Jobs (pg_cron)
-- =============================================================================
-- cron.schedule() upserts by job name — safe/idempotent to re-run this
-- migration; a second run updates the existing job's schedule/command
-- rather than creating a duplicate.
--
-- Deliberately NO cron entry for temp-upload cleanup: per Group B's
-- finding, there is no SQL-executable cleanup function to schedule.
-- Actual cleanup requires a service_role Edge Function calling the
-- Storage API, triggered by an external scheduler (e.g. a Supabase
-- scheduled Edge Function) — entirely outside what pg_cron/SQL can
-- orchestrate. Not wired up here; noted as a Phase 6 follow-up.
-- =============================================================================

select cron.schedule(
  'process-due-auctions',
  '* * * * *',
  $$select process_due_auctions();$$
);

select cron.schedule(
  'send-watchlist-reminders',
  '*/15 * * * *',
  $$select send_watchlist_reminders();$$
);
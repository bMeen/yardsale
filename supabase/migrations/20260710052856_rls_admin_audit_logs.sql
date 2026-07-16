-- =============================================================================
-- YardSale — Stage 10, Group E: RLS — admin_audit_logs
-- =============================================================================
-- Admin-only, authenticated scope only. anon is denied at the
-- role-match level (policy doesn't apply), so is_admin() never
-- evaluates for an anon caller against this table.
-- =============================================================================

alter table admin_audit_logs enable row level security;

revoke all on admin_audit_logs from anon, authenticated;
grant select on admin_audit_logs to authenticated;

create policy admin_audit_logs_select_admin_only
  on admin_audit_logs
  for select
  to authenticated
  using (is_admin());

-- No INSERT/UPDATE/DELETE policy: written exclusively by
-- write_audit_log() via owner bypass. Immutable — no role, not even
-- admin, ever gets direct write access to this table.
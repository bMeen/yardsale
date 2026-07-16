-- =============================================================================
-- YardSale — Stage 9, Group F: mark_notification_read()
-- =============================================================================
-- The simplest function in the entire Stage 9 catalogue. Deliberately
-- has NO assert_profile_active() gate and NO is_admin() guard — the
-- only two exceptions to the blanket Stage 9 gating policy (gap-
-- analysis decisions #8 and #12): reading/dismissing your own
-- notifications should never be blocked, regardless of account status,
-- and managing your own notification state isn't "marketplace
-- participation."
--
-- Ownership is enforced directly in the UPDATE's WHERE clause rather
-- than a separate SELECT-then-check, and a generic NOTIFICATION_NOT_FOUND
-- error covers both "doesn't exist" and "belongs to someone else" — not
-- distinguishing between them avoids leaking whether a given
-- notification id exists for another user.
--
-- read_at is stamped automatically by the Stage 8 trigger
-- (maintain_notification_read_at) — this function only ever needs to
-- flip is_read.
create or replace function mark_notification_read(p_notification_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_id uuid := auth.uid();
begin
  update notifications
  set is_read = true
  where id = p_notification_id
    and profile_id = v_caller_id;

  if not found then
    perform raise_business_error(
      'NOTIFICATION_NOT_FOUND',
      'No notification exists for the given id, or it does not belong to you.'
    );
  end if;
end;
$$;

revoke execute on function mark_notification_read(uuid) from public;
grant execute on function mark_notification_read(uuid) to authenticated;
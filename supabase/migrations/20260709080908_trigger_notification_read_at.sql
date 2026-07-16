-- =============================================================================
-- YardSale — Stage 8: Triggers — Notifications read_at Consistency
-- =============================================================================
-- Category: Data Integrity. Keeps is_read / read_at always in sync,
-- regardless of what a caller passes in — this means the future
-- mark_notification_read() (Stage 9) only needs to flip is_read to
-- true; it never has to set read_at itself.
--
-- Also defensively handles the reverse direction (is_read set back to
-- false clears read_at) even though no current RPC un-reads a
-- notification — this keeps the ck_notifications_read_at_consistency
-- CHECK constraint (Stage 3) satisfied under any future code path, not
-- just the ones that exist today.
--
-- No SECURITY DEFINER needed: this only modifies NEW on the same table
-- the trigger is attached to, never touching another table.
-- =============================================================================

create or replace function maintain_notification_read_at()
returns trigger
language plpgsql
as $$
begin
  if new.is_read = true and old.is_read = false then
    new.read_at := now();
  elsif new.is_read = false then
    new.read_at := null;
  end if;

  return new;
end;
$$;

create trigger trg_notifications_maintain_read_at
  before update on notifications
  for each row
  execute function maintain_notification_read_at();
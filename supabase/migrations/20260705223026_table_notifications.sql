-- =============================================================================
-- YardSale — Stage 3: Tables — notifications (Notification Domain)
-- =============================================================================
-- Notifications are archived by read-state only, never hard-deleted
-- (frozen decision — reverted from an earlier "allow deletion" proposal).
-- =============================================================================

create table notifications (
  id              uuid primary key default gen_random_uuid(),

  profile_id      uuid not null references profiles (id) on delete cascade,

  type            notification_type not null,
  title           text not null,
  message         text not null,

  -- Nullable: not every notification type necessarily points at a business
  -- object (kept optional to avoid over-constraining future types).
  reference_type  reference_type,
  reference_id    uuid,

  is_read         boolean not null default false,
  read_at         timestamptz,

  created_at      timestamptz not null default now(),

  constraint ck_notifications_read_at_consistency
    check (
      (is_read = false and read_at is null)
      or
      (is_read = true and read_at is not null)
    )
);

comment on table notifications is
  'In-app notification history. Created exclusively via create_notification() '
  '(internal service) — never inserted directly by RPCs or the frontend. '
  'read_at consistency is also maintained by a trigger in Stage 8; this '
  'CHECK is the belt to that trigger''s suspenders.';
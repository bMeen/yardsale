-- =============================================================================
-- YardSale — Stage 3: Tables — admin_audit_logs (Admin Domain)
-- =============================================================================
-- Immutable record of administrative actions. Even with a single admin
-- account, every sensitive action must be traceable.
--
-- NOTE: "reason is required for USER_SUSPENDED / USER_DEACTIVATED /
-- AUCTION_CANCELLED" is a frozen decision, but is deliberately NOT enforced
-- here as a CHECK constraint — it's enforced in the admin RPC layer
-- (write_audit_log() callers), per the original architecture discussion.
-- =============================================================================

create table admin_audit_logs (
  id                uuid primary key default gen_random_uuid(),

  -- The admin's profile row (role = 'ADMIN'). Admin authenticates via
  -- email/password but still has a profiles row like any other user,
  -- so this FK stays consistent with the rest of the schema.
  admin_profile_id  uuid not null references profiles (id) on delete restrict,

  action_type       admin_action_type not null,
  reference_type    reference_type not null,
  reference_id      uuid,

  reason            text,

  -- Immutable — no updated_at (append-only audit trail).
  created_at        timestamptz not null default now()
);

comment on table admin_audit_logs is
  'Immutable administrative audit trail. INSERT only via write_audit_log() '
  '(internal service). No UPDATE or DELETE permitted at the RLS layer.';
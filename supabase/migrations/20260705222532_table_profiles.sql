-- =============================================================================
-- YardSale — Stage 3: Tables — profiles (Identity Domain)
-- =============================================================================
-- Extends auth.users with marketplace-specific identity.
-- Email/password remain solely owned by auth.users — never duplicated here.
--
-- Case-insensitive username uniqueness is enforced via a functional index
-- in Stage 4 (Indexes), NOT via the citext extension (frozen decision).
-- =============================================================================

create table profiles (
  id           uuid primary key references auth.users (id) on delete cascade,

  username     text not null,
  full_name    text not null,
  avatar_url   text,

  status       profile_status not null default 'ACTIVE',
  role         user_role not null default 'USER',

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint ck_profiles_username_length
    check (char_length(username) between 3 and 30),
  constraint ck_profiles_full_name_not_blank
    check (char_length(btrim(full_name)) > 0)
);

comment on table profiles is
  'Marketplace identity extending auth.users. Owned by the Identity Domain. '
  'Never stores email/password — those remain in auth.users.';
-- =============================================================================
-- YardSale — Patch: Explicit auction_id for create_auction() / admin_create_system_auction()
-- =============================================================================
-- Gap found during Edge Function planning: both functions expected
-- FINAL, permanent image storage paths ({auction_id}/{uuid}.webp) as
-- input — but auction_id doesn't exist until the row is inserted. Since
-- the temp -> permanent file move must happen in a service_role Edge
-- Function (Postgres cannot call the Storage API), and that move needs
-- to write to a path CONTAINING auction_id, there was a genuine
-- chicken-and-egg problem: the Edge Function couldn't move files to
-- their permanent location before the auction existed, but the RPC
-- expected final paths as input.
--
-- Fix: both functions now accept an explicit p_auction_id. The calling
-- Edge Function pre-generates the UUID, moves the temp files to their
-- permanent path using that pre-generated ID, and only then calls the
-- RPC with both the final ID and the now-correct permanent paths. When
-- p_auction_id is omitted (NULL), a fresh UUID is generated as before —
-- this keeps both functions callable exactly as they were for any
-- direct/non-image-orchestrated use.
--
-- IMPORTANT: CREATE OR REPLACE FUNCTION cannot add a new parameter to
-- an existing function — the parameter list is part of a function's
-- identity in Postgres. Attempting it silently creates a SECOND,
-- overloaded function instead of replacing the original, leaving the
-- old signature still callable. The correct sequence is an explicit
-- DROP of the old signature, then CREATE of the new one — and since
-- DROP wipes existing grants, REVOKE/GRANT must be reapplied after.
-- =============================================================================

drop function if exists create_auction(
  text, text, auction_category, bigint, timestamptz, timestamptz, text[]
);

create or replace function create_auction(
  p_title               text,
  p_description         text,
  p_category            auction_category,
  p_starting_price      bigint,
  p_starts_at           timestamptz,
  p_ends_at             timestamptz,
  p_image_storage_paths text[] default null,
  p_auction_id          uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_id      uuid := auth.uid();
  v_available_id   uuid;
  v_platform_id    uuid;
  v_auction_id     uuid := coalesce(p_auction_id, gen_random_uuid());
  v_status         auction_status;
  v_image_count    integer;
  v_listing_fee    bigint;
  i                integer;
begin
  perform assert_profile_active(v_caller_id);

  if is_admin() then
    perform raise_business_error(
      'ADMIN_CANNOT_PARTICIPATE',
      'Administrators cannot create marketplace auctions.'
    );
  end if;

  if p_starting_price <= 0 then
    perform raise_business_error(
      'INVALID_STARTING_PRICE',
      'Starting price must be greater than zero.'
    );
  end if;

  if p_ends_at <= now() then
    perform raise_business_error(
      'AUCTION_END_TIME_IN_PAST',
      'Auction end time must be in the future.'
    );
  end if;

  if p_ends_at - p_starts_at < minimum_auction_duration() then
    perform raise_business_error(
      'AUCTION_DURATION_TOO_SHORT',
      format('Auctions must run for at least %s.', minimum_auction_duration())
    );
  end if;

  v_image_count := coalesce(array_length(p_image_storage_paths, 1), 0);

  if v_image_count > 3 then
    perform raise_business_error(
      'TOO_MANY_IMAGES',
      'An auction may have at most 3 images.'
    );
  end if;

  v_status := determine_initial_auction_status(p_starts_at);

  insert into auctions (
    id, seller_id, title, description, category,
    starting_price, current_price, status, starts_at, ends_at
  )
  values (
    v_auction_id, v_caller_id, p_title, p_description, p_category,
    p_starting_price, p_starting_price, v_status, p_starts_at, p_ends_at
  );

  for i in 1 .. v_image_count loop
    insert into auction_images (auction_id, storage_path, display_order)
    values (v_auction_id, p_image_storage_paths[i], i);
  end loop;

  select id into v_available_id
  from wallet_accounts
  where profile_id = v_caller_id
    and account_type = 'AVAILABLE';

  v_listing_fee := listing_fee_kobo();
  v_platform_id := get_platform_account_id();

  perform assert_wallet_balance(v_available_id, v_listing_fee);

  perform record_wallet_entry(
    p_from_account_id => v_available_id,
    p_to_account_id   => v_platform_id,
    p_amount          => v_listing_fee,
    p_entry_type      => 'LISTING_FEE',
    p_reference_type  => 'AUCTION',
    p_reference_id    => v_auction_id,
    p_description     => 'Listing fee'
  );

  return v_auction_id;
end;
$$;

revoke execute on function create_auction(
  text, text, auction_category, bigint, timestamptz, timestamptz, text[], uuid
) from public;

grant execute on function create_auction(
  text, text, auction_category, bigint, timestamptz, timestamptz, text[], uuid
) to authenticated;


-- -----------------------------------------------------------------------------
-- admin_create_system_auction() — identical treatment
-- -----------------------------------------------------------------------------

drop function if exists admin_create_system_auction(
  text, text, auction_category, bigint, timestamptz, timestamptz, text[]
);

create or replace function admin_create_system_auction(
  p_title               text,
  p_description         text,
  p_category            auction_category,
  p_starting_price      bigint,
  p_starts_at           timestamptz,
  p_ends_at             timestamptz,
  p_image_storage_paths text[] default null,
  p_auction_id          uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_id   uuid := auth.uid();
  v_auction_id  uuid := coalesce(p_auction_id, gen_random_uuid());
  v_status      auction_status;
  v_image_count integer;
  i             integer;
begin
  if not is_admin() then
    perform raise_business_error(
      'NOT_AUTHORIZED',
      'Only an administrator may perform this action.'
    );
  end if;

  v_image_count := coalesce(array_length(p_image_storage_paths, 1), 0);

  if v_image_count > 3 then
    perform raise_business_error(
      'TOO_MANY_IMAGES',
      'An auction may have at most 3 images.'
    );
  end if;

  v_status := determine_initial_auction_status(p_starts_at);

  insert into auctions (
    id, seller_id, title, description, category,
    starting_price, current_price, status, starts_at, ends_at
  )
  values (
    v_auction_id, v_caller_id, p_title, p_description, p_category,
    p_starting_price, p_starting_price, v_status, p_starts_at, p_ends_at
  );

  for i in 1 .. v_image_count loop
    insert into auction_images (auction_id, storage_path, display_order)
    values (v_auction_id, p_image_storage_paths[i], i);
  end loop;

  perform write_audit_log(
    p_admin_profile_id => v_caller_id,
    p_action_type      => 'SYSTEM_AUCTION_CREATED',
    p_reference_type   => 'AUCTION',
    p_reference_id     => v_auction_id,
    p_reason           => null
  );

  return v_auction_id;
end;
$$;

revoke execute on function admin_create_system_auction(
  text, text, auction_category, bigint, timestamptz, timestamptz, text[], uuid
) from public;
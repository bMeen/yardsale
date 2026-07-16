-- =============================================================================
-- YardSale — Stage 11, Groups B-D: RLS — storage.objects (auction-images)
-- =============================================================================
-- RLS is already enabled on storage.objects by default as part of every
-- Supabase project's Storage setup — no ALTER TABLE needed here, unlike
-- our own public-schema tables in Stage 10.
--
-- Path parsing via storage.foldername(name), which returns the folder
-- segments of a path as text[] (excluding the filename itself). For
-- 'temp/{user_id}/{uuid}.webp', this returns ARRAY['temp', '{user_id}'].
-- For '{auction_id}/{uuid}.webp', it returns ARRAY['{auction_id}'].
--
-- Critical rule applied throughout: never cast an untrusted path
-- segment to uuid. A malformed or malicious path would raise a hard
-- Postgres error ("invalid input syntax for type uuid") instead of a
-- clean policy denial. Every comparison here casts the KNOWN uuid side
-- (auth.uid(), auctions.id) to text instead, and compares as text.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- INSERT — own temp/ folder only
-- -----------------------------------------------------------------------------
-- Ordinary authenticated users may only upload into their own
-- temp/{auth.uid()}/ subfolder. There is no policy permitting direct
-- INSERT into an {auction_id}/ (permanent) path at all — that write
-- happens exclusively via a service_role Edge Function during the
-- temp-to-permanent move, which bypasses RLS entirely and therefore
-- doesn't need a policy to permit it.
create policy storage_auction_images_insert_own_temp
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'auction-images'
    and (storage.foldername(name))[1] = 'temp'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

-- -----------------------------------------------------------------------------
-- DELETE — own temp/ files
-- -----------------------------------------------------------------------------
-- Lets a user remove an in-progress upload (e.g. removing a photo
-- before submitting the auction creation form) before it's ever moved
-- to a permanent location.
create policy storage_auction_images_delete_own_temp
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'auction-images'
    and (storage.foldername(name))[1] = 'temp'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

-- -----------------------------------------------------------------------------
-- DELETE — permanent images, owner or admin
-- -----------------------------------------------------------------------------
-- Covers cleanup after auction cancellation. Whether that cleanup ends
-- up performed client-side or via a service_role Edge Function, this
-- policy is harmless either way — service_role bypasses it regardless,
-- so it's only load-bearing for a direct client-side delete path.
--
-- The EXISTS subquery naturally denies access for any path segment that
-- isn't a real auction id (the text comparison simply finds no match —
-- it never throws, since we're not casting the segment to uuid).
create policy storage_auction_images_delete_permanent_owner_or_admin
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'auction-images'
    and (storage.foldername(name))[1] <> 'temp'
    and (
      is_admin()
      or exists (
        select 1
        from auctions a
        where a.id::text = (storage.foldername(name))[1]
          and a.seller_id = auth.uid()
      )
    )
  );

-- -----------------------------------------------------------------------------
-- SELECT — whole-bucket public read
-- -----------------------------------------------------------------------------
-- Includes temp/ files, not just permanent ones. Making temp uploads
-- owner-only-readable would require the same path-branching complexity
-- as the write policies above, for minimal real benefit: filenames are
-- unguessable UUIDs, and every temp image is about to become public
-- anyway once its auction is submitted. Deliberate, flagged trade-off
-- — not a silent decision.
create policy storage_auction_images_select_public
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'auction-images');

-- No UPDATE policy for any path: the frozen filename convention (a
-- fresh UUID per upload, never reused) means "replacing an image" is
-- always delete-old + insert-new, never an in-place overwrite. There is
-- no scenario in this system that requires updating an existing
-- storage object.
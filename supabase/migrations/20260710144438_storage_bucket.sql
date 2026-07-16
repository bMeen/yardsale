-- =============================================================================
-- YardSale — Stage 11, Group A: Storage Bucket — auction-images
-- =============================================================================
-- Single public bucket, per the frozen Storage Architecture. Two path
-- shapes coexist in this one bucket:
--
--   temp/{user_id}/{uuid}.webp        — in-progress uploads, pre-auction
--   {auction_id}/{uuid}.webp          — permanent, post-auction-creation
--
-- The temp -> permanent move is performed by a service_role Edge
-- Function (Phase 6, out of scope here) — service_role bypasses RLS on
-- storage.objects entirely, so no policy in this stage ever needs to
-- permit an ordinary authenticated user to write directly into an
-- {auction_id}/ path.
--
-- Confirmed limits: jpeg/png/webp only, 10 MB max per file.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'auction-images',
  'auction-images',
  true,
  10485760, -- 10 MB in bytes
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;
-- =============================================================================
-- YardSale — Stage 12, Group B: list_stale_temp_uploads()
-- =============================================================================
-- Correction to the original architecture doc: a pure SQL
-- cleanup_temp_uploads() cannot actually free storage space.
-- storage.objects is only the METADATA table — the actual file bytes
-- live in a separate S3-compatible backend, and only Supabase's
-- Storage service (via its HTTP API) can delete both together. A raw
-- `DELETE FROM storage.objects` removes just the metadata row, silently
-- leaving the real file orphaned in the backend forever. This is the
-- identical constraint already correctly identified for the
-- temp-to-permanent move (Stage 11) — it just wasn't applied to cleanup
-- in the original design pass.
--
-- This function is deliberately NOT a cleanup function. It's a
-- read-only building block: a future service_role Edge Function calls
-- this to get the list of stale paths, then calls the Storage API's
-- DELETE endpoint for each one. No SQL function in this migration set
-- claims to "clean up" storage while only touching metadata.
create or replace function list_stale_temp_uploads()
returns table (storage_path text)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select name
  from storage.objects
  where bucket_id = 'auction-images'
    and (storage.foldername(name))[1] = 'temp'
    and created_at < now() - interval '24 hours';
$$;

-- No explicit GRANT: intended to be called by a service_role Edge
-- Function, which already holds elevated Postgres access by default
-- and isn't affected by this REVOKE (consistent with how every other
-- private function in this system is closed to anon/authenticated).
revoke execute on function list_stale_temp_uploads() from public;
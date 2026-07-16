import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/**
 * A client scoped to the CALLER's own JWT. RPC calls made through this
 * client run with auth.uid() correctly resolving to the caller, and
 * are subject to every RLS policy exactly as if the caller had made
 * the request directly via PostgREST.
 *
 * Use this for: calling create_auction(), admin_create_system_auction(),
 * or any other user-facing RPC.
 *
 * Never use this for: Storage operations on a permanent {auction_id}/
 * path — an ordinary authenticated user only has permission to write
 * into their own temp/ folder (Stage 11 RLS), so a permanent-path move
 * would be denied.
 */
export function createUserScopedClient(authHeader: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
}

/**
 * A client using the service_role key. Bypasses RLS entirely.
 *
 * Use this for: the Storage move/delete operations, which require
 * writing into paths an ordinary authenticated user isn't permitted to
 * touch directly.
 *
 * Never use this for: calling user-facing RPCs like create_auction().
 * Doing so would bypass every assert_profile_active() / is_admin() /
 * ownership check inside them, since those checks read auth.uid() —
 * which resolves to NULL (or an unrestricted service context) rather
 * than the actual calling user when using this client. That would
 * defeat the entire purpose of those checks.
 */
export function createServiceRoleClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}
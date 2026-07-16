import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// Must be set explicitly via `supabase secrets set CRON_SECRET=...` —
// there is no default. Without it, this function refuses every
// request.
const CRON_SECRET = Deno.env.get("CRON_SECRET");

const BUCKET = "auction-images";

/**
 * The actual storage cleanup mechanism the original architecture doc
 * called "cleanup_temp_uploads()" — the SQL layer only ever provides
 * list_stale_temp_uploads() (Stage 12, a read-only helper), because
 * Postgres cannot call the Storage API directly. This function is what
 * performs REAL deletion of both the metadata row AND the backend
 * file together, via Storage's remove() — a raw SQL DELETE against
 * storage.objects only ever removes the metadata, silently orphaning
 * the actual file forever.
 *
 * Triggered by an external scheduler — a Supabase scheduled Edge
 * Function trigger, or an external cron service hitting this URL —
 * never by an end user. There is no "calling user" for a scheduled
 * job, so this authenticates via a shared secret header rather than a
 * user session or even the service_role key directly (which would mean
 * embedding a highly privileged key in whatever external scheduler
 * calls this URL).
 */
Deno.serve(async (req: Request) => {
  const providedSecret = req.headers.get("x-cron-secret");
  if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
    return jsonResponse({ error: "UNAUTHORIZED" }, 401);
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: stalePaths, error: listError } = await supabase.rpc(
      "list_stale_temp_uploads",
    );

    if (listError) {
      console.error(
        "cleanup-temp-uploads: list_stale_temp_uploads failed",
        listError,
      );
      return jsonResponse({ error: listError.message }, 500);
    }

    const paths = (stalePaths ?? []).map(
      (row: { storage_path: string }) => row.storage_path,
    );

    if (paths.length === 0) {
      return jsonResponse({ deleted: 0 }, 200);
    }

    // remove() accepts a batch of paths and deletes both the metadata
    // row and the backend file for each, in one call.
    const { error: removeError } = await supabase.storage
      .from(BUCKET)
      .remove(paths);

    if (removeError) {
      console.error("cleanup-temp-uploads: remove failed", removeError);
      return jsonResponse({ error: removeError.message }, 500);
    }

    return jsonResponse({ deleted: paths.length }, 200);
  } catch (err) {
    console.error("cleanup-temp-uploads: unexpected error", err);
    return jsonResponse({ error: "INTERNAL_ERROR" }, 500);
  }
});

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
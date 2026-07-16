import { corsHeaders } from "../_shared/cors.ts";
import { createUserScopedClient } from "../_shared/supabase-clients.ts";
import {
  buildPermanentPaths,
  ImageOwnershipError,
  moveImagesToPermanentPath,
} from "../_shared/move-temp-images.ts";

/**
 * Orchestrates auction creation with images. The client uploads images
 * directly to Storage (temp/{own_uid}/{uuid}.ext) BEFORE calling this
 * function — this function never receives raw file bytes, only the
 * temp paths.
 *
 * Ordering (see move-temp-images.ts for the full rationale): the
 * create_auction() RPC is called FIRST, with the FUTURE permanent
 * paths, before any Storage operation happens. Only after the RPC
 * commits successfully do we actually move the files. This means a
 * failed RPC call (insufficient balance, validation error) never
 * leaves orphaned files in Storage — nothing is touched until the
 * auction is already real and paid for.
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "MISSING_AUTHORIZATION" }, 401);
    }

    const supabase = createUserScopedClient(authHeader);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "INVALID_SESSION" }, 401);
    }

    const body = await req.json();
    const {
      title,
      description,
      category,
      starting_price,
      starts_at,
      ends_at,
      temp_image_paths = [],
    } = body;

    const auctionId = crypto.randomUUID();

    let permanentPaths: string[];
    try {
      permanentPaths = buildPermanentPaths(
        temp_image_paths,
        user.id,
        auctionId,
      );
    } catch (e) {
      if (e instanceof ImageOwnershipError) {
        return jsonResponse(
          { error: "IMAGE_OWNERSHIP_MISMATCH", detail: e.message },
          403,
        );
      }
      throw e;
    }

    // Step 1: call the RPC with the FUTURE paths. Nothing in Storage
    // has been touched yet.
    const { data: rpcAuctionId, error: rpcError } = await supabase.rpc(
      "create_auction",
      {
        p_title: title,
        p_description: description,
        p_category: category,
        p_starting_price: starting_price,
        p_starts_at: starts_at,
        p_ends_at: ends_at,
        p_image_storage_paths: permanentPaths,
        p_auction_id: auctionId,
      },
    );

    if (rpcError) {
      // Clean, fully-reversible failure — nothing to compensate.
      return jsonResponse({ error: rpcError.message }, 400);
    }

    // Step 2: only now, after the auction + images metadata + listing
    // fee have all committed atomically, do we move the actual files.
    const moveResults = await moveImagesToPermanentPath(
      temp_image_paths.map((tempPath: string, i: number) => ({
        from: tempPath,
        to: permanentPaths[i],
      })),
    );

    const failedMoves = moveResults.filter((r) => r.error !== null);
    if (failedMoves.length > 0) {
      // The auction is valid and already paid for — we do not fail
      // the request. Surfacing which paths are pending lets the
      // client retry the move separately if needed.
      console.warn(
        `create-auction: ${failedMoves.length} image(s) failed to move for auction ${rpcAuctionId}`,
      );
    }

    return jsonResponse(
      {
        auction_id: rpcAuctionId,
        images_pending: failedMoves.map((f) => f.path),
      },
      200,
    );
  } catch (err) {
    console.error("create-auction: unexpected error", err);
    return jsonResponse({ error: "INTERNAL_ERROR" }, 500);
  }
});

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
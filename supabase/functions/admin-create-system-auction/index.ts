import { corsHeaders } from "../_shared/cors.ts";
import { createUserScopedClient } from "../_shared/supabase-clients.ts";
import {
  buildPermanentPaths,
  ImageOwnershipError,
  moveImagesToPermanentPath,
} from "../_shared/move-temp-images.ts";

/**
 * Identical orchestration to create-auction, calling
 * admin_create_system_auction() instead. Authorization (is_admin()) is
 * enforced INSIDE the RPC, not duplicated here — if the caller isn't
 * the admin, the RPC call fails with NOT_AUTHORIZED and, same as
 * create-auction, nothing in Storage is ever touched.
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

    const { data: rpcAuctionId, error: rpcError } = await supabase.rpc(
      "admin_create_system_auction",
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
      return jsonResponse({ error: rpcError.message }, 400);
    }

    const moveResults = await moveImagesToPermanentPath(
      temp_image_paths.map((tempPath: string, i: number) => ({
        from: tempPath,
        to: permanentPaths[i],
      })),
    );

    const failedMoves = moveResults.filter((r) => r.error !== null);
    if (failedMoves.length > 0) {
      console.warn(
        `admin-create-system-auction: ${failedMoves.length} image(s) failed to move for auction ${rpcAuctionId}`,
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
    console.error("admin-create-system-auction: unexpected error", err);
    return jsonResponse({ error: "INTERNAL_ERROR" }, 500);
  }
});

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
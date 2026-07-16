import { createServiceRoleClient } from "./supabase-clients.ts";

const BUCKET = "auction-images";

export class ImageOwnershipError extends Error {}

/**
 * Validates that every provided temp path actually belongs to the
 * given caller (starts with temp/{callerId}/), and constructs the
 * FUTURE permanent path for each — without touching Storage yet.
 *
 * This validation is essential, not optional: the actual move step
 * (below) uses a service_role client, which is required because
 * ordinary users can only write into their own temp/ folder — never a
 * permanent {auction_id}/ path (Stage 11 RLS). service_role bypasses
 * RLS entirely, so RLS provides ZERO protection at the move step —
 * this explicit check is the only thing preventing a caller from
 * passing someone else's temp path and having it silently accepted.
 *
 * Reuses the original filename (already a fresh UUID + extension from
 * the initial upload, per the frozen filename convention) rather than
 * generating a new one — this is a MOVE, not a new upload.
 */
export function buildPermanentPaths(
  tempPaths: string[],
  callerId: string,
  auctionId: string,
): string[] {
  return tempPaths.map((tempPath) => {
    const expectedPrefix = `temp/${callerId}/`;
    if (!tempPath.startsWith(expectedPrefix)) {
      throw new ImageOwnershipError(
        `Path "${tempPath}" does not belong to the calling user.`,
      );
    }

    const filename = tempPath.slice(expectedPrefix.length);
    return `${auctionId}/${filename}`;
  });
}

/**
 * Performs the actual temp -> permanent Storage move. Call this ONLY
 * after create_auction() / admin_create_system_auction() has already
 * committed successfully — see the ordering rationale in each
 * function's index.ts. If the RPC call fails, this must never be
 * reached, so Storage is never touched for a failed/rolled-back
 * auction.
 *
 * Failures here are logged but do NOT fail the overall request: the
 * auction itself is already valid and paid for by this point. A file
 * that fails to move leaves auction_images.storage_path pointing at a
 * location the image hasn't physically reached yet — recoverable via
 * a retry, unlike the alternative ordering (move-first) which could
 * leave orphaned, already-billed images with no corresponding auction
 * at all.
 */
export async function moveImagesToPermanentPath(
  moves: { from: string; to: string }[],
): Promise<{ path: string; error: string | null }[]> {
  const serviceClient = createServiceRoleClient();
  const results: { path: string; error: string | null }[] = [];

  for (const { from, to } of moves) {
    const { error } = await serviceClient.storage
      .from(BUCKET)
      .move(from, to);

    results.push({ path: to, error: error?.message ?? null });

    if (error) {
      console.error(
        `moveImagesToPermanentPath: failed to move ${from} -> ${to}: ${error.message}`,
      );
    }
  }

  return results;
}
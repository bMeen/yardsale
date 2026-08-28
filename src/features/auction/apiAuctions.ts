import { AUCTION_IMAGE_BUCKET, PER_PAGE } from "@/shared/constants";
import supabase from "@/shared/supabase/client";
import {
  RPC_BY_TYPE,
  type AuctionDetails,
  type AuctionDetailsBid,
  type AuctionFormFields,
  type CancelAuction,
  type CancelBid,
  type FullAuction,
  type GetAuctionsParams,
  type GetAuctionsResponse,
  type PlaceBid,
  type ToggleWatchlist,
  type UpdateAuction,
} from "./types";
import { validateImage } from "@/lib/utils";
import { getCurrentUserApi } from "../auth/apiAuth";
import type { QueryClient } from "@tanstack/react-query";

const AUCTION_FULL_QUERY = `*, auction_images(storage_path, display_order), highest_bid:bids!fk_auctions_highest_bid(
      id,
      bidder_id,
      amount
    )`;

export async function getFeaturedAuctions() {
  const { data, error } = await supabase
    .from("auctions")
    .select(AUCTION_FULL_QUERY)
    .eq("status", "ACTIVE")
    .order("ends_at", { ascending: true })
    .limit(6);

  if (error) throw error;

  return data as FullAuction[];
}

export async function getAuctions({
  type,
  page = 1,
  category = "ALL",
  status,
  search,
}: GetAuctionsParams): Promise<GetAuctionsResponse> {
  const trimmedSearch = search?.trim() || undefined;

  const params: Record<string, unknown> = {
    p_category: category !== "ALL" ? category : null,
    p_search: trimmedSearch ?? null,
    p_page: page,
    p_limit: PER_PAGE,
  };

  if (type !== "WATCHLIST") {
    params.p_status = status ?? undefined;
  }

  const { data, error } = await supabase.rpc(RPC_BY_TYPE[type], params);

  if (error) throw error;

  return {
    data: data
      ? data.map((row) => row.auction as unknown as FullAuction)
      : null,
    count: data?.[0]?.total_count ?? 0,
  };
}

export async function uploadAuctionImages(file: File) {
  validateImage(file);

  const user = await getCurrentUserApi();
  if (!user) return;

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "webp";
  const path = `temp/${user.id}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(AUCTION_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) throw error;
  return path;
}

export async function deleteAuctionImage(path: string) {
  const { error } = await supabase.storage
    .from(AUCTION_IMAGE_BUCKET)
    .remove([path]);

  if (error) throw error;
  return path;
}

export function getImageUrl(path: string) {
  if (!path) return "";

  return supabase.storage.from(AUCTION_IMAGE_BUCKET).getPublicUrl(path).data
    .publicUrl;
}

export async function getAuction(id: string | undefined) {
  if (!id) return;
  const { data, error } = await supabase.rpc("get_auction_detail", {
    p_auction_id: id,
  });

  if (error) throw error;

  return data as unknown as AuctionDetails;
}

export async function getAuctionBids({
  id,
  page,
}: {
  id: string | undefined;
  page: number;
}) {
  if (!id) return;
  const { data, error } = await supabase.rpc("get_auction_bids", {
    p_auction_id: id,
    p_page: page,
  });

  if (error) throw error;

  return data as unknown as AuctionDetailsBid[];
}

export async function placeBid(data: PlaceBid) {
  const { error } = await supabase.rpc("submit_bid", data);

  if (error) throw error;
}

export async function cancelBid(data: CancelBid) {
  const { error } = await supabase.rpc("cancel_bid", data);

  if (error) throw error;
}

export async function toggleWatchlist(data: ToggleWatchlist) {
  const { error } = await supabase.rpc("toggle_watchlist", data);

  if (error) throw error;
}

export async function createAuction(payload: AuctionFormFields) {
  const { data, error } = await supabase.functions.invoke("create-auction", {
    body: payload,
  });

  if (error) throw error;

  return data as unknown as { auction_id: string };
}

export async function updateAuction(payload: UpdateAuction) {
  const { error } = await supabase.rpc("update_auction", payload);

  if (error) throw error;
}

export async function cancelAuction(payload: CancelAuction) {
  const { error } = await supabase.rpc("cancel_auction", payload);

  if (error) throw error;
}

export function subscribeToAuction(
  auctionId: string,
  queryClient: QueryClient,
) {
  const channel = supabase
    .channel(`auction-detail:${auctionId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "auctions",
        filter: `id=eq.${auctionId}`,
      },
      () => {
        queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
      },
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "bids",
        filter: `auction_id=eq.${auctionId}`,
      },
      () => {
        queryClient.invalidateQueries({ queryKey: ["bids", auctionId] });
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToAuctions(queryClient: QueryClient) {
  const channel = supabase
    .channel("auction-list")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "auctions" },
      () => {
        queryClient.invalidateQueries({ queryKey: ["auctions"] });
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

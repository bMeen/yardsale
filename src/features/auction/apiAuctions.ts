import { AUCTION_IMAGE_BUCKET, PER_PAGE } from "@/shared/constants";
import supabase from "@/shared/supabase/client";
import {
  RPC_BY_TYPE,
  type FullAuction,
  type GetAuctionsParams,
  type GetAuctionsResponse,
  type rpcType,
} from "./types";
import { getRange, validateImage } from "@/lib/utils";
import { getCurrentUserApi } from "../auth/apiAuth";

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

  if (error) throw new Error(error.message);

  return data as FullAuction[];
}

export async function getAuctions({
  type,
  page = 1,
  category = "ALL",
  status,
  search,
  user_id,
}: GetAuctionsParams): Promise<GetAuctionsResponse> {
  const trimmedSearch = search?.trim() || undefined;

  const rpcName = RPC_BY_TYPE[type as rpcType];
  if (rpcName) {
    const { data, error } = await supabase.rpc(rpcName, {
      p_category: category !== "ALL" ? category : undefined,
      p_search: trimmedSearch ?? undefined,
      p_page: page,
      p_limit: PER_PAGE,
      p_status: status,
    });

    if (error) throw new Error(error.message);

    return {
      data: data
        ? data.map((row) => row.auction as unknown as FullAuction)
        : null,
      count: data?.[0]?.total_count ?? 0,
    };
  }

  const { from, to } = getRange(page);

  let query = supabase.from("auctions").select(AUCTION_FULL_QUERY, {
    count: "exact",
  });

  if (category && category !== "ALL") {
    query = query.eq("category", category);
  }

  if (status) {
    query = query.eq("status", status);
  } else {
    query = query.neq("status", "CANCELLED");
  }

  if (trimmedSearch) {
    query = query.ilike("title", `%${trimmedSearch}%`);
  }

  if (type === "MY_AUCTIONS") {
    if (!user_id) throw new Error("Not authenticated");

    query = query.eq("seller_id", user_id);
  }

  const { data, error, count } = await query
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return {
    data: data as FullAuction[] | null,
    count: count ?? 0,
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

  if (error) throw new Error(error.message);
  return path;
}

export async function deleteAuctionImage(path: string) {
  const { error } = await supabase.storage
    .from(AUCTION_IMAGE_BUCKET)
    .remove([path]);

  if (error) throw new Error(error.message);
  return path;
}

export function getImageUrl(path: string) {
  if (!path) return "";

  return supabase.storage.from(AUCTION_IMAGE_BUCKET).getPublicUrl(path).data
    .publicUrl;
}

//bids!bids_auction_id_fkey(
//        id,
//        bidder_id,
//        amount
//     )

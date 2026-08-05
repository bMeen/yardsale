import { PER_PAGE } from "@/shared/constants";
import supabase from "@/shared/supabase/client";
import type {
  AuctionListType,
  FullAuction,
  GetAuctionsParams,
  GetAuctionsResponse,
  RPC,
} from "./types";
import { getCurrentUserApi } from "../auth/apiAuth";
import { getRange } from "@/lib/utils";

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

type rpcType = Exclude<AuctionListType, "MY_AUCTIONS" | "ALL">;
const RPC_BY_TYPE: Partial<Record<rpcType, RPC>> = {
  PARTICIPATING: "get_participating_auctions",
  WATCHLIST: "get_watchlist_auctions",
};

export async function getAuctions({
  type,
  page = 1,
  category = "ALL",
  status,
  search,
}: GetAuctionsParams): Promise<GetAuctionsResponse> {
  const trimmedSearch = search?.trim() || undefined;

  const rpcName = RPC_BY_TYPE[type as rpcType];
  if (rpcName) {
    const { data, error } = await supabase.rpc(rpcName, {
      p_category: category !== "ALL" ? category : undefined,
      p_search: trimmedSearch ?? undefined,
      p_page: page,
      p_limit: PER_PAGE,
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
  }

  if (trimmedSearch) {
    query = query.ilike("title", `%${trimmedSearch}%`);
  }

  if (type === "MY_AUCTIONS") {
    const user = await getCurrentUserApi();
    if (!user) throw new Error("Not authenticated");

    query = query.eq("seller_id", user.id);
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

//bids!bids_auction_id_fkey(
//        id,
//        bidder_id,
//        amount
//     )

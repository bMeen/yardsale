import { PER_PAGE } from "@/shared/constants";
import supabase from "@/shared/supabase/client";
import type {
  FullAuction,
  GetAuctionsParams,
  GetAuctionsResponse,
} from "./types";
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
  search,
}: GetAuctionsParams): Promise<GetAuctionsResponse> {
  const trimmedSearch = search?.trim() || undefined;

  if (type === "PARTICIPATING") {
    const { data, error } = await supabase.rpc("get_participating_auctions", {
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

  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  let query = supabase.from("auctions").select(AUCTION_FULL_QUERY, {
    count: "exact",
  });

  if (category && category !== "ALL") {
    query = query.eq("category", category);
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

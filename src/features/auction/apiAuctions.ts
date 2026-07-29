import { PER_PAGE } from "@/shared/constants";
import supabase from "@/shared/supabase/client";
import type { Category } from "./types";

const AUCTION_FULL_QUERY = `*, auction_images(storage_path, display_order), bids!bids_auction_id_fkey(
        id,
        bidder_id,
        amount
      ), highest_bid:bids!fk_auctions_highest_bid(
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

  return data;
}

export async function getAuctions({
  page = 1,
  category = "ALL",
}: {
  page: number;
  category: Category;
}) {
  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  let query = supabase.from("auctions").select(AUCTION_FULL_QUERY, {
    count: "exact",
  });

  if (category && category !== "ALL") {
    query = query.eq("category", category);
  }

  const { data, error, count } = await query
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return { data, count };
}

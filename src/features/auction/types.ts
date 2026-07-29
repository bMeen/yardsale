import type { Database } from "@/shared/supabase/database.types";
import type { getAuctions } from "./apiAuctions";

export type Category = Database["public"]["Enums"]["auction_category"] | "ALL";
export type AuctionStatus = Database["public"]["Enums"]["auction_status"];

export type Auction = Database["public"]["Tables"]["auctions"]["Row"];
export type AuctionImages =
  Database["public"]["Tables"]["auction_images"]["Row"];
export type Bid = Database["public"]["Tables"]["bids"]["Row"];

export type FullAuction = NonNullable<
  Awaited<ReturnType<typeof getAuctions>>["data"]
>[number];

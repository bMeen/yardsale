import type { Database } from "@/shared/supabase/database.types";

export type Category = Database["public"]["Enums"]["auction_category"] | "ALL";
export type AuctionStatus = Database["public"]["Enums"]["auction_status"];
export type AuctionListType =
  "ALL" | "MY_AUCTIONS" | "PARTICIPATING" | "WATCHLIST";

export type Auction = Database["public"]["Tables"]["auctions"]["Row"];
export type AuctionImages =
  Database["public"]["Tables"]["auction_images"]["Row"];
export type Bid = Database["public"]["Tables"]["bids"]["Row"];
export type RPC = keyof Database["public"]["Functions"];

export type FullAuction = Auction & {
  auction_images: AuctionImages[];
  highest_bid: Bid | null;
};
export interface GetAuctionsParams {
  type: AuctionListType;
  page?: number;
  category?: Category;
  status?: AuctionStatus;
  search?: string;
}

export type GetAuctionsResponse = {
  data: FullAuction[] | null;
  count: number;
};

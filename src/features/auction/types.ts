import type { Database } from "@/shared/supabase/database.types";

export const CategoryEnum = {
  ELECTRONICS: "ELECTRONICS",
  FASHION: "FASHION",
  PHONES_TABLETS: "PHONES_TABLETS",
  COMPUTERS: "COMPUTERS",
  HOME_APPLIANCES: "HOME_APPLIANCES",
  FURNITURE: "FURNITURE",
  BOOKS: "BOOKS",
  SPORTS: "SPORTS",
  TOYS: "TOYS",
  AUTOMOTIVE: "AUTOMOTIVE",
  OTHER: "OTHERS",
} as const;

export type Category = (typeof CategoryEnum)[keyof typeof CategoryEnum] | "ALL";
//export type Category = Database["public"]["Enums"]["auction_category"] | "ALL";
export type AuctionStatus = Database["public"]["Enums"]["auction_status"];
export type AuctionListType =
  "ALL" | "MY_AUCTIONS" | "PARTICIPATING" | "WATCHLIST";

export type Auction = Database["public"]["Tables"]["auctions"]["Row"];
export type AuctionImages =
  Database["public"]["Tables"]["auction_images"]["Row"];
export type Bid = Database["public"]["Tables"]["bids"]["Row"];
export type RPC = keyof Database["public"]["Functions"];

export type rpcType = Exclude<AuctionListType, "MY_AUCTIONS" | "ALL">;
export const RPC_BY_TYPE: Partial<Record<rpcType, RPC>> = {
  PARTICIPATING: "get_participating_auctions",
  WATCHLIST: "get_watchlist_auctions",
};

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
  user_id?: string;
}

export type GetAuctionsResponse = {
  data: FullAuction[] | null;
  count: number;
};

export type AuctionForm =
  Database["public"]["Functions"]["create_auction"]["Args"];

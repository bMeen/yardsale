import type { Database } from "@/shared/supabase/database.types";
import type { Profile } from "../identity/types";
import * as z from "zod";

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

export type VisibleStatus = Exclude<AuctionStatus, "CANCELLED">;

export type AuctionBid = Pick<Bid, "id" | "amount" | "status" | "created_at">;
export type Image = Pick<AuctionImages, "display_order" | "storage_path">;
export type User = Pick<Profile, "id" | "username" | "avatar_url">;
export type HighestBid = Pick<Bid, "id" | "amount" | "created_at"> & {
  bidder: User;
};

export type AuctionDetails = {
  id: string;
  title: string;
  description: string;
  category: Category;

  starting_price: number;
  current_price: number;
  bid_count: number;

  starts_at: string;
  ends_at: string;
  created_at: string;
  updated_at: string;
  settled_at: string | null;

  status: AuctionStatus;

  seller: User;
  winner: User | null;
  highest_bid: HighestBid | null;

  my_bid: AuctionBid | null;
  is_leading: boolean;
  is_watchlisted: boolean;

  auction_images: Image[];
};

export type AuctionDetailsBid = AuctionBid & {
  bidder: User;
  total_count: number;
};

export const schema = z.object({
  title: z
    .string({
      error: "Title is required",
    })
    .trim()
    .min(1, "Title is required"),

  description: z
    .string({
      error: "Description is required",
    })
    .trim()
    .min(1, "Description is required"),

  category: z.enum(CategoryEnum, {
    error: "Category is required",
  }),

  /*  starting_price: z
    .number({
      error: "Starting price is required",
    })
    .positive("Starting price must be greater than 0"), */
  starting_price: z
    .union([z.string(), z.number()])
    .transform((value) => {
      if (value === "") return undefined;
      return Number(value);
    })
    .refine((value) => value !== undefined, {
      message: "Starting price is required",
    })
    .refine((value) => value > 0, {
      message: "Starting price must be greater than 0",
    }),

  starts_at: z.date({
    message: "Start date and time are required",
  }),

  ends_at: z.date({
    message: "End date and time are required",
  }),

  temp_image_paths: z
    .array(z.string(), { error: "At least one image is required" })
    .min(1, "At least one image is required.")
    .max(3, "You can upload a maximum of 3 images."),
});
/*   .refine((data) => data.starts_at > new Date(), {
    message: "Auction must start in the future",
    path: ["starts_at"],
  })
  .refine((data) => data.ends_at.getTime() > data.starts_at.getTime(), {
    message: "End date and time must be after the start date and time",
    path: ["ends_at"],
  }); */

export type FormFields = z.infer<typeof schema>;

export type AuctionFormFields = Omit<FormFields, "starting_price"> & {
  starting_price: string | number;
};

export type PlaceBid = Database["public"]["Functions"]["submit_bid"]["Args"];

export type CancelBid = Database["public"]["Functions"]["cancel_bid"]["Args"];

export type ToggleWatchlist =
  Database["public"]["Functions"]["toggle_watchlist"]["Args"];

export type CreateAuction =
  Database["public"]["Functions"]["create_auction"]["Args"];

export type UpdateAuction =
  Database["public"]["Functions"]["update_auction"]["Args"];

export type CancelAuction =
  Database["public"]["Functions"]["cancel_auction"]["Args"];

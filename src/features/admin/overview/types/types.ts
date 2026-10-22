import type { AuctionStatus, User } from "@/features/auction/types";

export type DashboardRevenue = {
  listing_fee: number;
  settlement_fee: number;
  system_auction_proceeds: number;
  total: number;
};

export type DashboardActivity = {
  id: string;
  image: string;
  current_price: number;
  status: AuctionStatus;
  title: string;
  updated_at: string;
  seller: User;
};

export type DashboardStat = {
  funds_minted: number;
  total_auctions: number;
  total_bids: number;
  total_users: number;
  auction_counts_by_status: Record<AuctionStatus, number>;
  revenue: DashboardRevenue;
  recent_activity: DashboardActivity[];
};

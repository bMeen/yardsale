import type { AuctionListType } from "@/features/auction/types";
import { Bell, Home, Plus, Tag, User } from "lucide-react";

export const NAVIGATIONS = [
  { id: "home", icon: Home, label: "Home", href: "discover" },
  { id: "auctions", icon: Tag, label: "Auctions", href: "auctions" },
  { id: "create", icon: Plus, label: "", href: "auctions/create" },
  { id: "activity", icon: Bell, label: "Activity", href: "activity" },
  { id: "profile", icon: User, label: "Profile", href: "profile" },
];

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const PER_PAGE = 10;
export const KOBO_RATE = 100;

export const AUCTIONTABS: AuctionListType[] = [
  "ALL",
  "PARTICIPATING",
  "MY_AUCTIONS",
];

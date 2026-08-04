import type { LucideIcon } from "lucide-react";
import type { AuctionListType } from "@/features/auction/types";
import type { NotificationType } from "@/features/notification/types";
import {
  Bell,
  Home,
  Plus,
  Tag,
  User,
  AlertTriangle,
  Ban,
  CheckCircle2,
  CreditCard,
  Play,
  RefreshCw,
  Shield,
  Timer,
  Trophy,
  XCircle,
  CircleX,
} from "lucide-react";

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const PER_PAGE = 10;
export const KOBO_RATE = 100;

export const NAVIGATIONS = [
  { id: "home", icon: Home, label: "Home", href: "discover" },
  { id: "auctions", icon: Tag, label: "Auctions", href: "auctions" },
  { id: "create", icon: Plus, label: "", href: "auctions/create" },
  { id: "activity", icon: Bell, label: "Activity", href: "activity" },
  { id: "profile", icon: User, label: "Profile", href: "profile" },
];

export const AUCTIONTABS: AuctionListType[] = [
  "ALL",
  "PARTICIPATING",
  "MY_AUCTIONS",
];

export const ACTIVITYNAVIGATIONS = [
  { label: "Notification", href: ".", end: true },
  { label: "Watchlist", href: "watchlists" },
];

type NotificationConfig = {
  icon: LucideIcon;
  title: string;
  className: string;
};

export const NOTIFICATION_CONFIG: Record<NotificationType, NotificationConfig> =
  {
    AUCTION_STARTED: {
      icon: Play,
      title: "Auction Started",
      className: "text-blue-600 bg-blue-50 border-blue-100",
    },

    AUCTION_ENDED: {
      icon: Timer,
      title: "Auction Ended",
      className: "text-slate-600 bg-slate-50 border-slate-100",
    },

    AUCTION_ENDING_SOON: {
      icon: Timer,
      title: "Ending Soon",
      className: "text-orange-600 bg-orange-50 border-orange-100",
    },

    OUTBID: {
      icon: AlertTriangle,
      title: "You've Been Outbid",
      className: "text-red-600 bg-red-50 border-red-100",
    },

    BID_CANCELLED: {
      icon: CircleX,
      title: "Bid Cancelled",
      className: "text-stone-600 bg-stone-50 border-stone-100",
    },

    AUCTION_WON: {
      icon: Trophy,
      title: "Auction Won",
      className: "text-amber-600 bg-amber-50 border-amber-100",
    },

    AUCTION_LOST: {
      icon: XCircle,
      title: "Auction Lost",
      className: "text-stone-600 bg-stone-50 border-stone-100",
    },

    PAYMENT_RECEIVED: {
      icon: CreditCard,
      title: "Payment Received",
      className: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },

    WALLET_RESET: {
      icon: RefreshCw,
      title: "Wallet Reset",
      className: "text-violet-600 bg-violet-50 border-violet-100",
    },

    ADMIN_CANCELLED_AUCTION: {
      icon: Ban,
      title: "Auction Cancelled",
      className: "text-red-600 bg-red-50 border-red-100",
    },

    ACCOUNT_SUSPENDED: {
      icon: Ban,
      title: "Account Suspended",
      className: "text-red-600 bg-red-50 border-red-100",
    },

    ACCOUNT_DEACTIVATED: {
      icon: Shield,
      title: "Account Deactivated",
      className: "text-stone-600 bg-stone-50 border-stone-100",
    },

    ACCOUNT_REACTIVATED: {
      icon: CheckCircle2,
      title: "Account Reactivated",
      className: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
  };

import type { LucideIcon } from "lucide-react";
import type { AuctionListType, AuctionStatus } from "@/features/auction/types";
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
  Play,
  RefreshCw,
  Shield,
  Timer,
  Trophy,
  XCircle,
  CircleX,
  Wallet,
  Lock,
  Unlock,
  RefreshCcw,
  Percent,
  BanknoteArrowDownIcon,
} from "lucide-react";
import type {
  WalletEntryType,
  ActivityDirection,
} from "@/features/wallet/types";

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const PER_PAGE = 10;
export const KOBO_RATE = 100;

export const STALE_TIME = {
  SHORT: 30 * SECOND,
  MINUTE: MINUTE,
  FIVE_MINUTES: 5 * MINUTE,
  THIRTY_MINUTES: 30 * MINUTE,
  HOUR,
};

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
  "WATCHLIST",
];

export const ACTIVITYNAVIGATIONS = [
  { label: "Notification", href: ".", end: true },
  { label: "Transactions", href: "transactions" },
];

export const AUCTIONSTATUSOPTIONS: {
  label: string;
  value: AuctionStatus | null;
}[] = [
  { label: "Status", value: null },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Active", value: "ACTIVE" },
  { label: "Ended", value: "ENDED" },
  { label: "Settled", value: "SETTLED" },
  //{ label: "Cancelled", value: "CANCELLED" },
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
      className: "text-blue-600 bg-blue-50",
    },

    AUCTION_ENDED: {
      icon: Timer,
      title: "Auction Ended",
      className: "text-slate-600 bg-slate-50",
    },

    AUCTION_ENDING_SOON: {
      icon: Timer,
      title: "Ending Soon",
      className: "text-orange-600 bg-orange-50",
    },

    OUTBID: {
      icon: AlertTriangle,
      title: "You've Been Outbid",
      className: "text-red-600 bg-red-50",
    },

    BID_CANCELLED: {
      icon: CircleX,
      title: "Bid Cancelled",
      className: "text-stone-600 bg-stone-50",
    },

    AUCTION_WON: {
      icon: Trophy,
      title: "Auction Won",
      className: "text-amber-600 bg-amber-50",
    },

    AUCTION_LOST: {
      icon: XCircle,
      title: "Auction Lost",
      className: "text-stone-600 bg-stone-50",
    },

    PAYMENT_RECEIVED: {
      icon: Wallet,
      title: "Payment Received",
      className: "text-emerald-600 bg-emerald-50",
    },

    WALLET_RESET: {
      icon: RefreshCw,
      title: "Wallet Reset",
      className: "text-violet-600 bg-violet-50",
    },

    ADMIN_CANCELLED_AUCTION: {
      icon: Ban,
      title: "Auction Cancelled",
      className: "text-red-600 bg-red-50",
    },

    ACCOUNT_SUSPENDED: {
      icon: Ban,
      title: "Account Suspended",
      className: "text-red-600 bg-red-50",
    },

    ACCOUNT_DEACTIVATED: {
      icon: Shield,
      title: "Account Deactivated",
      className: "text-stone-600 bg-stone-50",
    },

    ACCOUNT_REACTIVATED: {
      icon: CheckCircle2,
      title: "Account Reactivated",
      className: "text-emerald-600 bg-emerald-50",
    },
  };

export const ICON_BY_ENTRY_TYPE: Record<WalletEntryType, LucideIcon> = {
  LISTING_FEE: Tag,
  BID_RESERVATION: Lock,
  BID_RELEASE: Unlock,
  SETTLEMENT_FEE: Percent,
  SETTLEMENT: BanknoteArrowDownIcon,
  WALLET_RESET: RefreshCcw,
  INITIAL_CREDIT: Wallet,
};

export const DIRECTION_STYLE: Record<
  ActivityDirection,
  { text: string; icon: string; sign: string }
> = {
  CREDIT: {
    text: "text-emerald-600",
    icon: "text-emerald-600 bg-emerald-50",
    sign: "+",
  },
  DEBIT: {
    text: "text-red-600",
    icon: "text-red-600 bg-red-50",
    sign: "-",
  },
  HOLD: {
    text: "text-amber-600",
    icon: "text-amber-600 bg-amber-500/10",
    sign: "",
  },
  RELEASE: {
    text: "text-blue-600",
    icon: "text-blue-600 bg-blue-500/10",
    sign: "",
  },
};

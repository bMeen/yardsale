import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard,
  Users,
  Gavel,
  TrendingUp,
  FileText,
  LogOut,
  Search,
  ChevronLeft,
  Info,
  Plus,
  Eye,
  Ban,
  UserCheck,
  UserX,
  X,
  AlertTriangle,
  Clock,
  Shield,
  Upload,
  Trash2,
  Activity,
  Check,
  ExternalLink,
  Star,
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type AdminPage =
  | "dashboard"
  | "users"
  | "user-detail"
  | "auctions"
  | "auction-detail"
  | "system-auctions"
  | "revenue"
  | "audit-log";

type UserStatus = "Active" | "Suspended" | "Deactivated";
type AuctionStatus = "Scheduled" | "Active" | "Ended" | "Settled" | "Cancelled";
type AuditAction =
  | "suspend_user"
  | "reactivate_user"
  | "deactivate_user"
  | "force_cancel_auction"
  | "create_system_auction";

interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  status: UserStatus;
  joinedAt: Date;
  salesCount: number;
  purchaseCount: number;
  walletBalance: number;
  reservedBalance: number;
}

interface AdminAuction {
  id: string;
  title: string;
  thumbnail: string;
  seller: string;
  sellerName: string;
  category: string;
  status: AuctionStatus;
  currentBid: number;
  startingPrice: number;
  bidCount: number;
  endsAt: Date;
  createdAt: Date;
  isSystem: boolean;
  description: string;
  images: string[];
}

interface AuditEntry {
  id: string;
  timestamp: Date;
  admin: string;
  action: AuditAction;
  targetType: "user" | "auction";
  targetId: string;
  targetName: string;
  reason?: string;
}

interface LedgerEntry {
  id: string;
  date: Date;
  source: string;
  auctionId?: string;
  auctionTitle?: string;
  entryType: "listing_fee" | "settlement_fee";
  amount: number;
}

interface AdminConfirmState {
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: "destructive" | "default";
  warning?: string;
  requiresReason?: boolean;
  onConfirm: (reason?: string) => void;
}

interface AdminBid {
  id: string;
  auctionId: string;
  bidderName: string;
  bidderUsername: string;
  bidderAvatar: string;
  amount: number;
  timestamp: Date;
}

// ─── SAMPLE DATA ──────────────────────────────────────────────────────────────

const SAMPLE_ADMIN_USERS: AdminUser[] = [
  {
    id: "u1",
    name: "Jordan Martins",
    username: "jordan_m",
    email: "jordan@yardsale.ng",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
    status: "Active",
    joinedAt: new Date("2024-03-15"),
    salesCount: 8,
    purchaseCount: 12,
    walletBalance: 485500,
    reservedBalance: 130500,
  },
  {
    id: "u2",
    name: "Adaeze Okonkwo",
    username: "adaeze_ok",
    email: "adaeze@yardsale.ng",
    avatar:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format",
    status: "Active",
    joinedAt: new Date("2024-04-02"),
    salesCount: 15,
    purchaseCount: 7,
    walletBalance: 320000,
    reservedBalance: 0,
  },
  {
    id: "u3",
    name: "Emeka Nwosu",
    username: "emeka_n",
    email: "emeka@yardsale.ng",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format",
    status: "Suspended",
    joinedAt: new Date("2023-11-20"),
    salesCount: 3,
    purchaseCount: 21,
    walletBalance: 95000,
    reservedBalance: 45000,
  },
  {
    id: "u4",
    name: "Fatima Al-Hassan",
    username: "fatima_ah",
    email: "fatima@yardsale.ng",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format",
    status: "Active",
    joinedAt: new Date("2024-01-08"),
    salesCount: 22,
    purchaseCount: 18,
    walletBalance: 1240000,
    reservedBalance: 250000,
  },
  {
    id: "u5",
    name: "Chidi Okeke",
    username: "chidi_ok",
    email: "chidi@yardsale.ng",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&auto=format",
    status: "Deactivated",
    joinedAt: new Date("2023-06-14"),
    salesCount: 1,
    purchaseCount: 5,
    walletBalance: 15000,
    reservedBalance: 0,
  },
  {
    id: "u6",
    name: "Blessing Eze",
    username: "bless_e",
    email: "blessing@yardsale.ng",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&auto=format",
    status: "Active",
    joinedAt: new Date("2024-06-30"),
    salesCount: 4,
    purchaseCount: 9,
    walletBalance: 180000,
    reservedBalance: 60000,
  },
  {
    id: "u7",
    name: "Tunde Adesanya",
    username: "tunde_a",
    email: "tunde@yardsale.ng",
    avatar:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=80&h=80&fit=crop&auto=format",
    status: "Suspended",
    joinedAt: new Date("2024-02-19"),
    salesCount: 6,
    purchaseCount: 14,
    walletBalance: 225000,
    reservedBalance: 75000,
  },
];

const SAMPLE_ADMIN_AUCTIONS: AdminAuction[] = [
  {
    id: "a1",
    title: "Vintage Leather Sofa Set",
    thumbnail:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=160&h=120&fit=crop&auto=format",
    seller: "u4",
    sellerName: "Fatima Al-Hassan",
    category: "Furniture",
    status: "Active",
    currentBid: 285000,
    startingPrice: 150000,
    bidCount: 12,
    endsAt: new Date(Date.now() + 2 * 3600000),
    createdAt: new Date(Date.now() - 24 * 3600000),
    isSystem: false,
    description:
      "A beautiful 3-piece vintage leather sofa set in excellent condition. Original upholstery, minor wear on armrests only.",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=600&fit=crop&auto=format",
    ],
  },
  {
    id: "a2",
    title: "Canon EOS R5 Camera Body",
    thumbnail:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=160&h=120&fit=crop&auto=format",
    seller: "u2",
    sellerName: "Adaeze Okonkwo",
    category: "Electronics",
    status: "Active",
    currentBid: 890000,
    startingPrice: 600000,
    bidCount: 24,
    endsAt: new Date(Date.now() + 5 * 3600000),
    createdAt: new Date(Date.now() - 48 * 3600000),
    isSystem: false,
    description:
      "Canon EOS R5 camera body, mint condition, under 5,000 actuations. Original box and accessories included.",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop&auto=format",
    ],
  },
  {
    id: "a3",
    title: "Handwoven Aso-Oke Fabric",
    thumbnail:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=160&h=120&fit=crop&auto=format",
    seller: "u1",
    sellerName: "Jordan Martins",
    category: "Fashion",
    status: "Scheduled",
    currentBid: 45000,
    startingPrice: 45000,
    bidCount: 0,
    endsAt: new Date(Date.now() + 3 * 24 * 3600000),
    createdAt: new Date(Date.now() - 12 * 3600000),
    isSystem: false,
    description:
      "Authentic handwoven Aso-Oke fabric, perfect for special occasions and traditional ceremonies.",
    images: [
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=600&fit=crop&auto=format",
    ],
  },
  {
    id: "a4",
    title: "Antique Wall Clock",
    thumbnail:
      "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=160&h=120&fit=crop&auto=format",
    seller: "u6",
    sellerName: "Blessing Eze",
    category: "Collectibles",
    status: "Settled",
    currentBid: 128000,
    startingPrice: 80000,
    bidCount: 8,
    endsAt: new Date(Date.now() - 2 * 24 * 3600000),
    createdAt: new Date(Date.now() - 8 * 24 * 3600000),
    isSystem: false,
    description:
      "Victorian era antique wall clock in full working condition. Original pendulum and key included.",
    images: [
      "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=800&h=600&fit=crop&auto=format",
    ],
  },
  {
    id: "a5",
    title: "Industrial Standing Desk",
    thumbnail:
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=160&h=120&fit=crop&auto=format",
    seller: "u7",
    sellerName: "Tunde Adesanya",
    category: "Furniture",
    status: "Cancelled",
    currentBid: 0,
    startingPrice: 95000,
    bidCount: 0,
    endsAt: new Date(Date.now() - 24 * 3600000),
    createdAt: new Date(Date.now() - 5 * 24 * 3600000),
    isSystem: false,
    description:
      "Height-adjustable industrial standing desk with integrated cable management.",
    images: [
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=600&fit=crop&auto=format",
    ],
  },
  {
    id: "a6",
    title: "YardSale Platform Collectible #001",
    thumbnail:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&h=120&fit=crop&auto=format",
    seller: "system",
    sellerName: "YardSale Platform",
    category: "Collectibles",
    status: "Active",
    currentBid: 250000,
    startingPrice: 100000,
    bidCount: 18,
    endsAt: new Date(Date.now() + 12 * 3600000),
    createdAt: new Date(Date.now() - 36 * 3600000),
    isSystem: true,
    description:
      "The very first platform collectible issued by YardSale. Comes with a certificate of authenticity.",
    images: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop&auto=format",
    ],
  },
  {
    id: "a7",
    title: "Roland FP-90X Digital Piano",
    thumbnail:
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=160&h=120&fit=crop&auto=format",
    seller: "u2",
    sellerName: "Adaeze Okonkwo",
    category: "Music",
    status: "Ended",
    currentBid: 420000,
    startingPrice: 350000,
    bidCount: 6,
    endsAt: new Date(Date.now() - 3600000),
    createdAt: new Date(Date.now() - 7 * 24 * 3600000),
    isSystem: false,
    description:
      "Roland FP-90X digital piano with premium stand and sustain pedal. Barely used, less than 6 months old.",
    images: [
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&h=600&fit=crop&auto=format",
    ],
  },
];

const SAMPLE_ADMIN_BIDS: AdminBid[] = [
  {
    id: "b1",
    auctionId: "a1",
    bidderName: "Jordan Martins",
    bidderUsername: "jordan_m",
    bidderAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&auto=format",
    amount: 285000,
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: "b2",
    auctionId: "a1",
    bidderName: "Emeka Nwosu",
    bidderUsername: "emeka_n",
    bidderAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=48&h=48&fit=crop&auto=format",
    amount: 260000,
    timestamp: new Date(Date.now() - 5400000),
  },
  {
    id: "b3",
    auctionId: "a1",
    bidderName: "Tunde Adesanya",
    bidderUsername: "tunde_a",
    bidderAvatar:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=48&h=48&fit=crop&auto=format",
    amount: 240000,
    timestamp: new Date(Date.now() - 7200000),
  },
  {
    id: "b4",
    auctionId: "a2",
    bidderName: "Blessing Eze",
    bidderUsername: "bless_e",
    bidderAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=48&h=48&fit=crop&auto=format",
    amount: 890000,
    timestamp: new Date(Date.now() - 1800000),
  },
  {
    id: "b5",
    auctionId: "a2",
    bidderName: "Jordan Martins",
    bidderUsername: "jordan_m",
    bidderAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&auto=format",
    amount: 850000,
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: "b6",
    auctionId: "a6",
    bidderName: "Fatima Al-Hassan",
    bidderUsername: "fatima_ah",
    bidderAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&h=48&fit=crop&auto=format",
    amount: 250000,
    timestamp: new Date(Date.now() - 900000),
  },
];

const REVENUE_CHART_DATA = [
  { week: "Jul 14", listingFees: 85000, settlementFees: 240000 },
  { week: "Jul 21", listingFees: 120000, settlementFees: 380000 },
  { week: "Jul 28", listingFees: 95000, settlementFees: 290000 },
  { week: "Aug 4", listingFees: 145000, settlementFees: 420000 },
  { week: "Aug 11", listingFees: 110000, settlementFees: 350000 },
  { week: "Aug 18", listingFees: 160000, settlementFees: 510000 },
  { week: "Aug 25", listingFees: 130000, settlementFees: 460000 },
  { week: "Sep 1", listingFees: 175000, settlementFees: 580000 },
];

const SAMPLE_LEDGER: LedgerEntry[] = [
  {
    id: "l1",
    date: new Date(Date.now() - 2 * 3600000),
    source: "Jordan Martins",
    auctionId: "a3",
    auctionTitle: "Handwoven Aso-Oke Fabric",
    entryType: "listing_fee",
    amount: 5000,
  },
  {
    id: "l2",
    date: new Date(Date.now() - 3 * 3600000),
    source: "Blessing Eze",
    auctionId: "a4",
    auctionTitle: "Antique Wall Clock",
    entryType: "settlement_fee",
    amount: 12800,
  },
  {
    id: "l3",
    date: new Date(Date.now() - 5 * 3600000),
    source: "Blessing Eze",
    auctionId: "a4",
    auctionTitle: "Antique Wall Clock",
    entryType: "listing_fee",
    amount: 5000,
  },
  {
    id: "l4",
    date: new Date(Date.now() - 8 * 3600000),
    source: "Adaeze Okonkwo",
    auctionId: "a2",
    auctionTitle: "Canon EOS R5 Camera Body",
    entryType: "listing_fee",
    amount: 5000,
  },
  {
    id: "l5",
    date: new Date(Date.now() - 10 * 3600000),
    source: "Fatima Al-Hassan",
    auctionId: "a1",
    auctionTitle: "Vintage Leather Sofa Set",
    entryType: "listing_fee",
    amount: 5000,
  },
  {
    id: "l6",
    date: new Date(Date.now() - 24 * 3600000),
    source: "Adaeze Okonkwo",
    auctionId: "a7",
    auctionTitle: "Roland FP-90X Digital Piano",
    entryType: "settlement_fee",
    amount: 42000,
  },
  {
    id: "l7",
    date: new Date(Date.now() - 26 * 3600000),
    source: "Adaeze Okonkwo",
    auctionId: "a7",
    auctionTitle: "Roland FP-90X Digital Piano",
    entryType: "listing_fee",
    amount: 5000,
  },
  {
    id: "l8",
    date: new Date(Date.now() - 30 * 3600000),
    source: "Tunde Adesanya",
    auctionId: "a5",
    auctionTitle: "Industrial Standing Desk",
    entryType: "listing_fee",
    amount: 5000,
  },
  {
    id: "l9",
    date: new Date(Date.now() - 2 * 24 * 3600000),
    source: "Fatima Al-Hassan",
    auctionId: "a1",
    auctionTitle: "Vintage Leather Sofa Set",
    entryType: "settlement_fee",
    amount: 28500,
  },
  {
    id: "l10",
    date: new Date(Date.now() - 3 * 24 * 3600000),
    source: "Blessing Eze",
    auctionId: "a4",
    auctionTitle: "Antique Wall Clock",
    entryType: "listing_fee",
    amount: 5000,
  },
];

const SAMPLE_AUDIT_LOG: AuditEntry[] = [
  {
    id: "al1",
    timestamp: new Date(Date.now() - 3600000),
    admin: "Admin",
    action: "suspend_user",
    targetType: "user",
    targetId: "u3",
    targetName: "Emeka Nwosu",
    reason: "Multiple policy violations reported by sellers",
  },
  {
    id: "al2",
    timestamp: new Date(Date.now() - 6 * 3600000),
    admin: "Admin",
    action: "force_cancel_auction",
    targetType: "auction",
    targetId: "a5",
    targetName: "Industrial Standing Desk",
    reason: "Seller suspended; auction cancelled per policy",
  },
  {
    id: "al3",
    timestamp: new Date(Date.now() - 8 * 3600000),
    admin: "Admin",
    action: "suspend_user",
    targetType: "user",
    targetId: "u7",
    targetName: "Tunde Adesanya",
    reason: "Repeated non-payment after winning auctions",
  },
  {
    id: "al4",
    timestamp: new Date(Date.now() - 2 * 24 * 3600000),
    admin: "Admin",
    action: "create_system_auction",
    targetType: "auction",
    targetId: "a6",
    targetName: "YardSale Platform Collectible #001",
  },
  {
    id: "al5",
    timestamp: new Date(Date.now() - 3 * 24 * 3600000),
    admin: "Admin",
    action: "deactivate_user",
    targetType: "user",
    targetId: "u5",
    targetName: "Chidi Okeke",
    reason: "Account permanently closed per user request",
  },
  {
    id: "al6",
    timestamp: new Date(Date.now() - 4 * 24 * 3600000),
    admin: "Admin",
    action: "reactivate_user",
    targetType: "user",
    targetId: "u3",
    targetName: "Emeka Nwosu",
  },
  {
    id: "al7",
    timestamp: new Date(Date.now() - 7 * 24 * 3600000),
    admin: "Admin",
    action: "suspend_user",
    targetType: "user",
    targetId: "u3",
    targetName: "Emeka Nwosu",
    reason: "Suspicious bidding patterns detected",
  },
];

const DASHBOARD_KPIS = {
  totalUsers: 1284,
  totalAuctions: 347,
  totalBids: 2891,
  platformRevenue: 4820000,
  statusBreakdown: {
    Active: 23,
    Scheduled: 41,
    Ended: 189,
    Settled: 87,
    Cancelled: 7,
  },
};

const CATEGORIES = [
  "Electronics",
  "Furniture",
  "Fashion",
  "Books",
  "Art",
  "Collectibles",
  "Jewelry",
  "Music",
  "Sports",
  "Vehicles",
  "Other",
];

const DEMO_IMAGES = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop&auto=format",
];

// ─── UTILITIES ────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return "₦" + n.toLocaleString("en-NG");
}
function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function fmtDateTime(d: Date): string {
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function relTime(d: Date): string {
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const ACTION_LABELS: Record<AuditAction, string> = {
  suspend_user: "Suspend User",
  reactivate_user: "Reactivate User",
  deactivate_user: "Deactivate User",
  force_cancel_auction: "Force Cancel Auction",
  create_system_auction: "Create System Auction",
};

// ─── STATUS BADGES ────────────────────────────────────────────────────────────

function UserStatusBadge({ status }: { status: UserStatus }) {
  const s: Record<UserStatus, string> = {
    Active: "bg-emerald-100 text-emerald-700",
    Suspended: "bg-amber-100 text-amber-700",
    Deactivated: "bg-stone-100 text-stone-500",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${s[status]}`}
    >
      {status}
    </span>
  );
}

function AuctionStatusBadge({ status }: { status: AuctionStatus }) {
  const s: Record<AuctionStatus, string> = {
    Scheduled: "bg-blue-100 text-blue-700",
    Active: "bg-emerald-100 text-emerald-700",
    Ended: "bg-stone-100 text-stone-600",
    Settled: "bg-violet-100 text-violet-700",
    Cancelled: "bg-red-100 text-red-600",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${s[status]}`}
    >
      {status}
    </span>
  );
}

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────

function AdminConfirmDialog({
  dialog,
  onClose,
}: {
  dialog: AdminConfirmState;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const canConfirm = !dialog.requiresReason || reason.trim().length >= 5;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
    >
      <div className="bg-card w-full max-w-md space-y-5 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">{dialog.title}</h3>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              {dialog.message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground mt-0.5 shrink-0"
          >
            <X size={18} />
          </button>
        </div>
        {dialog.warning && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <AlertTriangle
              size={15}
              className="mt-0.5 shrink-0 text-amber-600"
            />
            <p className="text-xs leading-relaxed text-amber-800">
              {dialog.warning}
            </p>
          </div>
        )}
        {dialog.requiresReason && (
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-semibold tracking-wider uppercase">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the reason for this action…"
              className="bg-muted focus:ring-primary/30 w-full resize-none rounded-xl px-3 py-2.5 text-sm transition outline-none focus:ring-2"
            />
            {reason.trim().length > 0 && reason.trim().length < 5 && (
              <p className="mt-1 text-xs text-red-500">
                Minimum 5 characters required.
              </p>
            )}
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 h-10 flex-1 rounded-xl border text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (canConfirm) {
                dialog.onConfirm(reason || undefined);
                onClose();
              }
            }}
            disabled={!canConfirm}
            className={`h-10 flex-1 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 ${
              dialog.confirmVariant === "destructive"
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {dialog.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────

function AdminToast({
  message,
  type,
  onDismiss,
}: {
  message: string;
  type: "success" | "error";
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div
      className={`fixed right-6 bottom-6 z-[60] flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-xl ${
        type === "success"
          ? "bg-foreground text-background"
          : "bg-red-600 text-white"
      }`}
    >
      {type === "success" ? <Check size={15} /> : <X size={15} />}
      {message}
    </div>
  );
}

// ─── ADMIN LOGIN ──────────────────────────────────────────────────────────────

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 900);
  };

  return (
    <div className="bg-secondary flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="mb-5 inline-flex items-center gap-3">
            <div className="bg-primary flex h-11 w-11 items-center justify-center rounded-xl shadow-sm">
              <Gavel size={19} className="text-primary-foreground" />
            </div>
            <div className="text-left">
              <span className="font-display block text-2xl leading-none font-extrabold tracking-widest uppercase">
                YardSale
              </span>
              <span className="text-muted-foreground mt-0.5 block text-[10px] font-bold tracking-[0.2em] uppercase">
                Admin Portal
              </span>
            </div>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Administrative access only.
            <br />
            Unauthorized access is prohibited.
          </p>
        </div>

        <div className="bg-card border-border rounded-2xl border p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-muted-foreground mb-2 block text-xs font-semibold tracking-wider uppercase">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yardsale.ng"
                autoComplete="email"
                className="bg-muted focus:ring-primary/30 h-11 w-full rounded-xl px-4 text-sm transition outline-none focus:bg-white focus:ring-2"
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block text-xs font-semibold tracking-wider uppercase">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="bg-muted focus:ring-primary/30 h-11 w-full rounded-xl px-4 text-sm transition outline-none focus:bg-white focus:ring-2"
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-1 h-11 w-full rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-muted-foreground mt-6 text-center text-xs">
          YardSale Operations · Restricted Workspace
        </p>
      </div>
    </div>
  );
}

// ─── TOP NAV ──────────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: AdminPage; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "auctions", label: "Auctions", icon: Gavel },
  { id: "system-auctions", label: "System Auctions", icon: Star },
  { id: "revenue", label: "Revenue", icon: TrendingUp },
  { id: "audit-log", label: "Audit Log", icon: FileText },
];

const PAGE_TO_NAV: Partial<Record<AdminPage, AdminPage>> = {
  "user-detail": "users",
  "auction-detail": "auctions",
};

function AdminTopNav({
  page,
  onNavigate,
  onLogout,
}: {
  page: AdminPage;
  onNavigate: (p: AdminPage) => void;
  onLogout: () => void;
}) {
  const activeNav = PAGE_TO_NAV[page] ?? page;

  return (
    <header className="border-border bg-background flex h-14 shrink-0 items-center gap-4 border-b px-5">
      {/* Logo */}
      <div className="mr-2 flex shrink-0 items-center gap-2.5">
        <div className="bg-primary flex h-7 w-7 items-center justify-center rounded-lg">
          <Gavel size={13} className="text-primary-foreground" />
        </div>
        <div className="leading-none">
          <span className="font-display text-lg font-extrabold tracking-widest uppercase">
            YardSale
          </span>
          <span className="text-primary bg-primary/10 ml-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-[0.18em] uppercase">
            Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 scrollbar-none items-center gap-0.5 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const active = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon size={13} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Admin + Logout */}
      <div className="ml-2 flex shrink-0 items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 flex h-7 w-7 items-center justify-center rounded-full">
            <Shield size={13} className="text-primary" />
          </div>
          <span className="hidden text-sm font-medium sm:block">Admin</span>
        </div>
        <button
          onClick={onLogout}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function AdminDashboard({
  auctions,
  onNavigate,
  onSelectAuction,
}: {
  auctions: AdminAuction[];
  onNavigate: (p: AdminPage) => void;
  onSelectAuction: (id: string) => void;
}) {
  const kpis = DASHBOARD_KPIS;
  const recentAuctions = [...auctions]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);

  const listingTotal = REVENUE_CHART_DATA.reduce(
    (s, d) => s + d.listingFees,
    0,
  );
  const settlementTotal = REVENUE_CHART_DATA.reduce(
    (s, d) => s + d.settlementFees,
    0,
  );
  const chartTotal = listingTotal + settlementTotal;

  const kpiCards = [
    {
      label: "Total Users",
      value: kpis.totalUsers.toLocaleString(),
      sub: "+24 this week",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Auctions",
      value: kpis.totalAuctions.toLocaleString(),
      sub: "+8 this week",
      icon: Gavel,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Total Bids",
      value: kpis.totalBids.toLocaleString(),
      sub: "+183 this week",
      icon: Activity,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Platform Revenue",
      value: fmt(kpis.platformRevenue),
      sub: "All-time",
      icon: TrendingUp,
      color: "bg-accent/20 text-amber-700",
    },
  ];

  const statusColors: Record<string, string> = {
    Active: "text-emerald-600",
    Scheduled: "text-blue-600",
    Ended: "text-stone-500",
    Settled: "text-violet-600",
    Cancelled: "text-red-500",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[2rem] leading-none font-bold tracking-tight uppercase">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Platform overview and marketplace activity
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Live
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((k) => (
          <div
            key={k.label}
            className="bg-card border-border rounded-2xl border p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  {k.label}
                </p>
                <p className="font-display mt-1.5 text-3xl leading-none font-bold">
                  {k.value}
                </p>
                <p className="text-muted-foreground mt-1.5 text-xs">{k.sub}</p>
              </div>
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${k.color}`}
              >
                <k.icon size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div className="bg-card border-border rounded-2xl border p-5">
        <p className="text-muted-foreground mb-4 text-xs font-semibold tracking-wider uppercase">
          Auction Status Breakdown
        </p>
        <div className="divide-border grid grid-cols-5 divide-x">
          {Object.entries(kpis.statusBreakdown).map(([status, count]) => (
            <div key={status} className="px-4 text-center first:pl-0 last:pr-0">
              <p
                className={`font-display text-2xl font-bold ${statusColors[status]}`}
              >
                {count}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">{status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Asymmetric analytics grid: 3 + 2 columns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Revenue chart — 3 cols */}
        <div className="bg-card border-border rounded-2xl border p-6 lg:col-span-3">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold">Revenue Breakdown</h2>
              <p className="text-muted-foreground mt-0.5 text-xs">
                8-week listing + settlement fees
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-xl font-bold">
                {fmt(chartTotal)}
              </p>
              <p className="text-muted-foreground text-xs">8-week total</p>
            </div>
          </div>
          <div className="mb-4 flex items-center gap-5">
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <span className="bg-primary inline-block h-2.5 w-3 rounded-sm" />
              Listing · {fmt(listingTotal)}
            </div>
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <span className="bg-accent inline-block h-2.5 w-3 rounded-sm" />
              Settlement · {fmt(settlementTotal)}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={REVENUE_CHART_DATA} barSize={13} barGap={3}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(26,18,8,0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: "#7A6B57" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#7A6B57" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                width={48}
              />
              <Tooltip
                formatter={(v: number) => fmt(v)}
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(26,18,8,0.1)",
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="listingFees"
                name="Listing Fees"
                fill="#C94B1F"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="settlementFees"
                name="Settlement Fees"
                fill="#E8A010"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent activity — 2 cols */}
        <div className="bg-card border-border flex flex-col rounded-2xl border p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Activity</h2>
            <button
              onClick={() => onNavigate("auctions")}
              className="text-primary text-xs font-semibold hover:underline"
            >
              View all
            </button>
          </div>
          <div className="flex-1 scrollbar-none space-y-0.5 overflow-y-auto">
            {recentAuctions.map((a) => (
              <button
                key={a.id}
                onClick={() => onSelectAuction(a.id)}
                className="hover:bg-muted flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors"
              >
                <img
                  src={a.thumbnail}
                  alt={a.title}
                  className="h-10 w-10 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {a.sellerName} · {relTime(a.createdAt)}
                  </p>
                </div>
                <AuctionStatusBadge status={a.status} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── USERS PAGE ───────────────────────────────────────────────────────────────

function AdminUsersPage({
  users,
  onSelectUser,
}: {
  users: AdminUser[];
  onSelectUser: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | UserStatus>("All");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const filtered = useMemo(() => {
    let list = users.filter((u) => {
      const q = search.toLowerCase();
      return (
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    });
    if (statusFilter !== "All")
      list = list.filter((u) => u.status === statusFilter);
    return [...list].sort((a, b) =>
      sort === "newest"
        ? b.joinedAt.getTime() - a.joinedAt.getTime()
        : a.joinedAt.getTime() - b.joinedAt.getTime(),
    );
  }, [users, search, statusFilter, sort]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[2rem] leading-none font-bold tracking-tight uppercase">
          Users
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage platform accounts and account access
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-card border-border flex h-10 min-w-[200px] flex-1 items-center gap-2 rounded-xl border px-3">
          <Search size={14} className="text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, username, email…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-1">
          {(["All", "Active", "Suspended", "Deactivated"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`h-9 rounded-full px-3 text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? "bg-foreground text-background"
                  : "bg-card border-border text-muted-foreground hover:text-foreground border"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="bg-card border-border text-muted-foreground h-9 cursor-pointer rounded-xl border px-3 text-sm outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <div className="bg-card border-border overflow-hidden rounded-2xl border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-border bg-muted/40 border-b">
                {["User", "Status", "Joined", "Sales", "Purchases", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className={`text-muted-foreground py-3 text-xs font-semibold tracking-wider uppercase ${
                        ["Sales", "Purchases"].includes(h)
                          ? "px-4 text-right"
                          : "px-5 text-left"
                      }`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-muted-foreground py-16 text-center text-sm"
                  >
                    No users match your filters.
                  </td>
                </tr>
              )}
              {filtered.map((u, i) => (
                <tr
                  key={u.id}
                  className={`border-border hover:bg-muted/20 border-b transition-colors last:border-0 ${i % 2 !== 0 ? "bg-muted/10" : ""}`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold">{u.name}</p>
                        <p className="text-muted-foreground font-mono text-xs">
                          @{u.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <UserStatusBadge status={u.status} />
                  </td>
                  <td className="text-muted-foreground px-5 py-4 text-sm">
                    {fmtDate(u.joinedAt)}
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-semibold">
                    {u.salesCount}
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-semibold">
                    {u.purchaseCount}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => onSelectUser(u.id)}
                      className="text-primary inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
                    >
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── USER DETAIL ──────────────────────────────────────────────────────────────

function AdminUserDetail({
  userId,
  users,
  auctions,
  setUsers,
  onBack,
  setConfirmDialog,
  showToast,
  addAuditEntry,
}: {
  userId: string;
  users: AdminUser[];
  auctions: AdminAuction[];
  setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>;
  onBack: () => void;
  setConfirmDialog: (d: AdminConfirmState | null) => void;
  showToast: (m: string, t: "success" | "error") => void;
  addAuditEntry: (e: Omit<AuditEntry, "id" | "timestamp" | "admin">) => void;
}) {
  const user = users.find((u) => u.id === userId);
  const [activeTab, setActiveTab] = useState<"auctions" | "bids">("auctions");
  if (!user) return null;

  const userAuctions = auctions.filter((a) => a.seller === userId);

  const updateStatus = (status: UserStatus) =>
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status } : u)),
    );

  const handleSuspend = () =>
    setConfirmDialog({
      title: "Suspend Account",
      message: `Suspend ${user.name}'s account? They will not be able to create auctions or place bids while suspended.`,
      confirmLabel: "Suspend",
      confirmVariant: "destructive",
      requiresReason: true,
      onConfirm: (reason) => {
        updateStatus("Suspended");
        addAuditEntry({
          action: "suspend_user",
          targetType: "user",
          targetId: userId,
          targetName: user.name,
          reason,
        });
        showToast(`${user.name} has been suspended.`, "success");
      },
    });

  const handleReactivate = () =>
    setConfirmDialog({
      title: "Reactivate Account",
      message: `Reactivate ${user.name}'s account? They will regain full platform access.`,
      confirmLabel: "Reactivate",
      onConfirm: () => {
        updateStatus("Active");
        addAuditEntry({
          action: "reactivate_user",
          targetType: "user",
          targetId: userId,
          targetName: user.name,
        });
        showToast(`${user.name}'s account has been reactivated.`, "success");
      },
    });

  const handleDeactivate = () => {
    if (user.reservedBalance > 0) return;
    setConfirmDialog({
      title: "Deactivate Account Permanently",
      message: `Permanently deactivate ${user.name}'s account? This cannot be undone.`,
      confirmLabel: "Deactivate Permanently",
      confirmVariant: "destructive",
      warning:
        "This is irreversible. The account will be permanently closed and cannot be recovered.",
      requiresReason: true,
      onConfirm: (reason) => {
        updateStatus("Deactivated");
        addAuditEntry({
          action: "deactivate_user",
          targetType: "user",
          targetId: userId,
          targetName: user.name,
          reason,
        });
        showToast(`${user.name}'s account has been deactivated.`, "success");
      },
    });
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ChevronLeft size={15} /> Back to Users
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="border-border h-14 w-14 rounded-2xl border object-cover"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-[2rem] leading-none font-bold tracking-tight uppercase">
                {user.name}
              </h1>
              <UserStatusBadge status={user.status} />
            </div>
            <p className="text-muted-foreground mt-1 text-sm">{user.email}</p>
            <p className="text-muted-foreground mt-0.5 font-mono text-xs">
              @{user.username} · Member since {fmtDate(user.joinedAt)}
            </p>
          </div>
        </div>

        {/* Moderation actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSuspend}
            disabled={user.status === "Deactivated"}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-40"
          >
            <Ban size={13} /> Suspend
          </button>
          <button
            onClick={handleReactivate}
            disabled={user.status === "Active"}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-40"
          >
            <UserCheck size={13} /> Reactivate
          </button>
          <div className="group relative">
            <button
              onClick={handleDeactivate}
              disabled={
                user.status === "Deactivated" || user.reservedBalance > 0
              }
              className="flex h-9 items-center gap-1.5 rounded-xl border border-red-300 bg-red-50 px-4 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-40"
            >
              <UserX size={13} /> Deactivate
            </button>
            {user.reservedBalance > 0 && (
              <div className="bg-foreground text-background pointer-events-none absolute top-full right-0 z-20 mt-1.5 w-60 rounded-xl px-3 py-2.5 text-xs opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                Cannot deactivate — user has {fmt(user.reservedBalance)}{" "}
                reserved in active bids.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wallet summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border-border rounded-2xl border p-5">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Available Balance
          </p>
          <p className="font-display mt-2 text-3xl font-bold">
            {fmt(user.walletBalance)}
          </p>
        </div>
        <div className="bg-card border-border rounded-2xl border p-5">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Reserved Balance
          </p>
          <p className="font-display mt-2 text-3xl font-bold">
            {fmt(user.reservedBalance)}
          </p>
          {user.reservedBalance > 0 && (
            <p className="mt-1.5 text-xs font-medium text-amber-600">
              Active bid reservations
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border-border overflow-hidden rounded-2xl border">
        <div className="border-border flex border-b">
          {(["auctions", "bids"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 text-sm font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? "text-primary border-primary -mb-px border-b-2"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "auctions"
                ? `Auctions (${userAuctions.length})`
                : "Bids"}
            </button>
          ))}
        </div>
        <div className="p-4">
          {activeTab === "auctions" &&
            (userAuctions.length === 0 ? (
              <p className="text-muted-foreground py-10 text-center text-sm">
                No auctions from this user.
              </p>
            ) : (
              <div className="space-y-1">
                {userAuctions.map((a) => (
                  <div
                    key={a.id}
                    className="hover:bg-muted flex items-center gap-3 rounded-xl p-3 transition-colors"
                  >
                    <img
                      src={a.thumbnail}
                      alt={a.title}
                      className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{a.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {a.category} · {a.bidCount} bid
                        {a.bidCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <AuctionStatusBadge status={a.status} />
                    <p className="shrink-0 font-mono text-sm font-semibold">
                      {fmt(a.currentBid || a.startingPrice)}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          {activeTab === "bids" && (
            <p className="text-muted-foreground py-10 text-center text-sm">
              Bid history is not available in this demo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── AUCTIONS PAGE ────────────────────────────────────────────────────────────

function AdminAuctionsPage({
  auctions,
  onSelectAuction,
}: {
  auctions: AdminAuction[];
  onSelectAuction: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | AuctionStatus>(
    "All",
  );
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filtered = useMemo(() => {
    return auctions.filter((a) => {
      const q = search.toLowerCase();
      return (
        (!q ||
          a.title.toLowerCase().includes(q) ||
          a.sellerName.toLowerCase().includes(q)) &&
        (statusFilter === "All" || a.status === statusFilter) &&
        (categoryFilter === "All" || a.category === categoryFilter)
      );
    });
  }, [auctions, search, statusFilter, categoryFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[2rem] leading-none font-bold tracking-tight uppercase">
          Auctions
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Monitor and moderate marketplace auctions
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-card border-border flex h-10 min-w-[200px] flex-1 items-center gap-2 rounded-xl border px-3">
          <Search size={14} className="text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or seller…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {(
            [
              "All",
              "Scheduled",
              "Active",
              "Ended",
              "Settled",
              "Cancelled",
            ] as const
          ).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`h-9 rounded-full px-3 text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? "bg-foreground text-background"
                  : "bg-card border-border text-muted-foreground hover:text-foreground border"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-card border-border text-muted-foreground h-9 cursor-pointer rounded-xl border px-3 text-sm outline-none"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-card border-border overflow-hidden rounded-2xl border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-border bg-muted/40 border-b">
                <th className="text-muted-foreground px-5 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Auction
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Seller
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Category
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Status
                </th>
                <th className="text-muted-foreground px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase">
                  Bid
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Ends
                </th>
                <th className="text-muted-foreground px-5 py-3 text-right text-xs font-semibold tracking-wider uppercase"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-muted-foreground py-16 text-center text-sm"
                  >
                    No auctions match your filters.
                  </td>
                </tr>
              )}
              {filtered.map((a, i) => (
                <tr
                  key={a.id}
                  className={`border-border hover:bg-muted/20 border-b transition-colors last:border-0 ${i % 2 !== 0 ? "bg-muted/10" : ""}`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={a.thumbnail}
                        alt={a.title}
                        className="h-10 w-10 shrink-0 rounded-xl object-cover"
                      />
                      <div>
                        <p className="max-w-[180px] truncate text-sm font-semibold">
                          {a.title}
                        </p>
                        {a.isSystem && (
                          <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                            System
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-muted-foreground px-4 py-4 text-sm">
                    {a.sellerName}
                  </td>
                  <td className="text-muted-foreground px-4 py-4 text-sm">
                    {a.category}
                  </td>
                  <td className="px-4 py-4">
                    <AuctionStatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-sm font-semibold">
                    {fmt(a.currentBid || a.startingPrice)}
                  </td>
                  <td className="text-muted-foreground px-4 py-4 text-sm whitespace-nowrap">
                    {fmtDateTime(a.endsAt)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => onSelectAuction(a.id)}
                      className="text-primary inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
                    >
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── AUCTION DETAIL ───────────────────────────────────────────────────────────

function AdminAuctionDetail({
  auctionId,
  auctions,
  bids,
  setAuctions,
  onBack,
  setConfirmDialog,
  showToast,
  addAuditEntry,
}: {
  auctionId: string;
  auctions: AdminAuction[];
  bids: AdminBid[];
  setAuctions: React.Dispatch<React.SetStateAction<AdminAuction[]>>;
  onBack: () => void;
  setConfirmDialog: (d: AdminConfirmState | null) => void;
  showToast: (m: string, t: "success" | "error") => void;
  addAuditEntry: (e: Omit<AuditEntry, "id" | "timestamp" | "admin">) => void;
}) {
  const auction = auctions.find((a) => a.id === auctionId);
  const [activeImage, setActiveImage] = useState(0);
  if (!auction) return null;

  const auctionBids = bids
    .filter((b) => b.auctionId === auctionId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const canCancel =
    auction.status === "Active" || auction.status === "Scheduled";

  const handleForceCancel = () =>
    setConfirmDialog({
      title: "Force Cancel Auction",
      message: `Force cancel "${auction.title}"? All bid reservations will be released and the seller will not receive a listing fee refund.`,
      confirmLabel: "Force Cancel Auction",
      confirmVariant: "destructive",
      warning:
        "This action cannot be undone. All active bid reservations will be released. The listing fee will not be refunded.",
      requiresReason: true,
      onConfirm: (reason) => {
        setAuctions((prev) =>
          prev.map((a) =>
            a.id === auctionId
              ? { ...a, status: "Cancelled" as AuctionStatus }
              : a,
          ),
        );
        addAuditEntry({
          action: "force_cancel_auction",
          targetType: "auction",
          targetId: auctionId,
          targetName: auction.title,
          reason,
        });
        showToast("Auction has been force-cancelled.", "success");
        onBack();
      },
    });

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ChevronLeft size={15} /> Back to Auctions
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display text-[2rem] leading-none font-bold tracking-tight uppercase">
              {auction.title}
            </h1>
            <AuctionStatusBadge status={auction.status} />
            {auction.isSystem && (
              <span className="bg-primary/10 text-primary border-primary/20 rounded-full border px-2.5 py-0.5 text-xs font-bold">
                System Auction
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Seller:{" "}
            <span className="text-foreground font-medium">
              {auction.sellerName}
            </span>
            {" · "}
            {auction.category}
            {" · "}Created {relTime(auction.createdAt)}
          </p>
        </div>
        {canCancel && (
          <button
            onClick={handleForceCancel}
            className="flex h-10 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
          >
            <Ban size={14} /> Force Cancel
          </button>
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Left: Images + description — 3 cols */}
        <div className="space-y-4 lg:col-span-3">
          <div className="bg-card border-border overflow-hidden rounded-2xl border">
            <div className="aspect-video bg-stone-100">
              <img
                src={auction.images[activeImage]}
                alt={auction.title}
                className="h-full w-full object-cover"
              />
            </div>
            {auction.images.length > 1 && (
              <div className="flex gap-2.5 p-4">
                {auction.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                      activeImage === idx
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="bg-card border-border rounded-2xl border p-5">
            <h3 className="mb-2 text-sm font-semibold">Description</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {auction.description}
            </p>
          </div>
        </div>

        {/* Right: Stats + bid history — 2 cols */}
        <div className="space-y-4 lg:col-span-2">
          <div className="bg-card border-border space-y-3 rounded-2xl border p-5">
            <h3 className="text-sm font-semibold">Auction Details</h3>
            {[
              ["Starting Price", fmt(auction.startingPrice)],
              ["Current Bid", fmt(auction.currentBid || auction.startingPrice)],
              ["Total Bids", auction.bidCount.toString()],
              ["Ends At", fmtDateTime(auction.endsAt)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="border-border flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <p className="text-muted-foreground text-xs">{label}</p>
                <p className="font-mono text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-card border-border overflow-hidden rounded-2xl border">
            <div className="border-border border-b px-5 py-4">
              <h3 className="text-sm font-semibold">
                Bid History ({auctionBids.length})
              </h3>
            </div>
            <div className="divide-border max-h-72 scrollbar-none divide-y overflow-y-auto">
              {auctionBids.length === 0 ? (
                <p className="text-muted-foreground py-10 text-center text-sm">
                  No bids placed yet.
                </p>
              ) : (
                auctionBids.map((bid, idx) => (
                  <div
                    key={bid.id}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <img
                      src={bid.bidderAvatar}
                      alt={bid.bidderName}
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{bid.bidderName}</p>
                      <p className="text-muted-foreground font-mono text-xs">
                        @{bid.bidderUsername} · {relTime(bid.timestamp)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={`font-mono text-sm font-bold ${idx === 0 ? "text-primary" : "text-muted-foreground"}`}
                      >
                        {fmt(bid.amount)}
                      </p>
                      {idx === 0 && (
                        <p className="text-primary text-[10px] font-semibold">
                          Leading
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SYSTEM AUCTIONS (CREATE FORM) ────────────────────────────────────────────

function AdminSystemAuctions({
  onSuccess,
  showToast,
  addAuditEntry,
  setAuctions,
}: {
  onSuccess: () => void;
  showToast: (m: string, t: "success" | "error") => void;
  addAuditEntry: (e: Omit<AuditEntry, "id" | "timestamp" | "admin">) => void;
  setAuctions: React.Dispatch<React.SetStateAction<AdminAuction[]>>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const addDemoImage = () => {
    if (images.length < 3)
      setImages((prev) => [
        ...prev,
        DEMO_IMAGES[prev.length % DEMO_IMAGES.length],
      ]);
  };
  const removeImage = (i: number) =>
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    setImages((prev) => {
      const a = [...prev];
      [a[from], a[to]] = [a[to], a[from]];
      return a;
    });
  };

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!title.trim() || title.trim().length < 3)
      e.push("Title must be at least 3 characters.");
    if (!description.trim()) e.push("Description is required.");
    if (!category) e.push("Category is required.");
    const price = Number(startingPrice);
    if (!startingPrice || isNaN(price) || price <= 0)
      e.push("Starting price must be a positive number.");
    if (!startTime) e.push("Start time is required.");
    if (!endTime) e.push("End time is required.");
    if (startTime && new Date(startTime) <= new Date())
      e.push("Start time must be in the future.");
    if (
      startTime &&
      endTime &&
      new Date(endTime).getTime() - new Date(startTime).getTime() <
        20 * 60 * 1000
    )
      e.push("Auction must run for at least 20 minutes.");
    if (images.length === 0) e.push("At least one image is required.");
    return e;
  }, [title, description, category, startingPrice, startTime, endTime, images]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (errors.length > 0) return;
    setLoading(true);
    setTimeout(() => {
      const newId = `sys-${Date.now()}`;
      const newAuction: AdminAuction = {
        id: newId,
        title: title.trim(),
        thumbnail: images[0],
        seller: "system",
        sellerName: "YardSale Platform",
        category,
        status: "Scheduled",
        currentBid: 0,
        startingPrice: Number(startingPrice),
        bidCount: 0,
        endsAt: new Date(endTime),
        createdAt: new Date(),
        isSystem: true,
        description: description.trim(),
        images,
      };
      setAuctions((prev) => [newAuction, ...prev]);
      addAuditEntry({
        action: "create_system_auction",
        targetType: "auction",
        targetId: newId,
        targetName: title.trim(),
      });
      showToast("System auction published successfully!", "success");
      setLoading(false);
      onSuccess();
    }, 900);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-[2rem] leading-none font-bold tracking-tight uppercase">
          Create System Auction
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Create an auction on behalf of the YardSale platform
        </p>
      </div>

      {/* Context banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
        <Info size={16} className="mt-0.5 shrink-0 text-blue-500" />
        <div>
          <p className="text-sm font-semibold text-blue-800">
            Platform / System Auction
          </p>
          <p className="mt-0.5 text-sm text-blue-700">
            This auction will be published as a Platform/System auction. No
            listing fee will be charged.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-muted-foreground mb-2 block text-xs font-semibold tracking-wider uppercase">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Name your auction item"
            className="bg-card border-border focus:ring-primary/30 h-11 w-full rounded-xl border px-4 text-sm transition outline-none focus:ring-2"
          />
        </div>

        <div>
          <label className="text-muted-foreground mb-2 block text-xs font-semibold tracking-wider uppercase">
            Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the item in detail…"
            className="bg-card border-border focus:ring-primary/30 w-full resize-none rounded-xl border px-4 py-3 text-sm transition outline-none focus:ring-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-muted-foreground mb-2 block text-xs font-semibold tracking-wider uppercase">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-card border-border focus:ring-primary/30 h-11 w-full cursor-pointer rounded-xl border px-4 text-sm transition outline-none focus:ring-2"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-muted-foreground mb-2 block text-xs font-semibold tracking-wider uppercase">
              Starting Price (₦)
            </label>
            <input
              type="number"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              placeholder="e.g. 50000"
              min={1}
              className="bg-card border-border focus:ring-primary/30 h-11 w-full rounded-xl border px-4 text-sm transition outline-none focus:ring-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-muted-foreground mb-2 block text-xs font-semibold tracking-wider uppercase">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-card border-border focus:ring-primary/30 h-11 w-full rounded-xl border px-4 text-sm transition outline-none focus:ring-2"
            />
          </div>
          <div>
            <label className="text-muted-foreground mb-2 block text-xs font-semibold tracking-wider uppercase">
              End Time
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="bg-card border-border focus:ring-primary/30 h-11 w-full rounded-xl border px-4 text-sm transition outline-none focus:ring-2"
            />
          </div>
        </div>

        <div>
          <label className="text-muted-foreground mb-2 block text-xs font-semibold tracking-wider uppercase">
            Images{" "}
            <span className="text-muted-foreground font-normal normal-case">
              (up to 3, first is cover)
            </span>
          </label>
          {images.length < 3 && (
            <div
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                addDemoImage();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onClick={addDemoImage}
              className={`flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors ${
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/40"
              }`}
            >
              <Upload size={20} className="text-muted-foreground" />
              <p className="text-muted-foreground text-sm">
                Drop images here or{" "}
                <span className="text-primary font-medium">click to add</span>
              </p>
              <p className="text-muted-foreground text-xs">
                {images.length}/3 images added
              </p>
            </div>
          )}
          {images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="group border-border relative h-24 w-24 overflow-hidden rounded-xl border"
                >
                  <img
                    src={img}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  {i === 0 && (
                    <span className="bg-primary text-primary-foreground absolute top-1 left-1 rounded px-1.5 py-0.5 text-[9px] font-bold">
                      Cover
                    </span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(i, i - 1)}
                        className="text-foreground flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold"
                      >
                        ←
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600"
                    >
                      <Trash2 size={11} className="text-white" />
                    </button>
                    {i < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(i, i + 1)}
                        className="text-foreground flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold"
                      >
                        →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {submitted && errors.length > 0 && (
          <div className="space-y-1 rounded-xl border border-red-200 bg-red-50 p-4">
            {errors.map((err) => (
              <p key={err} className="text-xs text-red-700">
                • {err}
              </p>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full rounded-xl text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Publishing…" : "Publish System Auction"}
        </button>
      </form>
    </div>
  );
}

// ─── REVENUE PAGE ─────────────────────────────────────────────────────────────

function AdminRevenuePage() {
  const [dateRange, setDateRange] = useState("8w");
  const [search, setSearch] = useState("");

  const listingTotal = REVENUE_CHART_DATA.reduce(
    (s, d) => s + d.listingFees,
    0,
  );
  const settlementTotal = REVENUE_CHART_DATA.reduce(
    (s, d) => s + d.settlementFees,
    0,
  );
  const totalRevenue = listingTotal + settlementTotal;

  const filteredLedger = SAMPLE_LEDGER.filter((e) => {
    const q = search.toLowerCase();
    return (
      !q ||
      e.source.toLowerCase().includes(q) ||
      (e.auctionTitle ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[2rem] leading-none font-bold tracking-tight uppercase">
            Revenue
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Platform earnings and ledger activity
          </p>
        </div>
        <div className="flex items-center gap-1">
          {[
            ["4w", "4 weeks"],
            ["8w", "8 weeks"],
            ["12w", "12 weeks"],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setDateRange(val)}
              className={`h-9 rounded-full px-3 text-xs font-semibold transition-colors ${
                dateRange === val
                  ? "bg-foreground text-background"
                  : "bg-card border-border text-muted-foreground hover:text-foreground border"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary summary */}
      <div className="bg-card border-border rounded-2xl border p-6">
        <div className="divide-border grid grid-cols-1 gap-6 divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
          <div className="pb-5 md:pr-6 md:pb-0">
            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Total Platform Revenue
            </p>
            <p className="font-display mt-3 text-5xl leading-none font-bold">
              {fmt(totalRevenue)}
            </p>
            <p className="text-muted-foreground mt-2 text-xs">
              Selected period
            </p>
          </div>
          <div className="pt-5 md:px-6 md:pt-0">
            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Listing Fees
            </p>
            <p className="font-display text-primary mt-3 text-3xl leading-none font-bold">
              {fmt(listingTotal)}
            </p>
            <p className="text-muted-foreground mt-2 text-xs">
              {((listingTotal / totalRevenue) * 100).toFixed(1)}% of total
            </p>
          </div>
          <div className="pt-5 md:pt-0 md:pl-6">
            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Settlement Fees
            </p>
            <p className="font-display mt-3 text-3xl leading-none font-bold text-amber-600">
              {fmt(settlementTotal)}
            </p>
            <p className="text-muted-foreground mt-2 text-xs">
              {((settlementTotal / totalRevenue) * 100).toFixed(1)}% of total
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card border-border rounded-2xl border p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-semibold">Weekly Revenue Breakdown</h2>
          <div className="flex items-center gap-5">
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <span className="bg-primary inline-block h-2.5 w-3 rounded-sm" />{" "}
              Listing Fees
            </div>
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <span className="bg-accent inline-block h-2.5 w-3 rounded-sm" />{" "}
              Settlement Fees
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={REVENUE_CHART_DATA} barSize={16} barGap={4}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(26,18,8,0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 12, fill: "#7A6B57" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#7A6B57" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
              width={52}
            />
            <Tooltip
              formatter={(v: number) => fmt(v)}
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid rgba(26,18,8,0.1)",
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="listingFees"
              name="Listing Fees"
              fill="#C94B1F"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="settlementFees"
              name="Settlement Fees"
              fill="#E8A010"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ledger */}
      <div className="bg-card border-border overflow-hidden rounded-2xl border">
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-semibold">Platform Ledger</h2>
          <div className="bg-muted flex h-9 w-56 items-center gap-2 rounded-xl px-3">
            <Search size={13} className="text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ledger…"
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-border bg-muted/40 border-b">
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Date
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Source
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Auction
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Entry Type
                </th>
                <th className="text-muted-foreground px-6 py-3 text-right text-xs font-semibold tracking-wider uppercase">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLedger.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-muted-foreground py-12 text-center text-sm"
                  >
                    No ledger entries match your search.
                  </td>
                </tr>
              )}
              {filteredLedger.map((e, i) => (
                <tr
                  key={e.id}
                  className={`border-border border-b last:border-0 ${i % 2 !== 0 ? "bg-muted/10" : ""}`}
                >
                  <td className="text-muted-foreground px-6 py-3 font-mono text-xs whitespace-nowrap">
                    {fmtDateTime(e.date)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{e.source}</td>
                  <td className="text-muted-foreground max-w-[180px] truncate px-4 py-3 text-sm">
                    {e.auctionTitle ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        e.entryType === "listing_fee"
                          ? "bg-primary/10 text-primary"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {e.entryType === "listing_fee"
                        ? "Listing Fee"
                        : "Settlement Fee"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-sm font-bold text-emerald-600">
                    +{fmt(e.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── AUDIT LOG ────────────────────────────────────────────────────────────────

function AdminAuditLogPage({
  auditLog,
  onNavigateToUser,
  onNavigateToAuction,
}: {
  auditLog: AuditEntry[];
  onNavigateToUser: (id: string) => void;
  onNavigateToAuction: (id: string) => void;
}) {
  const [actionFilter, setActionFilter] = useState<"All" | AuditAction>("All");
  const [targetFilter, setTargetFilter] = useState<"All" | "user" | "auction">(
    "All",
  );

  const filtered = useMemo(
    () =>
      auditLog.filter(
        (e) =>
          (actionFilter === "All" || e.action === actionFilter) &&
          (targetFilter === "All" || e.targetType === targetFilter),
      ),
    [auditLog, actionFilter, targetFilter],
  );

  const actionColor = (action: AuditAction) => {
    if (action.includes("cancel") || action.includes("deactivate"))
      return "text-red-600";
    if (action.includes("suspend")) return "text-amber-600";
    if (action.includes("reactivate")) return "text-emerald-600";
    return "text-primary";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[2rem] leading-none font-bold tracking-tight uppercase">
          Audit Log
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Administrative actions across the YardSale platform
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={actionFilter}
          onChange={(e) =>
            setActionFilter(e.target.value as typeof actionFilter)
          }
          className="bg-card border-border text-muted-foreground h-9 cursor-pointer rounded-xl border px-3 text-sm outline-none"
        >
          <option value="All">All Actions</option>
          {(Object.keys(ACTION_LABELS) as AuditAction[]).map((a) => (
            <option key={a} value={a}>
              {ACTION_LABELS[a]}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1">
          {(["All", "user", "auction"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTargetFilter(t)}
              className={`h-9 rounded-full px-3 text-xs font-semibold capitalize transition-colors ${
                targetFilter === t
                  ? "bg-foreground text-background"
                  : "bg-card border-border text-muted-foreground hover:text-foreground border"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <span className="text-muted-foreground ml-1 text-xs">
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      <div className="bg-card border-border overflow-hidden rounded-2xl border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-border bg-muted/40 border-b">
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Timestamp
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Admin
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Action
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Target
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Reason
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-muted-foreground py-14 text-center text-sm"
                  >
                    No audit entries match your filters.
                  </td>
                </tr>
              )}
              {filtered.map((entry, i) => (
                <tr
                  key={entry.id}
                  className={`border-border border-b last:border-0 ${i % 2 !== 0 ? "bg-muted/10" : ""}`}
                >
                  <td className="text-muted-foreground px-6 py-2.5 font-mono text-xs whitespace-nowrap">
                    {fmtDateTime(entry.timestamp)}
                  </td>
                  <td className="px-4 py-2.5 text-xs font-semibold">
                    {entry.admin}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`text-xs font-semibold ${actionColor(entry.action)}`}
                    >
                      {ACTION_LABELS[entry.action]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() =>
                        entry.targetType === "user"
                          ? onNavigateToUser(entry.targetId)
                          : onNavigateToAuction(entry.targetId)
                      }
                      className="text-primary inline-flex items-center gap-1 text-xs hover:underline"
                    >
                      <span className="text-muted-foreground capitalize">
                        {entry.targetType}:
                      </span>
                      {entry.targetName}
                      <ExternalLink size={10} className="shrink-0" />
                    </button>
                  </td>
                  <td className="text-muted-foreground max-w-xs px-6 py-2.5 text-xs">
                    <span className="block max-w-xs truncate">
                      {entry.reason ?? (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN PORTAL ROOT ────────────────────────────────────────────────────────

export default function AdminPortal({ onExit }: { onExit: () => void }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage] = useState<AdminPage>("dashboard");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(
    null,
  );
  const [users, setUsers] = useState<AdminUser[]>(SAMPLE_ADMIN_USERS);
  const [auctions, setAuctions] = useState<AdminAuction[]>(
    SAMPLE_ADMIN_AUCTIONS,
  );
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(SAMPLE_AUDIT_LOG);
  const [confirmDialog, setConfirmDialog] = useState<AdminConfirmState | null>(
    null,
  );
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      setToast({ message, type });
    },
    [],
  );

  const addAuditEntry = useCallback(
    (entry: Omit<AuditEntry, "id" | "timestamp" | "admin">) => {
      setAuditLog((prev) => [
        {
          ...entry,
          id: `al-${Date.now()}`,
          timestamp: new Date(),
          admin: "Admin",
        },
        ...prev,
      ]);
    },
    [],
  );

  const navigate = (p: AdminPage) => {
    setPage(p);
    if (p !== "user-detail" && p !== "auction-detail") {
      setSelectedUserId(null);
      setSelectedAuctionId(null);
    }
  };

  const selectUser = (id: string) => {
    setSelectedUserId(id);
    setPage("user-detail");
  };
  const selectAuction = (id: string) => {
    setSelectedAuctionId(id);
    setPage("auction-detail");
  };

  if (!isLoggedIn) return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return (
          <AdminDashboard
            auctions={auctions}
            onNavigate={navigate}
            onSelectAuction={selectAuction}
          />
        );
      case "users":
        return <AdminUsersPage users={users} onSelectUser={selectUser} />;
      case "user-detail":
        return selectedUserId ? (
          <AdminUserDetail
            userId={selectedUserId}
            users={users}
            auctions={auctions}
            setUsers={setUsers}
            onBack={() => navigate("users")}
            setConfirmDialog={setConfirmDialog}
            showToast={showToast}
            addAuditEntry={addAuditEntry}
          />
        ) : null;
      case "auctions":
        return (
          <AdminAuctionsPage
            auctions={auctions}
            onSelectAuction={selectAuction}
          />
        );
      case "auction-detail":
        return selectedAuctionId ? (
          <AdminAuctionDetail
            auctionId={selectedAuctionId}
            auctions={auctions}
            bids={SAMPLE_ADMIN_BIDS}
            setAuctions={setAuctions}
            onBack={() => navigate("auctions")}
            setConfirmDialog={setConfirmDialog}
            showToast={showToast}
            addAuditEntry={addAuditEntry}
          />
        ) : null;
      case "system-auctions":
        return (
          <AdminSystemAuctions
            onSuccess={() => navigate("auctions")}
            showToast={showToast}
            addAuditEntry={addAuditEntry}
            setAuctions={setAuctions}
          />
        );
      case "revenue":
        return <AdminRevenuePage />;
      case "audit-log":
        return (
          <AdminAuditLogPage
            auditLog={auditLog}
            onNavigateToUser={selectUser}
            onNavigateToAuction={selectAuction}
          />
        );
    }
  };

  return (
    <div className="bg-secondary min-h-screen p-4 lg:p-6">
      <div className="bg-background border-border mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1440px] flex-col overflow-hidden rounded-2xl border lg:min-h-[calc(100vh-3rem)]">
        {confirmDialog && (
          <AdminConfirmDialog
            dialog={confirmDialog}
            onClose={() => setConfirmDialog(null)}
          />
        )}
        {toast && (
          <AdminToast
            message={toast.message}
            type={toast.type}
            onDismiss={() => setToast(null)}
          />
        )}

        <AdminTopNav page={page} onNavigate={navigate} onLogout={onExit} />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

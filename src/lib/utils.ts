import type { Notification } from "@/features/notification/types";
import {
  DAY,
  SECOND,
  MINUTE,
  HOUR,
  KOBO_RATE,
  PER_PAGE,
  ACCEPTED_AUCTION_IMAGE_TYPES,
  MAX_AUCTION_IMAGE_SIZE,
  PLACEHOLDER_USERNAME_PATTERN,
} from "@/shared/constants";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAmount(amount: number): string {
  const n = amount / KOBO_RATE;

  return n < 0
    ? `-₦${Math.abs(n).toLocaleString("en-NG")}`
    : `₦${n.toLocaleString("en-NG")}`;
}

/* export function formatTimeLeft(endsAt: Date) { */
/* const remaining = endsAt.getTime() - Date.now(); */
export function formatTimeLeft(remaining: number) {
  if (remaining <= 0) {
    return { label: "Ended", urgent: false };
  }

  const days = Math.floor(remaining / DAY);
  const hours = Math.floor((remaining % DAY) / HOUR);
  const minutes = Math.floor((remaining % HOUR) / MINUTE);
  const seconds = Math.floor((remaining % MINUTE) / SECOND);

  if (days > 0) {
    return {
      label: `${days}d ${hours}h`,
      urgent: false,
    };
  }

  if (hours > 0) {
    return {
      label: `${hours}h ${minutes}m`,
      urgent: hours < 2,
    };
  }

  if (minutes > 0) {
    return {
      label: `${minutes}m ${seconds}s`,
      urgent: true,
    };
  }

  return {
    label: `${seconds}s`,
    urgent: true,
  };
}

/* export function formatTime(date: Date): string {
  const ms = Date.now() - date.getTime();
  const m = Math.floor(ms / MINUTE);
  const h = Math.floor(ms / HOUR);
  const d = Math.floor(ms / DAY);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
} */

export function formatTime(date: Date): string {
  const diff = Date.now() - date.getTime();

  // Future
  if (diff < 0) {
    const ms = Math.abs(diff);
    const m = Math.floor(ms / MINUTE);
    const h = Math.floor(ms / HOUR);
    const d = Math.floor(ms / DAY);

    if (m < 1) return "in less than a minute";
    if (m < 60) return `in ${m}m`;
    if (h < 24) return `in ${h}h`;
    if (d < 7) return `in ${d}d`;

    return date.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
    });
  }

  // Past
  const m = Math.floor(diff / MINUTE);
  const h = Math.floor(diff / HOUR);
  const d = Math.floor(diff / DAY);

  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

export function groupNotifications(
  notifs: Notification[],
): { label: string; items: Notification[] }[] {
  const today: Notification[] = [],
    yesterday: Notification[] = [],
    earlier: Notification[] = [];
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0)).getTime();
  const yestStart = todayStart - DAY;
  notifs.forEach((n) => {
    const t = new Date(n.created_at).getTime();
    if (t >= todayStart) today.push(n);
    else if (t >= yestStart) yesterday.push(n);
    else earlier.push(n);
  });
  return [
    { label: "Today", items: today },
    { label: "Yesterday", items: yesterday },
    { label: "Earlier", items: earlier },
  ].filter((g) => g.items.length > 0);
}

export function getRange(page: number) {
  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  return { from, to };
}

export function getPagination(
  page: number,
  count: number,
  per_page: number = PER_PAGE,
) {
  const totalPages = Math.ceil((count ?? 0) / per_page);
  const safePage = Math.min(Math.max(page, 1), totalPages || 1);

  return {
    page: safePage,
    totalPages,
  };
}

export function validateImage(file: File) {
  if (
    !ACCEPTED_AUCTION_IMAGE_TYPES.includes(
      file.type as (typeof ACCEPTED_AUCTION_IMAGE_TYPES)[number],
    )
  ) {
    throw new Error("Only JPEG, PNG, and WEBP images are allowed.");
  }
  if (file.size > MAX_AUCTION_IMAGE_SIZE) {
    throw new Error("Each image must be smaller than 10 MB.");
  }
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function hasUpdatedUsername(
  username: string | null | undefined,
): boolean {
  if (!username) return false;
  return !PLACEHOLDER_USERNAME_PATTERN.test(username);
}

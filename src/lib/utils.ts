import { DAY, SECOND, MINUTE, HOUR, KOBO_RATE } from "@/shared/constants";
import supabase from "@/shared/supabase/client";
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

export function formatTimeLeft(endsAt: Date) {
  const remaining = endsAt.getTime() - Date.now();

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

export function getImageUrl(path: string) {
  if (!path) return "";

  return supabase.storage.from("auction-images").getPublicUrl(path).data
    .publicUrl;
}

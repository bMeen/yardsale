import type { Database } from "@/shared/supabase/database.types";
import type { getWalletBalance } from "./apiWallet";

export type Reference = Database["public"]["Enums"]["reference_type"];
export type ActivityDirection = "CREDIT" | "DEBIT" | "HOLD" | "RELEASE";
export type AccountType = Database["public"]["Enums"]["wallet_account_type"];

export const TransactionEntryType = {
  WALLET_RESET: "WALLET_RESET",
  LISTING_FEE: "LISTING_FEE",
  BID_RESERVATION: "BID_RESERVATION",
  BID_RELEASE: "BID_RELEASE",
  SETTLEMENT: "SETTLEMENT",
  SETTLEMENT_FEE: "SETTLEMENT_FEE",
  INITIAL_CREDIT: "INITIAL_CREDIT",
} as const;

export type WalletEntryType =
  (typeof TransactionEntryType)[keyof typeof TransactionEntryType];

export type Activity = {
  amount: number;
  created_at: string;
  description: string;
  direction: ActivityDirection;
  entry_type: WalletEntryType;
  id: string;
  reference_type: Reference;
  total_count: number;
};

/* export type UserBalance = {
  account_type: AccountType;
  balance: number;
}; */
export type UserBalance = Awaited<ReturnType<typeof getWalletBalance>>[0];

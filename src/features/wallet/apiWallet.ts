import supabase from "@/shared/supabase/client";
import type { Activity } from "./types";

export async function getWalletBalance() {
  const { data, error } = await supabase
    .from("wallet_accounts")
    .select("account_type, balance")
    .order("account_type", { ascending: true });

  if (error) throw new Error(error.message);

  return data;
}

export async function getWalletActivity({ page = 1 }) {
  const { data, error } = await supabase.rpc("get_wallet_activity", {
    p_page: page,
  });

  if (error) throw new Error(error.message);

  return {
    data: data as unknown as Activity[],
    count: data?.[0]?.total_count ?? 0,
  };
}

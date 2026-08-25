import supabase from "@/shared/supabase/client";
import type { Activity } from "./types";
import type { QueryClient } from "@tanstack/react-query";

export async function getWalletBalance() {
  const { data, error } = await supabase
    .from("wallet_accounts")
    .select("account_type, balance")
    .order("account_type", { ascending: true });

  if (error) throw error;

  return data;
}

export async function getWalletActivity({ page = 1 }) {
  const { data, error } = await supabase.rpc("get_wallet_activity", {
    p_page: page,
  });

  if (error) throw error;

  return {
    data: data as unknown as Activity[],
    count: data?.[0]?.total_count ?? 0,
  };
}

export async function resetWalletBalance() {
  const { error } = await supabase.rpc("reset_wallet");
  if (error) throw error;
}

export function subscribeToWallet(userId: string, queryClient: QueryClient) {
  const channel = supabase
    .channel(`wallet:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "wallet_accounts",
        filter: `profile_id=eq.${userId}`,
      },
      () => {
        queryClient.invalidateQueries({ queryKey: ["wallet_accounts"] });
      },
    )
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "wallet_entries" },
      () => {
        queryClient.invalidateQueries({ queryKey: ["wallet_activity"] });
        queryClient.invalidateQueries({ queryKey: ["wallet_accounts"] });
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

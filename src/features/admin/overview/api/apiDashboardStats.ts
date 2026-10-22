import supabase from "@/shared/supabase/client";
import type { DashboardStat } from "../types/types";

export async function getDashboardStats(): Promise<DashboardStat> {
  const { data, error } = await supabase.rpc("get_admin_dashboard_stats");

  if (error) throw error;
  return data as DashboardStat;
}

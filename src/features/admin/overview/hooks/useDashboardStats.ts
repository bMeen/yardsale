import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../api/apiDashboardStats";

export function useDashboardStats() {
  const { isLoading, error, data } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  return { isLoading, error, data };
}

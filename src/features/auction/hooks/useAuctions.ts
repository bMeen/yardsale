import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuctions, subscribeToAuctions } from "../apiAuctions";
import { useSearchParams } from "react-router";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import type { AuctionListType, AuctionStatus, Category } from "../types";
import { useEffect } from "react";

export function useAuctions() {
  const { user } = useCurrentUser();
  const [searchParams] = useSearchParams();
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));
  const category = (searchParams.get("category") || "ALL") as Category;
  const type = (searchParams.get("type") || "ALL") as AuctionListType;
  const search = searchParams.get("search") ?? undefined;
  const status = (searchParams.get("status") as AuctionStatus) ?? undefined;

  const {
    isLoading,
    error,
    data: { data: auctions, count } = { data: [], count: 0 },
  } = useQuery({
    queryKey: ["auctions", type, page, category, search, status],
    queryFn: () =>
      getAuctions({
        type,
        page,
        category,
        search,
        status,
        user_id: user?.profile.id,
      }),
  });

  return { isLoading, error, auctions, count };
}

export function useAuctionsRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = subscribeToAuctions(queryClient);
    return unsubscribe;
  }, [queryClient]);
}

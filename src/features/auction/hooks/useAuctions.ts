import { useQuery } from "@tanstack/react-query";
import { getAuctions } from "../apiAuctions";
import { useSearchParams } from "react-router";
import type { AuctionListType, Category } from "../types";

export function useAuctions() {
  //const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));
  const category = (searchParams.get("category") || "ALL") as Category;
  const type = (searchParams.get("type") || "ALL") as AuctionListType;
  const search = searchParams.get("search") ?? undefined;

  const {
    isLoading,
    error,
    data: { data: auctions, count } = { data: [], count: 0 },
  } = useQuery({
    queryKey: ["auctions", type, page, category, search],
    queryFn: () => getAuctions({ type, page, category, search }),
  });

  return { isLoading, error, auctions, count };
}

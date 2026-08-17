import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router";
import { getAuction, getAuctionBids } from "../apiAuctions";

export function useAuction() {
  const { auctionId: id } = useParams();

  const { isLoading, data: auction } = useQuery({
    queryKey: ["auction", id],
    queryFn: () => getAuction(id),
  });

  return { isLoading, auction };
}

export function useAuctionBids() {
  const { auctionId: id } = useParams();
  const [searchParams] = useSearchParams();
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  const { isLoading, data: bids = [] } = useQuery({
    queryKey: ["bids", id, page],
    queryFn: () => getAuctionBids({ id, page }),
  });

  return { isLoading, bids };
}

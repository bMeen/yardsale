import EmptyState from "@/components/EmptyState";

import { HandCoins } from "lucide-react";
import Bid from "./Bid";
import { useAuctionBids } from "@/features/auction/hooks/useAuctionBid";
import { useSearchParams } from "react-router";
import { getPagination } from "@/lib/utils";
import CustomPagination from "@/components/CustomPagination";
import BidSkeleton from "./BidSkeleton";

function Bids() {
  const { bids, count, isLoading } = useAuctionBids();
  const [searchParams] = useSearchParams();
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));
  const { page: currentPage, totalPages } = getPagination(page, count);

  if (isLoading)
    return (
      <ul className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <BidSkeleton key={index} />
        ))}
      </ul>
    );

  if (bids?.length === 0)
    return (
      <EmptyState
        icon={<HandCoins size={28} />}
        title="No bids yet"
        description="Be the first to place a bid on this auction."
      />
    );

  return (
    <div>
      <ul className="space-y-2 pb-4">
        {bids?.map((bid) => (
          <Bid bid={bid} key={bid.id} />
        ))}
      </ul>

      <CustomPagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}

export default Bids;

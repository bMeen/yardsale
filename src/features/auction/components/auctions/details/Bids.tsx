import EmptyState from "@/components/EmptyState";
import { HandCoins } from "lucide-react";
import Bid from "./Bid";
import { useAuctionBids } from "@/features/auction/hooks/useAuctionBid";

import { getPagination } from "@/lib/utils";
import CustomPagination from "@/components/CustomPagination";
import BidSkeleton from "./BidSkeleton";
import { useState } from "react";

function Bids() {
  const [page, setPage] = useState(1);
  const { bids, count, isLoading } = useAuctionBids(page);
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

      <CustomPagination
        currentPage={currentPage}
        totalPages={totalPages}
        setPage={setPage}
      />
    </div>
  );
}

export default Bids;

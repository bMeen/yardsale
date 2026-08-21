import EmptyState from "@/components/EmptyState";

import { HandCoins } from "lucide-react";
import Bid from "./Bid";
import { useAuctionBids } from "@/features/auction/hooks/useAuctionBid";

function Bids() {
  const { bids } = useAuctionBids();

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
      <ul className="space-y-2">
        {bids?.map((bid) => (
          <Bid bid={bid} key={bid.id} />
        ))}
      </ul>
    </div>
  );
}

export default Bids;

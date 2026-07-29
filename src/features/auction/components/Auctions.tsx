import EmptyState from "@/components/EmptyState";
import { useAuctions } from "../hooks/useAuctions";
import AuctionCard from "./AuctionCard";
import AuctionCardSkeleton from "./AuctionCardSkeleton";
import { Package } from "lucide-react";

function Auctions() {
  const { isLoading, auctions } = useAuctions();

  if (isLoading)
    return (
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <AuctionCardSkeleton key={i} />
        ))}
      </ul>
    );

  if (auctions.length === 0)
    return (
      <EmptyState
        icon={<Package size={28} />}
        title="No auctions here"
        description="Nothing in this category yet. Check back soon."
      />
    );

  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {auctions?.map((auction) => (
        <AuctionCard auction={auction} key={auction.id} />
      ))}
    </ul>
  );
}

export default Auctions;

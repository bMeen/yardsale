import EmptyState from "@/components/EmptyState";
import { Package } from "lucide-react";
import FeaturedAuctionCardSkeleton from "./FeaturedCardSkeleton";
import { useFeaturedAuctions } from "../../hooks/useFeaturedAuctions";
import FeaturedCard from "./FeaturedCard";

function Featured() {
  const { isLoading, featuredAuctions } = useFeaturedAuctions();

  if (isLoading)
    return (
      <div className="flex snap-x snap-mandatory scrollbar-none gap-3 overflow-x-auto px-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <FeaturedAuctionCardSkeleton key={i} />
        ))}
      </div>
    );

  if (featuredAuctions.length === 0)
    return (
      <EmptyState
        icon={<Package size={28} />}
        title="No auctions here"
        description="Nothing in this category yet. Check back soon."
      />
    );

  return (
    <ul className="flex snap-x snap-mandatory scrollbar-none gap-3 overflow-x-auto px-2">
      {featuredAuctions.map((auction) => (
        <li key={auction.id}>
          <FeaturedCard auction={auction} />
        </li>
      ))}
    </ul>
  );
}

export default Featured;

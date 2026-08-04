import EmptyState from "@/components/EmptyState";
import { useAuctions } from "../../hooks/useAuctions";
import AuctionCardSkeleton from "../AuctionCardSkeleton";
import { Package } from "lucide-react";
import AuctionCard from "../AuctionCard";
import CustomPagination from "@/components/CustomPagination";
import { getPagination } from "@/lib/utils";
import { useSearchParams } from "react-router";

function AuctionList() {
  const { isLoading, auctions, count } = useAuctions();
  const [searchParams] = useSearchParams();
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));
  const { page: currentPage, totalPages } = getPagination(page, count);

  if (isLoading)
    return (
      <ul className="flex-1 space-y-3 px-2 py-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <AuctionCardSkeleton compact key={i} />
        ))}
      </ul>
    );

  if (auctions?.length === 0)
    return (
      <EmptyState
        icon={<Package size={28} />}
        title="No auctions here"
        description="Try adjusting your search or filter settings."
      />
    );

  return (
    <div>
      <ul className="flex-1 space-y-3 px-2 py-4">
        {auctions?.map((auction) => (
          <AuctionCard compact auction={auction} key={auction.id} />
        ))}
      </ul>

      <CustomPagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}

export default AuctionList;

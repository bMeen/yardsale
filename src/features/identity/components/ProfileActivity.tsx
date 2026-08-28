import { useState } from "react";
import { useParams } from "react-router";
import { useProfileActivity } from "../hooks/useProfileActivity";
import { EMPTY_PROFILE_ACTIVITY, type ProfileActivityType } from "../types";
import { getPagination } from "@/lib/utils";
import AuctionCardSkeleton from "@/features/auction/components/AuctionCardSkeleton";
import EmptyState from "@/components/EmptyState";
import { Package } from "lucide-react";
import AuctionCard from "@/features/auction/components/AuctionCard";
import CustomPagination from "@/components/CustomPagination";

function ProfileActivity() {
  const { type } = useParams();
  const [page, setPage] = useState(1);
  const { isLoading, auctions, count } = useProfileActivity({
    type: type as ProfileActivityType,
    page,
  });
  const { page: currentPage, totalPages } = getPagination(page, count!);

  const title = EMPTY_PROFILE_ACTIVITY[type as ProfileActivityType].title;
  const description =
    EMPTY_PROFILE_ACTIVITY[type as ProfileActivityType].description;

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
        title={title}
        description={description}
      />
    );

  return (
    <div>
      <ul className="flex-1 space-y-3">
        {auctions?.map((auction) => (
          <AuctionCard compact auction={auction} key={auction.id} />
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

export default ProfileActivity;

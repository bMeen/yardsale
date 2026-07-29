import { Skeleton } from "@/components/ui/skeleton";

function FeaturedAuctionCardSkeleton() {
  return (
    <div className="relative h-80 w-68 shrink-0 overflow-hidden rounded-2xl">
      <Skeleton className="absolute inset-0 h-full w-full rounded-2xl" />

      <Skeleton className="absolute top-3 right-3 h-6 w-16 rounded-full" />

      <div className="absolute inset-x-0 bottom-0 p-4">
        <Skeleton className="h-5 w-20 rounded-full" />

        <div className="mt-2 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-32" />
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-28" />
          </div>

          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default FeaturedAuctionCardSkeleton;

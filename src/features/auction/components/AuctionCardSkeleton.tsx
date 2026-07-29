import { Skeleton } from "@/components/ui/skeleton";

function AuctionCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="bg-card border-border flex gap-3 rounded-2xl border p-3">
        {/* Image */}
        <Skeleton className="h-20 w-20 shrink-0 rounded-xl" />

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full max-w-40" />
              <Skeleton className="h-4 w-28" />
            </div>

            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          <Skeleton className="mt-2 h-3 w-20" />

          <div className="mt-4 flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>

            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border-border overflow-hidden rounded-2xl border">
      {/* Image */}
      <div className="relative h-50">
        <Skeleton className="h-full w-full" />

        {/* Status pill */}
        <Skeleton className="absolute top-2 right-2 h-5 w-16 rounded-full" />
      </div>

      {/* Content */}
      <div className="p-3">
        <Skeleton className="h-3 w-20" />

        <div className="mt-2 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-12" />
          </div>

          <Skeleton className="h-9 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default AuctionCardSkeleton;

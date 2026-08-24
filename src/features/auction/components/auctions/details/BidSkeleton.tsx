import { Skeleton } from "@/components/ui/skeleton";

function BidSkeleton() {
  return (
    <div className="bg-card flex items-center gap-3 rounded-xl p-2">
      <Skeleton className="bg-muted h-10 w-10 shrink-0 rounded-full" />

      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="bg-muted h-3 w-1/5 rounded-xl" />
        <Skeleton className="bg-muted h-3 w-10 rounded-xl" />
      </div>

      <Skeleton className="bg-muted h-3 w-14 shrink-0 rounded-xl" />
    </div>
  );
}

export default BidSkeleton;

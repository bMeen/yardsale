import { Skeleton } from "@/components/ui/skeleton";

function TransactionCardSkeleton() {
  return (
    <div className="bg-card flex items-center gap-3 rounded-2xl p-4">
      <Skeleton className="bg-muted h-10 w-10 shrink-0 rounded-xl" />

      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="bg-muted h-2 w-1/5 rounded" />
        <Skeleton className="bg-muted h-2 w-10 rounded" />
      </div>

      <Skeleton className="bg-muted h-2 w-10 shrink-0 rounded" />
    </div>
  );
}

export default TransactionCardSkeleton;

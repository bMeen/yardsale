import { Skeleton } from "@/components/ui/skeleton";

function WalletCardSkeleton() {
  return (
    <div className="bg-primary text-primary-foreground space-y-5 rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <Skeleton className="bg-muted h-3 w-5" />
        <Skeleton className="bg-muted h-3 w-15" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <div className="space-y-1" key={index}>
            <Skeleton className="bg-muted h-5 w-20" />
            <Skeleton className="bg-muted h-5 w-50" />
          </div>
        ))}
      </div>

      <Skeleton className="bg-muted h-7 w-full shrink-0" />
    </div>
  );
}

export default WalletCardSkeleton;

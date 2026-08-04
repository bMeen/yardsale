import { Skeleton } from "@/components/ui/skeleton";

function NotificationCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-3 w-36" />

      <ul className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <li
            key={index}
            className="bg-card border-border flex w-full items-start gap-3 rounded-2xl border-[0.5px] p-3"
          >
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-2 w-36" />
                <Skeleton className="mt-1 h-2 w-2 rounded-full" />
              </div>

              <div className="mt-2 space-y-1">
                <Skeleton className="h-2 w-3/5" />
              </div>

              <Skeleton className="mt-2 h-2 w-20" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotificationCardSkeleton;

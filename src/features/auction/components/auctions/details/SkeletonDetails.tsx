import { Skeleton } from "@/components/ui/skeleton";

function SkeletonDetails() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <Skeleton className="h-120 w-full" />

      <section className="space-y-5 px-2 py-4 md:px-0">
        <div className="space-y-3">
          <Skeleton className="h-6 w-20 rounded-full" />

          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4 md:w-1/2" />

            <div className="space-y-1.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        <div className="space-y-4 border-y py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-28" />
            </div>

            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-32" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-10" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default SkeletonDetails;

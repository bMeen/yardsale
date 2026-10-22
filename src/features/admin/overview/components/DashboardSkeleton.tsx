function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-card rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="bg-muted h-3 w-24 rounded" />
                <div className="bg-muted h-8 w-32 max-w-full rounded" />
              </div>
              <div className="bg-muted h-9 w-9 shrink-0 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl p-5">
        <div className="bg-muted mb-6 h-3 w-44 rounded" />

        <div className="divide-border grid grid-cols-5 divide-x">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="space-y-2 px-4 text-center first:pl-0 last:pr-0"
            >
              <div className="bg-muted mx-auto h-7 w-10 rounded" />
              <div className="bg-muted mx-auto h-3 w-16 max-w-full rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="bg-card rounded-2xl p-6 lg:col-span-3">
          <div className="bg-muted mb-2 h-5 w-40 rounded" />
          <div className="bg-muted mb-8 h-3 w-56 max-w-full rounded" />

          <div className="bg-muted mb-8 h-8 w-44 rounded" />

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <div className="space-y-4">
              <div className="bg-muted h-4 w-32 rounded" />
              <div className="flex h-64 items-end justify-around gap-3 px-4">
                {[40, 70, 50, 90, 60].map((height, i) => (
                  <div
                    key={i}
                    className="bg-muted w-full max-w-12 rounded-t-md"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-muted h-4 w-36 rounded" />
              <div className="flex h-64 items-center justify-center">
                <div className="bg-muted h-44 w-44 rounded-full" />
              </div>
              <div className="flex justify-center gap-3">
                <div className="bg-muted h-3 w-16 rounded" />
                <div className="bg-muted h-3 w-16 rounded" />
                <div className="bg-muted h-3 w-16 rounded" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card flex flex-col rounded-2xl p-6 lg:col-span-2">
          <div className="bg-muted mb-6 h-5 w-36 rounded" />

          <ul className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 p-2.5">
                <div className="bg-muted h-10 w-10 shrink-0 rounded-xl" />

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="bg-muted h-4 w-3/4 rounded" />
                  <div className="bg-muted h-3 w-1/2 rounded" />
                </div>

                <div className="bg-muted h-6 w-16 shrink-0 rounded-full" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;

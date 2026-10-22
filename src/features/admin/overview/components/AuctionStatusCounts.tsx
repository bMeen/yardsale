import { useDashboardStats } from "../hooks/useDashboardStats";

function AuctionStatusCounts() {
  const { data } = useDashboardStats();

  if (!data) return;
  const { auction_counts_by_status } = data;

  const statusColors: Record<string, string> = {
    ACTIVE: "text-emerald-700",
    SCHEDULED: "text-sky-700",
    ENDED: "text-stone-500",
    SETTLED: "text-violet-700",
    CANCELLED: "text-red-500",
  };

  return (
    <div className="bg-card rounded-2xl p-5">
      <p className="text-muted-foreground mb-4 text-xs font-semibold tracking-wider uppercase">
        Auction Status Breakdown
      </p>
      <div className="divide-border grid grid-cols-5 divide-x">
        {Object.entries(auction_counts_by_status).map(([status, count]) => (
          <div key={status} className="px-4 text-center first:pl-0 last:pr-0">
            <p
              className={`font-display text-2xl font-bold ${statusColors[status]}`}
            >
              {count}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">{status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AuctionStatusCounts;

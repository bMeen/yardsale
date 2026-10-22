import { Activity, Tag, TrendingUp, Users, WalletCards } from "lucide-react";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { formatAmount } from "@/lib/utils";

function KpiCards() {
  const { data } = useDashboardStats();

  if (!data) return;

  const CARDS = [
    {
      label: "Total Users",
      value: data.total_users.toLocaleString(),
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Auctions",
      value: data.total_auctions.toLocaleString(),
      icon: Tag,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Total Bids",
      value: data.total_bids.toLocaleString(),
      icon: Activity,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Funds Minted",
      value: formatAmount(data.funds_minted),
      icon: WalletCards,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Platform Revenue",
      value: formatAmount(data.revenue?.total),
      icon: TrendingUp,
      color: "bg-accent/20 text-amber-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {CARDS.map((card) => (
        <div key={card.label} className="bg-card rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                {card.label}
              </p>
              <p className="font-display mt-1.5 text-3xl leading-none font-bold">
                {card.value}
              </p>
            </div>
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.color}`}
            >
              <card.icon size={16} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default KpiCards;

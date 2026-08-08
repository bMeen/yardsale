import { DIRECTION_STYLE, ICON_BY_ENTRY_TYPE } from "@/shared/constants";
import type { Activity } from "../types";
import { formatAmount, formatTime } from "@/lib/utils";

function TransactionCard({ transaction }: { transaction: Activity }) {
  const Icon = ICON_BY_ENTRY_TYPE[transaction.entry_type];
  const style = DIRECTION_STYLE[transaction.direction];

  return (
    <div className="bg-card flex items-center gap-3 rounded-2xl p-4">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
      >
        <Icon size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug font-medium">
          {transaction.description}
        </p>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {formatTime(new Date(transaction.created_at))}
        </p>
      </div>
      <p className={`shrink-0 font-mono text-sm font-bold ${style.text}`}>
        {style.sign}
        {formatAmount(transaction.amount)}
      </p>
    </div>
  );
}

export default TransactionCard;

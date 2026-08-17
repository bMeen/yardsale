import type {
  AuctionStatus,
  Category,
  VisibleStatus,
} from "@/features/auction/types";
import { formatTime } from "@/lib/utils";
import { STATUS_PILL } from "@/shared/constants";
import { Clock } from "lucide-react";

type Props = {
  status: AuctionStatus;
  category: Category;
  starts_at: string;
  ends_at: string;
};

function Status({ status, category, starts_at }: Props) {
  const pill =
    STATUS_PILL[status as VisibleStatus] ?? "bg-stone-100 text-stone-500";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pill}`}
      >
        {status}
      </span>
      <span className="text-muted-foreground bg-secondary rounded-full px-2.5 py-1 text-xs font-medium">
        {category.replace("_", " ")}
      </span>
      {status === "ACTIVE" && (
        <div className="ml-auto">
          <Clock size={18} />
          {/* <CountdownTimer endsAt={auction.endsAt} /> */}
        </div>
      )}
      {status === "SCHEDULED" && (
        <span className="text-muted-foreground ml-auto font-mono text-xs">
          Starts {formatTime(new Date(starts_at))}
        </span>
      )}
    </div>
  );
}

export default Status;

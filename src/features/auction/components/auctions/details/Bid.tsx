//import { Button } from "@/components/ui/button";
//import { useCancelBid } from "@/features/auction/hooks////////useAuctionBid";
import UserAvatar from "@/components/UserAvatar";
import { useAuction } from "@/features/auction/hooks/useAuction";
import type { AuctionDetailsBid } from "@/features/auction/types";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { formatAmount, formatTime } from "@/lib/utils";

function Bid({ bid }: { bid: AuctionDetailsBid }) {
  const { auction } = useAuction();
  const { user } = useCurrentUser();
  //const { isCancelling, cancel } = useCancelBid();

  const isMine = bid?.bidder.id === user?.profile?.id;
  const isCancelled = bid.status === "CANCELLED";
  const isLeading = bid.id === auction?.highest_bid?.id;

  /*   function handleCancel() {
    cancel({ p_bid_id: bid.id });
  } */

  return (
    <li
      className={`bg-card flex items-center gap-3 rounded-xl p-3 transition-colors`}
    >
      <UserAvatar
        url={bid.bidder.avatar_url || ""}
        fallback={bid.bidder.username[0]}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className={`text-sm font-medium ${isMine ? "text-primary" : ""}`}>
            {isMine ? "You" : bid.bidder.username}
          </p>
          {isLeading && (
            <span className="bg-success/10 text-success rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
              Leading
            </span>
          )}
          {isCancelled && (
            <span className="bg-destructive/10 text-destructive rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
              Cancelled
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-xs">
          {formatTime(new Date(bid.created_at))}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={`font-mono text-sm font-bold ${isMine ? "text-primary" : ""}`}
        >
          {formatAmount(bid.amount)}
        </p>
        {/* {isMine &&
          !isLeading &&
          !isCancelled &&
          auction?.status === "ACTIVE" && (
            <Button
              disabled={isCancelling}
              onClick={handleCancel}
              variant="destructive"
              className="cursor-pointer"
              size="xs"
            >
              Cancel
            </Button>
          )} */}
      </div>
    </li>
  );
}

export default Bid;

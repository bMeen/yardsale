import type { AuctionDetails } from "@/features/auction/types";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { formatAmount } from "@/lib/utils";
import { Clock, Trophy } from "lucide-react";

function AuctionState({ auction }: { auction: AuctionDetails }) {
  const { user } = useCurrentUser();
  const isMine = auction.seller.id === user?.profile?.id;
  const isWinner = auction.winner?.id === user?.profile?.id;

  return (
    <>
      {auction.status === "SCHEDULED" && !isMine && (
        <div className="text-center">
          <div className="flex justify-center">
            <Clock size={28} />
          </div>
          <p className="text-sm font-semibold md:text-lg">
            Auction not live yet.
          </p>
          <p className="text-muted-foreground text-xs md:text-sm">
            Starts{" "}
            {new Date(auction.starts_at).toLocaleString("en-NG", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          <p className="text-primary font-mono text-lg font-bold">
            {formatAmount(auction.starting_price)}
          </p>
          <p className="text-muted-foreground text-xs md:text-sm">
            Starting price
          </p>
        </div>
      )}
      {(auction.status === "ENDED" || auction.status === "SETTLED") && (
        <div className="space-y-1">
          <div className="text-muted-foreground flex items-baseline justify-between text-xs md:text-sm">
            <p className="tracking-wide uppercase">Winning bid</p>
            <p>{auction.bid_count} total bids</p>
          </div>
          <p className="text-primary font-mono text-2xl font-bold md:text-3xl">
            {formatAmount(auction.current_price)}
          </p>
          {auction.status === "SETTLED" && isWinner && (
            <div className="bg-accent/20 flex items-center gap-2 rounded-sm border-amber-200 p-3">
              <Trophy size={28} className="text-amber-600" />
              <p className="text-sm font-semibold text-amber-800 md:text-base">
                You won this auction!
              </p>
            </div>
          )}
          {auction.status === "ENDED" && (
            <p className="text-muted-foreground text-xs md:text-sm">
              Settlement pending
            </p>
          )}
        </div>
      )}
      {isMine &&
        (auction.status === "SCHEDULED" || auction.status === "ACTIVE") && (
          <div className="space-y-1">
            <div>
              <p className="text-muted-foreground text-xs tracking-wide uppercase md:text-sm">
                {auction.bid_count > 0
                  ? "Current highest bid"
                  : "Starting price"}
              </p>
              <p className="text-primary font-mono text-2xl font-bold md:text-3xl">
                {formatAmount(
                  auction.bid_count > 0
                    ? auction.current_price
                    : auction.starting_price,
                )}
              </p>
            </div>
            <p className="text-muted-foreground text-sm">
              Sellers cannot bid on their own auctions. Manage this listing
              using the ⋮ menu above.
            </p>
          </div>
        )}
    </>
  );
}

export default AuctionState;

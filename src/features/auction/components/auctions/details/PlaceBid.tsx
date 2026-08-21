import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBid } from "@/features/auction/hooks/useAuctionBid";

import type { AuctionDetails } from "@/features/auction/types";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { formatAmount } from "@/lib/utils";
import { KOBO_RATE, MIN_BID_INCREMENT } from "@/shared/constants";
import { Loader2 } from "lucide-react";
import { useState, type ChangeEvent } from "react";

function PlaceBid({ auction }: { auction: AuctionDetails }) {
  const { user } = useCurrentUser();
  const [bidInput, setBidInput] = useState("");
  const [bidError, setBidError] = useState<string | null>(null);
  const { isPlacing, bid } = useBid();

  const isMine = auction.seller.id === user?.profile?.id;
  const canBid = !isMine && auction.status === "ACTIVE";
  const minimumBid =
    auction.current_price > 0
      ? auction.current_price / KOBO_RATE + MIN_BID_INCREMENT
      : auction.starting_price / KOBO_RATE;

  const handleQuickBid = (increment: number) => {
    setBidInput(String(minimumBid + increment));
    setBidError(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    setBidInput(e.target.value);
    setBidError(null);
  };

  const handlePlaceBid = async () => {
    const amount = parseInt(bidInput.replace(/,/g, ""), 10);
    if (isNaN(amount) || amount < minimumBid) {
      setBidError(`Minimum bid is ${formatAmount(minimumBid * KOBO_RATE)}`);
      return;
    }
    bid(
      { p_amount: amount * KOBO_RATE, p_auction_id: auction.id },
      { onSuccess: () => setBidInput("") },
    );
  };

  return (
    <>
      {canBid && (
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-muted-foreground text-xs tracking-wide uppercase md:text-sm">
                {auction.current_price > 0 ? "Current bid" : "Starting price"}
              </p>
              <p className="text-primary font-mono text-3xl font-bold">
                {formatAmount(auction.current_price || auction.starting_price)}
              </p>
            </div>
            <p className="text-muted-foreground text-sm">
              {auction.bid_count} bids
            </p>
          </div>

          <div className="flex gap-2">
            {[1000, 5000, 10000]
              //.map((amount) => amount * KOBO_RATE)
              .map((inc) => (
                <Button
                  key={inc}
                  className="flex-1 cursor-pointer py-2.5"
                  variant="secondary"
                  onClick={() => handleQuickBid(inc)}
                >
                  +{formatAmount(inc * KOBO_RATE)}
                </Button>
              ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                value={bidInput}
                onChange={handleChange}
                type="number"
                placeholder={String(minimumBid)}
                className="bg-muted h-10 [appearance:textfield] border-transparent focus:bg-white focus-visible:border focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />

              <span className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer">
                <p className="text-muted-foreground">₦</p>
              </span>
            </div>
            <Button
              onClick={handlePlaceBid}
              disabled={isPlacing}
              className="h-10 cursor-pointer"
            >
              {isPlacing && <Loader2 size={15} className="animate-spin" />}
              {isPlacing ? "Placing…" : "Place Bid"}
            </Button>
          </div>

          {bidError && (
            <p className="text-xs text-red-500 md:text-sm">{bidError}</p>
          )}
          <p className="text-muted-foreground text-xs md:text-sm">
            Min. bid:{" "}
            <span className="font-mono font-medium">
              {formatAmount(minimumBid * KOBO_RATE)}
            </span>
          </p>
        </div>
      )}
    </>
  );
}

export default PlaceBid;

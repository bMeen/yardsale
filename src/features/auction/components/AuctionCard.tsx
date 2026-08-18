import { formatAmount } from "@/lib/utils";
import type { FullAuction, VisibleStatus } from "../types";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "../apiAuctions";
import { useNavigate } from "react-router";
import { STATUS_PILL } from "@/shared/constants";
import CountdownTimer from "./CountdownTImer";

function AuctionCard({
  auction,
  compact = false,
}: {
  auction: FullAuction;
  compact?: boolean;
}) {
  const pill =
    STATUS_PILL[auction.status as VisibleStatus] ??
    "bg-stone-100 text-stone-500";
  const displayBid =
    auction.current_price > 0 ? auction.current_price : auction.starting_price;

  const imgSrc = getImageUrl(auction?.auction_images[0]?.storage_path);

  const navigate = useNavigate();

  function goToAuction() {
    navigate(`/auctions/${auction.id}`);
  }

  if (compact)
    return (
      <div
        onClick={goToAuction}
        className="bg-card flex cursor-pointer gap-3 rounded-2xl p-3 transition-shadow hover:shadow-sm"
      >
        <div className="bg-muted h-20 w-20 shrink-0 overflow-hidden rounded-xl">
          {imgSrc && (
            <img
              src={imgSrc}
              alt={auction.title}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 text-sm leading-snug font-medium">
              {auction.title}
            </p>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${pill}`}
            >
              {auction.status}
            </span>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {auction.category}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-[10px] tracking-wide uppercase">
                {auction.current_price > 0 ? "Current bid" : "Starting"}
              </p>
              <p className="text-primary font-mono text-sm font-bold">
                {formatAmount(displayBid)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-xs">
                {auction.bid_count} bids
              </p>
              {auction.status === "ACTIVE" && (
                <CountdownTimer endsAt={new Date(auction.ends_at)} />
              )}
            </div>
          </div>
        </div>
        {/* {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors"
          >
            <X size={14} />
          </button>
        )} */}
      </div>
    );

  return (
    <div
      onClick={goToAuction}
      className="bg-card group cursor-pointer overflow-hidden rounded-2xl transition-all duration-200 hover:shadow-sm"
    >
      <div className="bg-muted relative h-50 overflow-hidden">
        {imgSrc && (
          <img
            src={imgSrc}
            alt={auction.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute top-2 right-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${pill}`}
          >
            {auction.status}
          </span>
        </div>
        {/* {watchlisted && (
          <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90">
            <Heart size={12} className="fill-red-500 text-red-500" />
          </div>
        )} */}
        {auction.status === "ACTIVE" && (
          <div className="absolute bottom-2 left-2 rounded-full bg-white/60 px-2 py-0.5 backdrop-blur-sm">
            <CountdownTimer endsAt={new Date(auction.ends_at)} />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-muted-foreground text-[10px] tracking-wide uppercase">
          {auction.category}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-sm leading-snug font-medium">
          {auction.title}
        </h3>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <p className="text-primary font-mono text-base font-bold">
              {formatAmount(displayBid)}
            </p>
            <p className="text-muted-foreground text-[10px]">
              {auction.bid_count} bids
            </p>
          </div>
          <Button variant="link">View</Button>
        </div>
      </div>
    </div>
  );
}

export default AuctionCard;

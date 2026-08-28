import { formatAmount } from "@/lib/utils";
import type { FullAuction } from "../../types";
import { getImageUrl } from "../../apiAuctions";
import CountdownTimer from "../CountdownTImer";
import { useNavigate } from "react-router";

function FeaturedCard({ auction }: { auction: FullAuction }) {
  const navigate = useNavigate();

  const imgSrc = getImageUrl(auction?.auction_images[0]?.storage_path);

  function goToAuction() {
    navigate(`/auctions/${auction.id}`);
  }

  return (
    <div
      className="group relative h-80 w-68 shrink-0 cursor-pointer overflow-hidden rounded-2xl"
      onClick={goToAuction}
    >
      {imgSrc && (
        <img
          src={imgSrc}
          alt={auction?.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-medium text-white/70 backdrop-blur-sm">
          {auction?.category}
        </span>
        <h3 className="font-display mt-2 line-clamp-2 text-xl leading-tight font-bold text-white">
          {auction?.title}
        </h3>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <p className="text-[10px] tracking-wide text-white/50 uppercase">
              {auction?.bid_count > 0 ? "Current bid" : "Starting"}
            </p>
            <p className="font-mono text-xl font-bold text-white">
              {formatAmount(
                auction?.highest_bid?.amount || auction.starting_price,
              )}
            </p>
          </div>
          {auction.status === "ACTIVE" && (
            <div className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1.5 backdrop-blur-sm">
              {/*  <Clock
                size={11}
                className={urgent ? "text-red-400" : "text-white/70"}
              />
              <span
                className={`font-mono text-xs font-medium ${urgent ? "text-red-400" : "text-white"}`}
              >
                {label}
              </span> */}
              <CountdownTimer
                endsAt={new Date(auction.ends_at)}
                addPrefix={false}
              />
            </div>
          )}
        </div>
      </div>
      <div className="absolute top-3 right-3 rounded-full bg-black/40 px-2 py-0.5 backdrop-blur-sm">
        <span className="text-xs font-medium text-white">
          {auction?.bid_count} bids
        </span>
      </div>
    </div>
  );
}

export default FeaturedCard;

//import { Clock } from "lucide-react";

function FeaturedCard() {
  return (
    <div className="group relative h-80 w-68 shrink-0 cursor-pointer overflow-hidden rounded-2xl">
      <img
        src={
          "https://images.unsplash.com/photo-1601854525059-f807eea1d9e1?w=700&h=500&fit=crop&auto=format"
        }
        alt={"Vintage Leica M6 Film Camera"}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-medium text-white/70 backdrop-blur-sm">
          Electronics
        </span>
        <h3 className="font-display mt-2 line-clamp-2 text-xl leading-tight font-bold text-white">
          Vintage Leica M6 Film Camera
        </h3>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <p className="text-[10px] tracking-wide text-white/50 uppercase">
              {/* {auction.currentBid > 0 ? "Current bid" : "Starting"} */}
              Current bid
            </p>
            <p className="font-mono text-xl font-bold text-white">
              {/* {fmt(auction.currentBid || auction.startingPrice)} */}
            </p>
          </div>
          {/* {auction.status === "Active" && (
            <div className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1.5 backdrop-blur-sm">
              <Clock
                size={11}
                className={urgent ? "text-red-400" : "text-white/70"}
              />
              <span
                className={`font-mono text-xs font-medium ${urgent ? "text-red-400" : "text-white"}`}
              >
                {label}
              </span>
            </div>
          )} */}
        </div>
      </div>
      <div className="absolute top-3 right-3 rounded-full bg-black/40 px-2 py-0.5 backdrop-blur-sm">
        <span className="text-xs font-medium text-white">
          {/* {auction.bidCount} */} 13 bids
        </span>
      </div>
    </div>
  );
}

export default FeaturedCard;

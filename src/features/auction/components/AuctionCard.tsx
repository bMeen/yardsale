/* function AuctionCard() {
  const pill = STATUS_PILL[auction.status] ?? "bg-stone-100 text-stone-500";
  const displayBid =
    auction.currentBid > 0 ? auction.currentBid : auction.startingPrice;

  if (compact)
    return (
      <div className="bg-card border-border flex cursor-pointer gap-3 rounded-2xl border p-3 transition-shadow hover:shadow-md">
        <div className="bg-muted h-20 w-20 shrink-0 overflow-hidden rounded-xl">
          <img
            src={auction.images[0]}
            alt={auction.title}
            className="h-full w-full object-cover"
          />
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
                {auction.currentBid > 0 ? "Current bid" : "Starting"}
              </p>
              <p className="text-primary font-mono text-sm font-bold">
                {fmt(displayBid)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-xs">
                {auction.bidCount} bids
              </p>
              {auction.status === "Active" && (
                <CountdownTimer endsAt={auction.endsAt} />
              )}
            </div>
          </div>
        </div>
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
    );

  return (
    <div className="bg-card border-border group cursor-pointer overflow-hidden rounded-2xl border transition-all duration-200 hover:shadow-lg">
      <div className="bg-muted relative h-40 overflow-hidden">
        <img
          src={auction.images[0]}
          alt={auction.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${pill}`}
          >
            {auction.status}
          </span>
        </div>
        {watchlisted && (
          <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90">
            <Heart size={12} className="fill-red-500 text-red-500" />
          </div>
        )}
        {auction.status === "Active" && (
          <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 backdrop-blur-sm">
            <CountdownTimer endsAt={auction.endsAt} />
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
              {fmt(displayBid)}
            </p>
            <p className="text-muted-foreground text-[10px]">
              {auction.bidCount} bids
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen?.();
            }}
            className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuctionCard; */

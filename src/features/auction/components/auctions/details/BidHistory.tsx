import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import Bids from "./Bids";

function BidHistory({ count }: { count: number }) {
  const [showHistory, setShowHistory] = useState(true);

  return (
    <section className="space-y-3">
      <button
        onClick={() => setShowHistory((h) => !h)}
        className="flex w-full cursor-pointer items-center justify-between"
      >
        <h3 className="font-display text-lg font-bold tracking-tight uppercase md:text-xl">
          Bid History
        </h3>
        <div className="text-muted-foreground flex items-center gap-1.5">
          <span className="text-xs md:text-sm">{count} bids</span>
          {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {showHistory && <Bids />}
    </section>
  );
}

export default BidHistory;

import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import Title from "@/components/Title";
import { Button } from "@/components/ui/button";
import AuctionState from "@/features/auction/components/auctions/details/AuctionState";
import BidHistory from "@/features/auction/components/auctions/details/BidHistory";
import ImageGallery from "@/features/auction/components/auctions/details/ImageGallery";
import PlaceBid from "@/features/auction/components/auctions/details/PlaceBid";
import SellerInfo from "@/features/auction/components/auctions/details/SellerInfo";
import SellerMenu from "@/features/auction/components/auctions/details/SellerMenu";
import SkeletonDetails from "@/features/auction/components/auctions/details/SkeletonDetails";
import Status from "@/features/auction/components/auctions/details/Status";
import {
  useAuction,
  useToggleWatchlist,
} from "@/features/auction/hooks/useAuction";
import { useAuctionBids } from "@/features/auction/hooks/useAuctionBid";
import { useToast } from "@/shared/hooks/useToast";
import { ArrowLeft, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

function Auction() {
  const navigate = useNavigate();
  const { isLoading, auction } = useAuction();
  const { isLoading: isLoadingBids } = useAuctionBids();
  const { toggle } = useToggleWatchlist();
  const { toastSuccess } = useToast();
  const [optimisticWatchlist, setOptimisticWatchlist] = useState(
    auction?.is_watchlisted,
  );

  useEffect(() => {
    function updateWatchlist() {
      if (!auction) return;
      setOptimisticWatchlist(auction.is_watchlisted);
    }

    updateWatchlist();
  }, [auction]);

  if (isLoading || isLoadingBids) return <SkeletonDetails />;

  if (!auction) return;

  const statusProps = {
    status: auction.status,
    category: auction.category,
    starts_at: auction.starts_at,
    ends_at: auction.ends_at,
  };

  function handleToggleWatchlist() {
    if (!auction?.id) return;

    const previousValue = optimisticWatchlist;
    const nextValue = !previousValue;

    setOptimisticWatchlist(nextValue);
    toggle(
      { p_auction_id: auction?.id },
      {
        onSuccess: () => {
          toastSuccess(
            "Success",
            `Auction ${nextValue ? "added to" : "removed from"} your watchlists`,
          );
        },
        onError: () => {
          setOptimisticWatchlist(previousValue);
        },
      },
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate(-1)}
            size="icon-lg"
            variant="ghost"
            className="cursor-pointer"
          >
            <ArrowLeft size={20} />
          </Button>

          <div className="flex-1">
            <Title>{auction?.title}</Title>
          </div>

          <Button
            onClick={handleToggleWatchlist}
            size="icon-lg"
            variant="ghost"
            className="cursor-pointer"
          >
            <Heart
              className={
                optimisticWatchlist
                  ? "fill-red-500 text-red-500"
                  : "text-muted-foreground"
              }
              size={20}
            />
          </Button>

          <SellerMenu auction={auction} />
        </div>
      </PageHeader>

      <div className="mx-auto w-full max-w-3xl">
        <ImageGallery images={auction.auction_images} />

        <section className="space-y-5 px-2 py-4 lg:px-0">
          <div className="space-y-1">
            <Status {...statusProps} />

            <div>
              <h1 className="font-display text-2xl leading-tight font-extrabold">
                {auction.title}
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {auction.description}
              </p>
            </div>
          </div>

          <SellerInfo seller={auction?.seller} />

          <div className="border-y py-3">
            <AuctionState auction={auction} />

            <PlaceBid auction={auction} />
          </div>

          <BidHistory count={auction.bid_count} />
        </section>
      </div>
    </PageContainer>
  );
}

export default Auction;

import { useModal } from "@/components/custom-modal/context";
import { Button } from "@/components/ui/button";
import { useCancelAuction } from "@/features/auction/hooks/useAuction";
import { Loader2, OctagonXIcon } from "lucide-react";
import { useParams } from "react-router";

function CancelAuction() {
  const { auctionId: id } = useParams();
  const { close } = useModal();
  const { isPending, cancel } = useCancelAuction();

  function handleCancel() {
    if (!id) return;
    cancel(
      { p_auction_id: id },
      {
        onSuccess: () => close(),
        onError: () => close(),
      },
    );
  }

  return (
    <section className="space-y-4 p-4 md:p-0">
      <div
        className={`bg-destructive/10 text-destructive flex h-12 w-12 items-center justify-center rounded-2xl`}
      >
        <OctagonXIcon size={22} />
      </div>

      <div className="space-y-2">
        <h3 className="font-display text-xl font-bold">Cancel Auction?</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Are you sure you want to cancel this auction? This action can't be
          undone.
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="h-11 flex-1 cursor-pointer"
          onClick={close}
        >
          Close
        </Button>

        <Button
          disabled={isPending}
          variant="destructive"
          className="h-11 flex-1 cursor-pointer"
          onClick={handleCancel}
        >
          {isPending && <Loader2 className="animate-spin" />}
          Cancel
        </Button>
      </div>
    </section>
  );
}

export default CancelAuction;

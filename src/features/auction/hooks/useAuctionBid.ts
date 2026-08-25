import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { cancelBid, getAuctionBids, placeBid } from "../apiAuctions";
import { useToast } from "@/shared/hooks/useToast";
import type { PostgrestError } from "@supabase/supabase-js";

export function useAuctionBids(page: number) {
  const { auctionId: id } = useParams();

  const { isLoading, data: bids = [] } = useQuery({
    queryKey: ["bids", id, page],
    queryFn: () => getAuctionBids({ id, page }),
  });

  const count = bids?.[0]?.total_count ?? 0;
  return { isLoading, bids, count };
}

export function useBid() {
  const { toastError, toastSuccess } = useToast();

  const { isPending: isPlacing, mutate: bid } = useMutation({
    mutationFn: placeBid,
    onSuccess: () => {
      toastSuccess("Success", "You have successfully placed your bid");
    },

    onError: (error: PostgrestError) => {
      toastError(error);
    },
  });

  return { isPlacing, bid };
}

export function useCancelBid() {
  const { toastError, toastSuccess } = useToast();

  const { isPending: isCancelling, mutate: cancel } = useMutation({
    mutationFn: cancelBid,
    onSuccess: () => {
      toastSuccess("Success", "You have successfully cancel your bid");
    },

    onError: (error: PostgrestError) => {
      toastError(error);
    },
  });

  return { isCancelling, cancel };
}

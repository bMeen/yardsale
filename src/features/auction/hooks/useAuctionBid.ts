import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router";
import { cancelBid, getAuctionBids, placeBid } from "../apiAuctions";
import { useToast } from "@/shared/hooks/useToast";
import type { PostgrestError } from "@supabase/supabase-js";

export function useAuctionBids() {
  const { auctionId: id } = useParams();
  const [searchParams] = useSearchParams();
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  const { isLoading, data: bids = [] } = useQuery({
    queryKey: ["bids", id, page],
    queryFn: () => getAuctionBids({ id, page }),
  });

  return { isLoading, bids };
}

export function useBid() {
  const queryClient = useQueryClient();
  const { auctionId: id } = useParams();
  const { toastError, toastSuccess } = useToast();

  const { isPending: isPlacing, mutate: bid } = useMutation({
    mutationFn: placeBid,
    onSuccess: () => {
      toastSuccess("Success", "You have successfully placed your bid");
      queryClient.invalidateQueries({
        queryKey: ["auction", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["bids", id, 1],
      });
    },

    onError: (error: PostgrestError) => {
      toastError(error);
    },
  });

  return { isPlacing, bid };
}

export function useCancelBid() {
  const queryClient = useQueryClient();
  const { auctionId: id } = useParams();
  const { toastError, toastSuccess } = useToast();

  const { isPending: isCancelling, mutate: cancel } = useMutation({
    mutationFn: cancelBid,
    onSuccess: () => {
      toastSuccess("Success", "You have successfully cancel your bid");
      queryClient.invalidateQueries({
        queryKey: ["auction", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["bids", id, 1],
      });
    },

    onError: (error: PostgrestError) => {
      toastError(error);
    },
  });

  return { isCancelling, cancel };
}

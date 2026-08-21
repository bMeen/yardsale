import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import {
  cancelAuction,
  createAuction,
  getAuction,
  toggleWatchlist,
  updateAuction,
} from "../apiAuctions";
import { useToast } from "@/shared/hooks/useToast";
import type { PostgrestError } from "@supabase/supabase-js";

export function useAuction() {
  const { auctionId: id } = useParams();

  const { isLoading, data: auction } = useQuery({
    queryKey: ["auction", id],
    queryFn: () => getAuction(id),
  });

  return { isLoading, auction };
}

export function useToggleWatchlist() {
  const queryClient = useQueryClient();
  const { auctionId: id } = useParams();
  const { toastError } = useToast();

  const { mutate: toggle } = useMutation({
    mutationFn: toggleWatchlist,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["auction", id],
      });
    },

    onError: (error: PostgrestError) => {
      toastError(error);
    },
  });

  return { toggle };
}

export function useCreateAuction() {
  const { toastError, toastSuccess } = useToast();
  const navigate = useNavigate();

  const { isPending, mutate: publish } = useMutation({
    mutationFn: createAuction,
    onSuccess: (data) => {
      toastSuccess("Success", "Auction Published Successfully");
      navigate(`/auctions/${data.auction_id}`);
    },

    onError: (error: PostgrestError) => {
      toastError(error);
    },
  });

  return { isPending, publish };
}

export function useUpdateAuction() {
  const queryClient = useQueryClient();
  const { auctionId: id } = useParams();
  const { toastError, toastSuccess } = useToast();

  const { isPending: isUpdating, mutate: update } = useMutation({
    mutationFn: updateAuction,
    onSuccess: () => {
      toastSuccess("Success", "Auction Updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["auction", id],
      });
    },

    onError: (error: PostgrestError) => {
      toastError(error);
    },
  });

  return { isUpdating, update };
}

export function useCancelAuction() {
  const navigate = useNavigate();
  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: cancel } = useMutation({
    mutationFn: cancelAuction,
    onSuccess: () => {
      toastSuccess("Success", "Auction Cancelled Successfully");
      navigate(`/auctions`);
    },

    onError: (error: PostgrestError) => {
      toastError(error);
    },
  });

  return { isPending, cancel };
}

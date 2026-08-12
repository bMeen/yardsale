import { useMutation } from "@tanstack/react-query";
import { deleteAuctionImage, uploadAuctionImages } from "../apiAuctions";

export function useUploadImageAuction() {
  const { isPending: isUploading, mutateAsync: uploadMutate } = useMutation({
    mutationFn: uploadAuctionImages,
  });

  return { isUploading, uploadMutate };
}

export function useDeleteImageAuction() {
  const {
    isPending: isDeleting,
    mutateAsync: deleteMutate,
    variables: deleteVariables,
  } = useMutation({
    mutationFn: deleteAuctionImage,
  });

  return { isDeleting, deleteMutate, deleteVariables };
}

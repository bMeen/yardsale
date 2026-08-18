import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "../apiProfile";
import { useToast } from "@/shared/hooks/useToast";
import type { PostgrestError } from "@supabase/supabase-js";

export function useUpdateProfile() {
  const { toastSuccess, toastError } = useToast();
  const queryClient = useQueryClient();

  const { mutate: update, isPending } = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toastSuccess("Success", "Profile Updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["user"],
      });
    },

    onError: (error: PostgrestError) => {
      toastError(error);
    },
  });

  return { update, isPending };
}

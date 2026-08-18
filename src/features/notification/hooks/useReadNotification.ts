import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "../apiNotifications";
import { useToast } from "@/shared/hooks/useToast";
import type { PostgrestError } from "@supabase/supabase-js";

export function useReadNotification() {
  const queryClient = useQueryClient();

  const { mutate: read } = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });

  return { read };
}

export function useReadAllNotification() {
  const { toastError, toastSuccess } = useToast();
  const queryClient = useQueryClient();

  const { isPending, mutate: readAll } = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      toastSuccess("Success", "Notifications marked as read");
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
    onError: (error: PostgrestError) => toastError(error),
  });

  return { readAll, isPending };
}

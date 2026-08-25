import { useMutation } from "@tanstack/react-query";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "../apiNotifications";
import { useToast } from "@/shared/hooks/useToast";
import type { PostgrestError } from "@supabase/supabase-js";

export function useReadNotification() {
  const { mutate: read } = useMutation({
    mutationFn: markNotificationRead,
  });

  return { read };
}

export function useReadAllNotification() {
  const { toastError, toastSuccess } = useToast();

  const { isPending, mutate: readAll } = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      toastSuccess("Success", "Notifications marked as read");
    },
    onError: (error: PostgrestError) => toastError(error),
  });

  return { readAll, isPending };
}

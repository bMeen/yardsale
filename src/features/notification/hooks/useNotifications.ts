import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotificationApi,
  subscribeToNotifications,
} from "../apiNotifications";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useEffect } from "react";

export function useNotifications(page?: number) {
  const { user } = useCurrentUser();

  const {
    isLoading,
    error,
    data: { data: notifications, count } = { data: [], count: 0 },
  } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () =>
      getNotificationApi({ page: page ?? 1, user_id: user?.profile.id }),
  });

  const unreadCount = notifications?.filter((not) => !not.is_read).length;
  return { isLoading, error, notifications, unreadCount, count };
}

export function useNotificationsRealtime() {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const userId = user?.profile?.id;

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToNotifications(userId, queryClient);
    return unsubscribe;
  }, [userId, queryClient]);
}

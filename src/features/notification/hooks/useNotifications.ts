import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { getNotificationApi } from "../apiNotifications";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

export function useNotifications() {
  const { user } = useCurrentUser();
  const [searchParams] = useSearchParams();
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  const {
    isLoading,
    error,
    data: { data: notifications, count } = { data: [], count: 0 },
  } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => getNotificationApi({ page, user_id: user?.profile.id }),
  });

  const unreadCount = notifications?.filter((not) => !not.is_read).length;

  return { isLoading, error, notifications, unreadCount, count };
}

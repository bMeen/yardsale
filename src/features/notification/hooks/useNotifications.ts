import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { getNotificationApi } from "../apiNotifications";

export function useNotifications() {
  const [searchParams] = useSearchParams();
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  const {
    isLoading,
    error,
    data: { data: notifications, count } = { data: [], count: 0 },
  } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => getNotificationApi(page),
  });

  return { isLoading, error, notifications, count };
}

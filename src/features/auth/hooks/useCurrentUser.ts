import { useQuery } from "@tanstack/react-query";
import { getCurrentUserProfileApi } from "@/features/identity/apiProfile";
import { STALE_TIME } from "@/shared/constants";

export function useCurrentUser() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUserProfileApi,
    staleTime: STALE_TIME.FIVE_MINUTES,
  });

  return { user, isLoading };
}

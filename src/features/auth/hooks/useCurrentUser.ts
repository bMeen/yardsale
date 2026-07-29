import { useQuery } from "@tanstack/react-query";
import { getCurrentUserProfileApi } from "@/features/identity/apiProfile";

export function useCurrentUser() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUserProfileApi,
  });

  return { user, isLoading };
}

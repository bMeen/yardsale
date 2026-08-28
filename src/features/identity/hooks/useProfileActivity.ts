import { useQuery } from "@tanstack/react-query";
import type { ProfileActivityType } from "../types";
import { getProfileActivity } from "../apiProfile";

export function useProfileActivity({
  type,
  page,
}: {
  type: ProfileActivityType;
  page: number;
}) {
  const {
    isLoading,
    data: { data: auctions, count } = { data: [], count: 0 },
  } = useQuery({
    queryKey: [`auction'${type}`, page],
    queryFn: () => getProfileActivity({ type, page }),
  });

  return { isLoading, auctions, count };
}

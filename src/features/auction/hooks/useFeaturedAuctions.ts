import { useQuery } from "@tanstack/react-query";
import { getFeaturedAuctions } from "../apiAuctions";

export function useFeaturedAuctions() {
  const {
    isLoading,
    error,
    data: featuredAuctions = [],
  } = useQuery({
    queryKey: ["featured"],
    queryFn: getFeaturedAuctions,
  });

  return { isLoading, error, featuredAuctions };
}

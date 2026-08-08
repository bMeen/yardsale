import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { getWalletActivity } from "../apiWalletActivity";

export function useWalletActivity() {
  const [searchParams] = useSearchParams();
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  const {
    isLoading,
    error,
    data: { data: transactions, count } = { data: [], count: 0 },
  } = useQuery({
    queryKey: ["wallet_activity", page],
    queryFn: () => getWalletActivity({ page }),
  });

  return { isLoading, error, transactions, count };
}

import { useQuery } from "@tanstack/react-query";
import { getWalletActivity } from "../apiWallet";

export function useWalletActivity(page: number) {
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

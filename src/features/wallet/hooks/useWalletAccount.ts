import { useQuery } from "@tanstack/react-query";
import { getWalletBalance } from "../apiWallet";
import { STALE_TIME } from "@/shared/constants";

export function useWalletAccount() {
  const {
    isLoading,
    data: accounts = [],
    error,
  } = useQuery({
    queryKey: ["wallet_accounts"],
    queryFn: getWalletBalance,
    staleTime: STALE_TIME.FIVE_MINUTES,
  });

  const available = accounts?.find(
    (account) => account.account_type === "AVAILABLE",
  );

  return { isLoading, accounts, error, available };
}

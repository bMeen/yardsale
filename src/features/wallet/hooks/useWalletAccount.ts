import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getWalletBalance, resetWalletBalance } from "../apiWallet";
import { STALE_TIME } from "@/shared/constants";
import type { PostgrestError } from "@supabase/supabase-js";
import { useToast } from "@/shared/hooks/useToast";

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

export function useWalletBalanceReset() {
  const { toastSuccess, toastError } = useToast();
  const queryClient = useQueryClient();

  const { isPending, mutate: resetWallet } = useMutation({
    mutationFn: resetWalletBalance,
    onSuccess: () => {
      toastSuccess("Success", "Wallet Reset Successful");
      queryClient.invalidateQueries({
        queryKey: ["wallet_accounts"],
      });
    },

    onError: (error: PostgrestError) => {
      toastError(error);
    },
  });

  return { isPending, resetWallet };
}

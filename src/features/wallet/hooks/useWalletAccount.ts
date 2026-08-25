import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWalletBalance,
  resetWalletBalance,
  subscribeToWallet,
} from "../apiWallet";
import { STALE_TIME } from "@/shared/constants";
import type { PostgrestError } from "@supabase/supabase-js";
import { useToast } from "@/shared/hooks/useToast";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useEffect } from "react";

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

  const { isPending, mutate: resetWallet } = useMutation({
    mutationFn: resetWalletBalance,
    onSuccess: () => {
      toastSuccess("Success", "Wallet Reset Successful");
    },

    onError: (error: PostgrestError) => {
      toastError(error);
    },
  });

  return { isPending, resetWallet };
}

export function useWalletRealtime() {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const userId = user?.profile?.id;

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToWallet(userId, queryClient);
    return unsubscribe;
  }, [userId, queryClient]);
}

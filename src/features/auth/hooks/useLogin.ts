import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../apiAuth";
import { useNavigate } from "react-router";
import type { LoginFields } from "../components/LoginForm";
import type { PostgrestError } from "@supabase/supabase-js";
import { useToast } from "@/shared/hooks/useToast";

export function useLogin() {
  const { toastError } = useToast();
  const navigate = useNavigate();

  const { mutate: login, isPending } = useMutation({
    mutationFn: ({ email, password }: LoginFields) =>
      loginApi({ email, password }),
    onSuccess: () => {
      navigate("/discover", { replace: true });
    },
    onError: (error: PostgrestError) => {
      toastError(error);
    },
  });

  return { login, isPending };
}

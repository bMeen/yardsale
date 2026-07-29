import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../apiAuth";
import type { LoginFields } from "../LoginForm";
import { useNavigate } from "react-router";
import { toast } from "@/components/ui/toast";

export function useLogin() {
  const navigate = useNavigate();

  const { mutate: login, isPending } = useMutation({
    mutationFn: ({ email, password }: LoginFields) =>
      loginApi({ email, password }),
    onSuccess: () => {
      navigate("/discover", { replace: true });
    },
    onError: (error) => {
      toast.add({
        type: "error",
        description: `${error.message}`,
      });
    },
  });

  return { login, isPending };
}

import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../apiAuth";
import { useNavigate } from "react-router";
import { toast } from "@/components/ui/toast";
import type { LoginFields } from "../components/LoginForm";

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

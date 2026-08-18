import { toast } from "@/components/ui/toast";
import { PostgrestError, type AuthError } from "@supabase/supabase-js";

export function useToast() {
  const toastSuccess = (title: string, description?: string) => {
    toast.add({
      type: "success",
      title,
      description,
    });
  };

  const toastError = (
    error: PostgrestError | AuthError,
    fallback = "Something went wrong",
  ) => {
    toast.add({
      type: "error",
      title: error.message?.replaceAll("_", " ") || fallback,
      description: "details" in error ? error.details : undefined,
    });
  };

  return {
    toastSuccess,
    toastError,
  };
}

import { useToast } from "@/shared/hooks/useToast";
import supabase from "@/shared/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router";

function Callback() {
  const { toastError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function getSession() {
      const { data: session, error } = await supabase.auth.getSession();
      if (error) {
        toastError(error);
      }

      if (!session.session) {
        navigate("/", { replace: true });
        return;
      }

      navigate("/discover", { replace: true });
    }

    getSession();
  }, [navigate, toastError]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex h-30 items-center">
        <div className="google-loader"></div>
      </div>
      <p>Google Sign in....</p>
    </div>
  );
}

export default Callback;

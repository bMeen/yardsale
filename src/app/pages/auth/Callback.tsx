import { toast } from "@/components/ui/toast";
import supabase from "@/shared/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router";

function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function getSession() {
      const { data: session, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }

      if (!session.session) {
        toast.add({
          type: "error",
          description: "Unable to sign you in.",
        });
        navigate("/", { replace: true });
        return;
      }

      navigate("/discover", { replace: true });
    }

    getSession();
  }, [navigate]);

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

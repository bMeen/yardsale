import supabase from "@/shared/supabase/client";
import { getCurrentUserApi } from "../auth/apiAuth";

export async function getCurrentUserProfileApi() {
  const user = await getCurrentUserApi();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw new Error(error.message);

  return { isAuthenticated: user?.role === "authenticated", profile };
}

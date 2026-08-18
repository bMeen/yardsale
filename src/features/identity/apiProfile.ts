import supabase from "@/shared/supabase/client";
import { getCurrentUserApi } from "../auth/apiAuth";
import type { UpdateProfile } from "./types";

export async function getCurrentUserProfileApi() {
  const user = await getCurrentUserApi();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;

  return { isAuthenticated: user?.role === "authenticated", profile };
}

export async function updateProfile(payload: UpdateProfile) {
  const { error } = await supabase.rpc("update_profile", payload);

  if (error) throw error;
}

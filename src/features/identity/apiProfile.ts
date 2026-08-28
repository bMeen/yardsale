import supabase from "@/shared/supabase/client";
import { getCurrentUserApi } from "../auth/apiAuth";
import {
  RPC_BY_PROFILE_ACTIVITY,
  type ProfileActivityType,
  type UpdateProfile,
} from "./types";
import type { FullAuction } from "../auction/types";

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

export async function getProfileActivity({
  type,
  page,
}: {
  type: ProfileActivityType;
  page: number;
}) {
  const { data, error } = await supabase.rpc(RPC_BY_PROFILE_ACTIVITY[type], {
    p_page: page,
  });

  if (error) throw error;

  return {
    data: data
      ? data.map((row) => row.auction as unknown as FullAuction)
      : null,
    count: data?.[0]?.total_count ?? 0,
  };
}

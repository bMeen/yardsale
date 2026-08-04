import supabase from "@/shared/supabase/client";
import { getCurrentUserApi } from "../auth/apiAuth";
import type { Notification } from "./types";
import { getRange } from "@/lib/utils";

export async function getNotificationApi(page = 1) {
  const { from, to } = getRange(page);

  const user = await getCurrentUserApi();
  if (!user) throw new Error("Not authenticated");

  const { data, error, count } = await supabase
    .from("notifications")
    .select("*", {
      count: "exact",
    })
    .eq("profile_id", user.id)
    .order("created_at", { ascending: true })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { data: data as Notification[] | null, count };
}

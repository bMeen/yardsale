import supabase from "@/shared/supabase/client";
import type { Notification } from "./types";
import { getRange } from "@/lib/utils";

export async function getNotificationApi({
  page,
  user_id,
}: {
  page: number;
  user_id?: string;
}) {
  const { from, to } = getRange(page);
  if (!user_id) throw new Error("Not authenticated");

  const { data, error, count } = await supabase
    .from("notifications")
    .select("*", {
      count: "exact",
    })
    .eq("profile_id", user_id)
    .order("created_at", { ascending: true })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { data: data as Notification[] | null, count };
}

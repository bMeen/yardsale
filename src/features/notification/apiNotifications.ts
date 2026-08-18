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

  if (error) throw error;
  return { data: data as Notification[] | null, count };
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.rpc("mark_notification_read", {
    p_notification_id: id,
  });

  if (error) throw error;
}

export async function markAllNotificationsRead() {
  const { error } = await supabase.rpc("mark_all_notifications_read");

  if (error) throw error;
}

import type { Database } from "@/shared/supabase/database.types";
import type { RPC } from "../auction/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type UpdateProfile =
  Database["public"]["Functions"]["update_profile"]["Args"];

export type ProfileActivityType = "won" | "sold";

export const RPC_BY_PROFILE_ACTIVITY = {
  sold: "get_sold_auctions",
  won: "get_won_auctions",
} as const satisfies Record<ProfileActivityType, RPC>;

export const EMPTY_PROFILE_ACTIVITY: Record<
  ProfileActivityType,
  { title: string; description: string }
> = {
  won: {
    title: "No auctions won yet",
    description: "Auctions you win will appear here.",
  },
  sold: {
    title: "No items sold yet",
    description: "Your successfully sold auctions will appear here.",
  },
};

import type { Database } from "@/shared/supabase/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type UpdateProfile =
  Database["public"]["Functions"]["update_profile"]["Args"];

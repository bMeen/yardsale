import type { Database } from "@/shared/supabase/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

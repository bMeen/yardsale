export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action_type: Database["public"]["Enums"]["admin_action_type"]
          admin_profile_id: string
          created_at: string
          id: string
          reason: string | null
          reference_id: string | null
          reference_type: Database["public"]["Enums"]["reference_type"]
        }
        Insert: {
          action_type: Database["public"]["Enums"]["admin_action_type"]
          admin_profile_id: string
          created_at?: string
          id?: string
          reason?: string | null
          reference_id?: string | null
          reference_type: Database["public"]["Enums"]["reference_type"]
        }
        Update: {
          action_type?: Database["public"]["Enums"]["admin_action_type"]
          admin_profile_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          reference_id?: string | null
          reference_type?: Database["public"]["Enums"]["reference_type"]
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_admin_profile_id_fkey"
            columns: ["admin_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_config: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      auction_images: {
        Row: {
          auction_id: string
          created_at: string
          display_order: number
          id: string
          storage_path: string
        }
        Insert: {
          auction_id: string
          created_at?: string
          display_order: number
          id?: string
          storage_path: string
        }
        Update: {
          auction_id?: string
          created_at?: string
          display_order?: number
          id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_images_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      auctions: {
        Row: {
          bid_count: number
          category: Database["public"]["Enums"]["auction_category"]
          created_at: string
          current_price: number
          description: string
          ending_soon_notified: boolean
          ends_at: string
          highest_bid_id: string | null
          id: string
          seller_id: string
          settled_at: string | null
          starting_price: number
          starts_at: string
          status: Database["public"]["Enums"]["auction_status"]
          title: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          bid_count?: number
          category: Database["public"]["Enums"]["auction_category"]
          created_at?: string
          current_price: number
          description: string
          ending_soon_notified?: boolean
          ends_at: string
          highest_bid_id?: string | null
          id?: string
          seller_id: string
          settled_at?: string | null
          starting_price: number
          starts_at: string
          status?: Database["public"]["Enums"]["auction_status"]
          title: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          bid_count?: number
          category?: Database["public"]["Enums"]["auction_category"]
          created_at?: string
          current_price?: number
          description?: string
          ending_soon_notified?: boolean
          ends_at?: string
          highest_bid_id?: string | null
          id?: string
          seller_id?: string
          settled_at?: string | null
          starting_price?: number
          starts_at?: string
          status?: Database["public"]["Enums"]["auction_status"]
          title?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auctions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auctions_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_auctions_highest_bid"
            columns: ["highest_bid_id"]
            isOneToOne: false
            referencedRelation: "bids"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          amount: number
          auction_id: string
          bidder_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["bid_status"]
        }
        Insert: {
          amount: number
          auction_id: string
          bidder_id: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["bid_status"]
        }
        Update: {
          amount?: number
          auction_id?: string
          bidder_id?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["bid_status"]
        }
        Relationships: [
          {
            foreignKeyName: "bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_bidder_id_fkey"
            columns: ["bidder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      keepalive_test: {
        Row: {
          id: number
          message: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          message?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          message?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          profile_id: string
          read_at: string | null
          reference_id: string | null
          reference_type: Database["public"]["Enums"]["reference_type"] | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          profile_id: string
          read_at?: string | null
          reference_id?: string | null
          reference_type?: Database["public"]["Enums"]["reference_type"] | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          profile_id?: string
          read_at?: string | null
          reference_id?: string | null
          reference_type?: Database["public"]["Enums"]["reference_type"] | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          sold_count: number
          status: Database["public"]["Enums"]["profile_status"]
          updated_at: string
          username: string
          won_count: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          sold_count?: number
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
          username: string
          won_count?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          sold_count?: number
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
          username?: string
          won_count?: number
        }
        Relationships: []
      }
      wallet_accounts: {
        Row: {
          account_type: Database["public"]["Enums"]["wallet_account_type"]
          balance: number
          created_at: string
          id: string
          profile_id: string | null
          updated_at: string
        }
        Insert: {
          account_type: Database["public"]["Enums"]["wallet_account_type"]
          balance?: number
          created_at?: string
          id?: string
          profile_id?: string | null
          updated_at?: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["wallet_account_type"]
          balance?: number
          created_at?: string
          id?: string
          profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_accounts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_entries: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          entry_type: Database["public"]["Enums"]["wallet_entry_type"]
          from_account_id: string
          id: string
          reference_id: string
          reference_type: Database["public"]["Enums"]["reference_type"]
          to_account_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          entry_type: Database["public"]["Enums"]["wallet_entry_type"]
          from_account_id: string
          id?: string
          reference_id: string
          reference_type: Database["public"]["Enums"]["reference_type"]
          to_account_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          entry_type?: Database["public"]["Enums"]["wallet_entry_type"]
          from_account_id?: string
          id?: string
          reference_id?: string
          reference_type?: Database["public"]["Enums"]["reference_type"]
          to_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_entries_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "wallet_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_entries_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "wallet_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlists: {
        Row: {
          auction_id: string
          created_at: string
          id: string
          profile_id: string
        }
        Insert: {
          auction_id: string
          created_at?: string
          id?: string
          profile_id: string
        }
        Update: {
          auction_id?: string
          created_at?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlists_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watchlists_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_auction: { Args: { p_auction_id: string }; Returns: undefined }
      admin_cancel_auction: {
        Args: { p_auction_id: string; p_reason: string }
        Returns: undefined
      }
      admin_create_system_auction: {
        Args: {
          p_auction_id?: string
          p_category: Database["public"]["Enums"]["auction_category"]
          p_description: string
          p_ends_at: string
          p_image_storage_paths?: string[]
          p_starting_price: number
          p_starts_at: string
          p_title: string
        }
        Returns: string
      }
      admin_set_user_status: {
        Args: {
          p_new_status: Database["public"]["Enums"]["profile_status"]
          p_reason?: string
          p_target_profile_id: string
        }
        Returns: undefined
      }
      assert_profile_active: {
        Args: { p_profile_id: string }
        Returns: undefined
      }
      assert_wallet_balance: {
        Args: { p_account_id: string; p_amount: number }
        Returns: undefined
      }
      calculate_settlement_fee: {
        Args: { p_winning_bid_kobo: number }
        Returns: number
      }
      cancel_auction: {
        Args: { p_auction_id: string; p_reason?: string }
        Returns: undefined
      }
      cancel_bid: { Args: { p_bid_id: string }; Returns: undefined }
      close_auction: { Args: { p_auction_id: string }; Returns: undefined }
      create_auction: {
        Args: {
          p_auction_id?: string
          p_category: Database["public"]["Enums"]["auction_category"]
          p_description: string
          p_ends_at: string
          p_image_storage_paths?: string[]
          p_starting_price: number
          p_starts_at: string
          p_title: string
        }
        Returns: string
      }
      create_bid_record: {
        Args: { p_amount: number; p_auction_id: string; p_bidder_id: string }
        Returns: {
          amount: number
          auction_id: string
          bidder_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["bid_status"]
        }
        SetofOptions: {
          from: "*"
          to: "bids"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_notification: {
        Args: {
          p_message: string
          p_profile_id: string
          p_reference_id?: string
          p_reference_type?: Database["public"]["Enums"]["reference_type"]
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
        }
        Returns: string
      }
      default_wallet_balance_kobo: { Args: never; Returns: number }
      determine_initial_auction_status: {
        Args: { p_starts_at: string }
        Returns: Database["public"]["Enums"]["auction_status"]
      }
      find_next_highest_bid: {
        Args: { p_auction_id: string }
        Returns: {
          amount: number
          auction_id: string
          bidder_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["bid_status"]
        }
        SetofOptions: {
          from: "*"
          to: "bids"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      format_naira: { Args: { p_amount_kobo: number }; Returns: string }
      get_admin_dashboard_stats: { Args: never; Returns: Json }
      get_all_auctions: {
        Args: {
          p_category?: Database["public"]["Enums"]["auction_category"]
          p_limit?: number
          p_page?: number
          p_search?: string
          p_status?: Database["public"]["Enums"]["auction_status"]
        }
        Returns: {
          auction: Json
          total_count: number
        }[]
      }
      get_auction_bids: {
        Args: { p_auction_id: string; p_limit?: number; p_page?: number }
        Returns: {
          amount: number
          bidder: Json
          created_at: string
          id: string
          status: Database["public"]["Enums"]["bid_status"]
          total_count: number
        }[]
      }
      get_auction_detail: { Args: { p_auction_id: string }; Returns: Json }
      get_my_auctions: {
        Args: {
          p_category?: Database["public"]["Enums"]["auction_category"]
          p_limit?: number
          p_page?: number
          p_search?: string
          p_status?: Database["public"]["Enums"]["auction_status"]
        }
        Returns: {
          auction: Json
          total_count: number
        }[]
      }
      get_participating_auctions: {
        Args: {
          p_category?: Database["public"]["Enums"]["auction_category"]
          p_limit?: number
          p_page?: number
          p_search?: string
          p_status?: Database["public"]["Enums"]["auction_status"]
        }
        Returns: {
          auction: Json
          total_count: number
        }[]
      }
      get_platform_account_id: { Args: never; Returns: string }
      get_sold_auctions: {
        Args: {
          p_category?: Database["public"]["Enums"]["auction_category"]
          p_limit?: number
          p_page?: number
          p_search?: string
        }
        Returns: {
          auction: Json
          total_count: number
        }[]
      }
      get_system_account_id: { Args: never; Returns: string }
      get_wallet_activity: {
        Args: { p_limit?: number; p_page?: number }
        Returns: {
          amount: number
          created_at: string
          description: string
          direction: string
          entry_type: Database["public"]["Enums"]["wallet_entry_type"]
          id: string
          reference_type: Database["public"]["Enums"]["reference_type"]
          total_count: number
        }[]
      }
      get_wallet_summary: { Args: never; Returns: Json }
      get_watchlist_auctions: {
        Args: {
          p_category?: Database["public"]["Enums"]["auction_category"]
          p_limit?: number
          p_page?: number
          p_search?: string
        }
        Returns: {
          auction: Json
          total_count: number
        }[]
      }
      get_won_auctions: {
        Args: {
          p_category?: Database["public"]["Enums"]["auction_category"]
          p_limit?: number
          p_page?: number
          p_search?: string
        }
        Returns: {
          auction: Json
          total_count: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_profile_admin: { Args: { p_profile_id: string }; Returns: boolean }
      list_stale_temp_uploads: {
        Args: never
        Returns: {
          storage_path: string
        }[]
      }
      listing_fee_kobo: { Args: never; Returns: number }
      lock_auction: {
        Args: { p_auction_id: string }
        Returns: {
          bid_count: number
          category: Database["public"]["Enums"]["auction_category"]
          created_at: string
          current_price: number
          description: string
          ending_soon_notified: boolean
          ends_at: string
          highest_bid_id: string | null
          id: string
          seller_id: string
          settled_at: string | null
          starting_price: number
          starts_at: string
          status: Database["public"]["Enums"]["auction_status"]
          title: string
          updated_at: string
          winner_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "auctions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      mark_all_notifications_read: { Args: never; Returns: undefined }
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: undefined
      }
      minimum_auction_duration: { Args: never; Returns: string }
      minimum_bid_increment_kobo: { Args: never; Returns: number }
      platform_fee_rate: { Args: never; Returns: number }
      process_due_auctions: { Args: never; Returns: undefined }
      raise_business_error: {
        Args: { p_code: string; p_detail?: string }
        Returns: undefined
      }
      record_wallet_entry: {
        Args: {
          p_amount: number
          p_description?: string
          p_entry_type: Database["public"]["Enums"]["wallet_entry_type"]
          p_from_account_id: string
          p_reference_id: string
          p_reference_type: Database["public"]["Enums"]["reference_type"]
          p_to_account_id: string
        }
        Returns: string
      }
      reset_wallet: { Args: never; Returns: undefined }
      send_watchlist_reminders: { Args: never; Returns: undefined }
      settle_auction: { Args: { p_auction_id: string }; Returns: undefined }
      submit_bid: {
        Args: { p_amount: number; p_auction_id: string }
        Returns: string
      }
      toggle_watchlist: { Args: { p_auction_id: string }; Returns: boolean }
      update_auction: {
        Args: {
          p_auction_id: string
          p_category?: Database["public"]["Enums"]["auction_category"]
          p_description?: string
          p_ends_at?: string
          p_starting_price?: number
          p_starts_at?: string
          p_title?: string
        }
        Returns: undefined
      }
      update_auction_leader: {
        Args: { p_auction_id: string }
        Returns: undefined
      }
      update_profile: {
        Args: {
          p_avatar_url?: string
          p_full_name?: string
          p_username?: string
        }
        Returns: undefined
      }
      validate_auction_state: {
        Args: { p_auction: Database["public"]["Tables"]["auctions"]["Row"] }
        Returns: undefined
      }
      validate_bid_amount: {
        Args: {
          p_amount: number
          p_auction: Database["public"]["Tables"]["auctions"]["Row"]
          p_bidder_id: string
        }
        Returns: undefined
      }
      wallet_reset_threshold_kobo: { Args: never; Returns: number }
      write_audit_log: {
        Args: {
          p_action_type: Database["public"]["Enums"]["admin_action_type"]
          p_admin_profile_id: string
          p_reason?: string
          p_reference_id?: string
          p_reference_type: Database["public"]["Enums"]["reference_type"]
        }
        Returns: string
      }
    }
    Enums: {
      admin_action_type:
        | "USER_SUSPENDED"
        | "USER_DEACTIVATED"
        | "AUCTION_CANCELLED"
        | "SYSTEM_AUCTION_CREATED"
        | "WALLET_RESET_TRIGGERED"
        | "USER_REACTIVATED"
      auction_category:
        | "ELECTRONICS"
        | "PHONES_TABLETS"
        | "COMPUTERS"
        | "HOME_APPLIANCES"
        | "FURNITURE"
        | "FASHION"
        | "BOOKS"
        | "SPORTS"
        | "TOYS"
        | "AUTOMOTIVE"
        | "OTHERS"
      auction_status: "SCHEDULED" | "ACTIVE" | "ENDED" | "SETTLED" | "CANCELLED"
      bid_status: "ACTIVE" | "CANCELLED"
      notification_type:
        | "AUCTION_STARTED"
        | "AUCTION_ENDED"
        | "OUTBID"
        | "BID_CANCELLED"
        | "AUCTION_WON"
        | "AUCTION_LOST"
        | "PAYMENT_RECEIVED"
        | "WALLET_RESET"
        | "AUCTION_ENDING_SOON"
        | "ADMIN_CANCELLED_AUCTION"
        | "ACCOUNT_SUSPENDED"
        | "ACCOUNT_REACTIVATED"
        | "ACCOUNT_DEACTIVATED"
        | "SELLER_CANCELLED_AUCTION"
        | "AUCTION_TIME_CHANGED"
      profile_status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED"
      reference_type: "USER" | "AUCTION" | "BID" | "WALLET" | "SYSTEM"
      user_role: "USER" | "ADMIN"
      wallet_account_type: "AVAILABLE" | "RESERVED" | "PLATFORM" | "SYSTEM"
      wallet_entry_type:
        | "LISTING_FEE"
        | "BID_RESERVATION"
        | "BID_RELEASE"
        | "SETTLEMENT"
        | "SETTLEMENT_FEE"
        | "WALLET_RESET"
        | "INITIAL_CREDIT"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      admin_action_type: [
        "USER_SUSPENDED",
        "USER_DEACTIVATED",
        "AUCTION_CANCELLED",
        "SYSTEM_AUCTION_CREATED",
        "WALLET_RESET_TRIGGERED",
        "USER_REACTIVATED",
      ],
      auction_category: [
        "ELECTRONICS",
        "PHONES_TABLETS",
        "COMPUTERS",
        "HOME_APPLIANCES",
        "FURNITURE",
        "FASHION",
        "BOOKS",
        "SPORTS",
        "TOYS",
        "AUTOMOTIVE",
        "OTHERS",
      ],
      auction_status: ["SCHEDULED", "ACTIVE", "ENDED", "SETTLED", "CANCELLED"],
      bid_status: ["ACTIVE", "CANCELLED"],
      notification_type: [
        "AUCTION_STARTED",
        "AUCTION_ENDED",
        "OUTBID",
        "BID_CANCELLED",
        "AUCTION_WON",
        "AUCTION_LOST",
        "PAYMENT_RECEIVED",
        "WALLET_RESET",
        "AUCTION_ENDING_SOON",
        "ADMIN_CANCELLED_AUCTION",
        "ACCOUNT_SUSPENDED",
        "ACCOUNT_REACTIVATED",
        "ACCOUNT_DEACTIVATED",
        "SELLER_CANCELLED_AUCTION",
        "AUCTION_TIME_CHANGED",
      ],
      profile_status: ["ACTIVE", "SUSPENDED", "DEACTIVATED"],
      reference_type: ["USER", "AUCTION", "BID", "WALLET", "SYSTEM"],
      user_role: ["USER", "ADMIN"],
      wallet_account_type: ["AVAILABLE", "RESERVED", "PLATFORM", "SYSTEM"],
      wallet_entry_type: [
        "LISTING_FEE",
        "BID_RESERVATION",
        "BID_RELEASE",
        "SETTLEMENT",
        "SETTLEMENT_FEE",
        "WALLET_RESET",
        "INITIAL_CREDIT",
      ],
    },
  },
} as const

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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_events_import: {
        Row: {
          admin_notes: string | null
          event_id: string
          id: string
          import_date: string | null
          source: string | null
        }
        Insert: {
          admin_notes?: string | null
          event_id: string
          id?: string
          import_date?: string | null
          source?: string | null
        }
        Update: {
          admin_notes?: string | null
          event_id?: string
          id?: string
          import_date?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_events_import_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "active_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_events_import_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_snapshots: {
        Row: {
          benchmark: Json | null
          created_at: string | null
          entity_id: string
          entity_type: string | null
          id: string
          metrics: Json
          period_type: string | null
        }
        Insert: {
          benchmark?: Json | null
          created_at?: string | null
          entity_id: string
          entity_type?: string | null
          id?: string
          metrics: Json
          period_type?: string | null
        }
        Update: {
          benchmark?: Json | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string | null
          id?: string
          metrics?: Json
          period_type?: string | null
        }
        Relationships: []
      }
      business_configs: {
        Row: {
          brand_color: string
          client_name: string
          client_type: string
          created_at: string
          features: string[]
          id: string
          location: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_color?: string
          client_name: string
          client_type: string
          created_at?: string
          features?: string[]
          id?: string
          location: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_color?: string
          client_name?: string
          client_type?: string
          created_at?: string
          features?: string[]
          id?: string
          location?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      business_events: {
        Row: {
          actual_participants: number | null
          ambiance_photo_url: string | null
          avg_attendance: number | null
          avg_booking_advance: number | null
          capacity: number | null
          category: string
          category_rank: number | null
          created_at: string
          custom_venue: string | null
          date: string
          description: string | null
          event_type: string
          external_url: string | null
          id: string
          image_url: string | null
          is_recurring: boolean
          last_minute_ratio: number | null
          likes: number
          no_show_rate: number | null
          participants: number
          peak_views_time: string | null
          performance_score: number | null
          price: string | null
          time: string
          title: string
          total_editions: number | null
          updated_at: string
          user_id: string
          venue: string | null
          venue_photo_url: string | null
          views: number
        }
        Insert: {
          actual_participants?: number | null
          ambiance_photo_url?: string | null
          avg_attendance?: number | null
          avg_booking_advance?: number | null
          capacity?: number | null
          category: string
          category_rank?: number | null
          created_at?: string
          custom_venue?: string | null
          date: string
          description?: string | null
          event_type: string
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_recurring?: boolean
          last_minute_ratio?: number | null
          likes?: number
          no_show_rate?: number | null
          participants?: number
          peak_views_time?: string | null
          performance_score?: number | null
          price?: string | null
          time: string
          title: string
          total_editions?: number | null
          updated_at?: string
          user_id: string
          venue?: string | null
          venue_photo_url?: string | null
          views?: number
        }
        Update: {
          actual_participants?: number | null
          ambiance_photo_url?: string | null
          avg_attendance?: number | null
          avg_booking_advance?: number | null
          capacity?: number | null
          category?: string
          category_rank?: number | null
          created_at?: string
          custom_venue?: string | null
          date?: string
          description?: string | null
          event_type?: string
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_recurring?: boolean
          last_minute_ratio?: number | null
          likes?: number
          no_show_rate?: number | null
          participants?: number
          peak_views_time?: string | null
          performance_score?: number | null
          price?: string | null
          time?: string
          title?: string
          total_editions?: number | null
          updated_at?: string
          user_id?: string
          venue?: string | null
          venue_photo_url?: string | null
          views?: number
        }
        Relationships: []
      }
      event_likes: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      event_participants: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          actual_participants: number | null
          address: string | null
          archived_at: string | null
          category: Database["public"]["Enums"]["event_category"]
          created_at: string | null
          created_by: string
          created_by_type: Database["public"]["Enums"]["event_creator_type"]
          date: string
          description: string | null
          end_date: string | null
          end_time: string | null
          external_url: string | null
          id: string
          image_url: string | null
          likes: number | null
          location: string
          max_participants: number | null
          no_show_count: number | null
          participants: number | null
          price: number | null
          scraped_at: string | null
          search_appearances: number | null
          status: string | null
          submitter_email: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          validated_at: string | null
          validated_by: string | null
          views: number | null
        }
        Insert: {
          actual_participants?: number | null
          address?: string | null
          archived_at?: string | null
          category: Database["public"]["Enums"]["event_category"]
          created_at?: string | null
          created_by: string
          created_by_type?: Database["public"]["Enums"]["event_creator_type"]
          date: string
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          likes?: number | null
          location: string
          max_participants?: number | null
          no_show_count?: number | null
          participants?: number | null
          price?: number | null
          scraped_at?: string | null
          search_appearances?: number | null
          status?: string | null
          submitter_email?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
          views?: number | null
        }
        Update: {
          actual_participants?: number | null
          address?: string | null
          archived_at?: string | null
          category?: Database["public"]["Enums"]["event_category"]
          created_at?: string | null
          created_by?: string
          created_by_type?: Database["public"]["Enums"]["event_creator_type"]
          date?: string
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          likes?: number | null
          location?: string
          max_participants?: number | null
          no_show_count?: number | null
          participants?: number | null
          price?: number | null
          scraped_at?: string | null
          search_appearances?: number | null
          status?: string | null
          submitter_email?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          accepted_at: string | null
          created_at: string
          friend_id: string
          id: string
          requested_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          friend_id: string
          id?: string
          requested_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          friend_id?: string
          id?: string
          requested_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          id: string
          phone: string | null
          type: Database["public"]["Enums"]["user_type"]
          updated_at: string | null
          username: string
          website: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          id: string
          phone?: string | null
          type?: Database["public"]["Enums"]["user_type"]
          updated_at?: string | null
          username: string
          website?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          phone?: string | null
          type?: Database["public"]["Enums"]["user_type"]
          updated_at?: string | null
          username?: string
          website?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      active_events: {
        Row: {
          actual_participants: number | null
          address: string | null
          archived_at: string | null
          category: Database["public"]["Enums"]["event_category"] | null
          created_at: string | null
          created_by: string | null
          created_by_type:
            | Database["public"]["Enums"]["event_creator_type"]
            | null
          date: string | null
          description: string | null
          end_date: string | null
          end_time: string | null
          external_url: string | null
          id: string | null
          image_url: string | null
          likes: number | null
          location: string | null
          max_participants: number | null
          no_show_count: number | null
          participants: number | null
          price: number | null
          search_appearances: number | null
          status: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          views: number | null
        }
        Insert: {
          actual_participants?: number | null
          address?: string | null
          archived_at?: string | null
          category?: Database["public"]["Enums"]["event_category"] | null
          created_at?: string | null
          created_by?: string | null
          created_by_type?:
            | Database["public"]["Enums"]["event_creator_type"]
            | null
          date?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          external_url?: string | null
          id?: string | null
          image_url?: string | null
          likes?: number | null
          location?: string | null
          max_participants?: number | null
          no_show_count?: number | null
          participants?: number | null
          price?: number | null
          search_appearances?: number | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          actual_participants?: number | null
          address?: string | null
          archived_at?: string | null
          category?: Database["public"]["Enums"]["event_category"] | null
          created_at?: string | null
          created_by?: string | null
          created_by_type?:
            | Database["public"]["Enums"]["event_creator_type"]
            | null
          date?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          external_url?: string | null
          id?: string | null
          image_url?: string | null
          likes?: number | null
          location?: string | null
          max_participants?: number | null
          no_show_count?: number | null
          participants?: number | null
          price?: number | null
          search_appearances?: number | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      public_events: {
        Row: {
          ambiance_photo_url: string | null
          capacity: number | null
          category: string | null
          custom_venue: string | null
          date: string | null
          description: string | null
          event_type: string | null
          id: string | null
          image_url: string | null
          is_recurring: boolean | null
          likes: number | null
          participants: number | null
          price: string | null
          time: string | null
          title: string | null
          venue: string | null
          venue_photo_url: string | null
          views: number | null
        }
        Insert: {
          ambiance_photo_url?: string | null
          capacity?: number | null
          category?: string | null
          custom_venue?: string | null
          date?: string | null
          description?: string | null
          event_type?: string | null
          id?: string | null
          image_url?: string | null
          is_recurring?: boolean | null
          likes?: number | null
          participants?: number | null
          price?: string | null
          time?: string | null
          title?: string | null
          venue?: string | null
          venue_photo_url?: string | null
          views?: number | null
        }
        Update: {
          ambiance_photo_url?: string | null
          capacity?: number | null
          category?: string | null
          custom_venue?: string | null
          date?: string | null
          description?: string | null
          event_type?: string | null
          id?: string | null
          image_url?: string | null
          is_recurring?: boolean | null
          likes?: number | null
          participants?: number | null
          price?: string | null
          time?: string | null
          title?: string | null
          venue?: string | null
          venue_photo_url?: string | null
          views?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      approve_pending_event: {
        Args: { p_event_id: string }
        Returns: undefined
      }
      archive_past_events: { Args: never; Returns: undefined }
      get_public_business_info: {
        Args: never
        Returns: {
          avatar_url: string
          bio: string
          city: string
          id: string
          username: string
        }[]
      }
      get_user_display_info: {
        Args: { user_ids: string[] }
        Returns: {
          avatar_url: string
          id: string
          username: string
        }[]
      }
      get_user_stats: {
        Args: { user_uuid: string }
        Returns: {
          events_created: number
          events_liked: number
          events_participated: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_event_views: {
        Args: { p_event_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_user: { Args: never; Returns: boolean }
      is_business_user: { Args: never; Returns: boolean }
      propose_event_public: {
        Args: {
          p_address: string
          p_category: Database["public"]["Enums"]["event_category"]
          p_date: string
          p_description: string
          p_external_url?: string
          p_location: string
          p_price?: number
          p_submitter_email?: string
          p_title: string
        }
        Returns: string
      }
      reject_pending_event: { Args: { p_event_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      event_category: "a-boire" | "a-manger" | "soirees" | "activites"
      event_creator_type: "user" | "business" | "admin"
      participant_status: "going" | "interested"
      user_type: "user" | "business" | "admin"
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
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      event_category: ["a-boire", "a-manger", "soirees", "activites"],
      event_creator_type: ["user", "business", "admin"],
      participant_status: ["going", "interested"],
      user_type: ["user", "business", "admin"],
    },
  },
} as const

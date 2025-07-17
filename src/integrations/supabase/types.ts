export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
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
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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
          category: string
          created_at: string
          custom_venue: string | null
          date: string
          description: string | null
          event_type: string
          external_url: string | null
          id: string
          image_url: string | null
          likes: number
          participants: number
          price: string | null
          time: string
          title: string
          updated_at: string
          user_id: string
          venue: string | null
          views: number
        }
        Insert: {
          category: string
          created_at?: string
          custom_venue?: string | null
          date: string
          description?: string | null
          event_type: string
          external_url?: string | null
          id?: string
          image_url?: string | null
          likes?: number
          participants?: number
          price?: string | null
          time: string
          title: string
          updated_at?: string
          user_id: string
          venue?: string | null
          views?: number
        }
        Update: {
          category?: string
          created_at?: string
          custom_venue?: string | null
          date?: string
          description?: string | null
          event_type?: string
          external_url?: string | null
          id?: string
          image_url?: string | null
          likes?: number
          participants?: number
          price?: string | null
          time?: string
          title?: string
          updated_at?: string
          user_id?: string
          venue?: string | null
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
          address: string | null
          category: Database["public"]["Enums"]["event_category"]
          created_at: string | null
          created_by: string
          created_by_type: Database["public"]["Enums"]["event_creator_type"]
          date: string
          description: string | null
          end_date: string | null
          external_url: string | null
          id: string
          image_url: string | null
          likes: number | null
          location: string
          max_participants: number | null
          participants: number | null
          price: number | null
          search_appearances: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          address?: string | null
          category: Database["public"]["Enums"]["event_category"]
          created_at?: string | null
          created_by: string
          created_by_type?: Database["public"]["Enums"]["event_creator_type"]
          date: string
          description?: string | null
          end_date?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          likes?: number | null
          location: string
          max_participants?: number | null
          participants?: number | null
          price?: number | null
          search_appearances?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          address?: string | null
          category?: Database["public"]["Enums"]["event_category"]
          created_at?: string | null
          created_by?: string
          created_by_type?: Database["public"]["Enums"]["event_creator_type"]
          date?: string
          description?: string | null
          end_date?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          likes?: number | null
          location?: string
          max_participants?: number | null
          participants?: number | null
          price?: number | null
          search_appearances?: number | null
          tags?: string[] | null
          title?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_stats: {
        Args: { user_uuid: string }
        Returns: {
          events_liked: number
          events_participated: number
          events_created: number
        }[]
      }
      increment_event_views: {
        Args: { event_id: number }
        Returns: undefined
      }
      is_business_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      event_category: "a-boire" | "a-manger" | "soirees" | "activites"
      event_creator_type: "user" | "business" | "admin"
      participant_status: "going" | "interested"
      user_type: "user" | "business"
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
      event_category: ["a-boire", "a-manger", "soirees", "activites"],
      event_creator_type: ["user", "business", "admin"],
      participant_status: ["going", "interested"],
      user_type: ["user", "business"],
    },
  },
} as const

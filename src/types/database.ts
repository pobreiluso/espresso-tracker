export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      bags: {
        Row: {
          coffee_id: string
          created_at: string | null
          finish_date: string | null
          id: string
          open_date: string | null
          photo_url: string | null
          price: number | null
          purchase_location: string | null
          roast_date: string
          size_g: number
          user_id: string
        }
        Insert: {
          coffee_id: string
          created_at?: string | null
          finish_date?: string | null
          id?: string
          open_date?: string | null
          photo_url?: string | null
          price?: number | null
          purchase_location?: string | null
          roast_date: string
          size_g: number
          user_id: string
        }
        Update: {
          coffee_id?: string
          created_at?: string | null
          finish_date?: string | null
          id?: string
          open_date?: string | null
          photo_url?: string | null
          price?: number | null
          purchase_location?: string | null
          roast_date?: string
          size_g?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bags_coffee_id_fkey"
            columns: ["coffee_id"]
            isOneToOne: false
            referencedRelation: "coffees"
            referencedColumns: ["id"]
          },
        ]
      }
      brews: {
        Row: {
          ai_analysis: Json | null
          analysis_timestamp: string | null
          bag_id: string
          brew_date: string | null
          brewing_method_detected: string | null
          confidence_score: number | null
          created_at: string | null
          dose_g: number
          dose_grams: number | null
          estimated_volume_ml: number | null
          extraction_quality: string | null
          extraction_time_seconds: number | null
          flavor_tags: string[] | null
          grind_setting: string
          has_ai_analysis: boolean | null
          has_photo: boolean | null
          id: string
          method: string
          notes: string | null
          photo_url: string | null
          rating: number
          ratio: number | null
          time_s: number
          user_id: string
          visual_score: number | null
          water_temp_c: number | null
          water_temp_celsius: number | null
          yield_g: number
          yield_grams: number | null
        }
        Insert: {
          ai_analysis?: Json | null
          analysis_timestamp?: string | null
          bag_id: string
          brew_date?: string | null
          brewing_method_detected?: string | null
          confidence_score?: number | null
          created_at?: string | null
          dose_g: number
          dose_grams?: number | null
          estimated_volume_ml?: number | null
          extraction_quality?: string | null
          extraction_time_seconds?: number | null
          flavor_tags?: string[] | null
          grind_setting: string
          has_ai_analysis?: boolean | null
          has_photo?: boolean | null
          id?: string
          method: string
          notes?: string | null
          photo_url?: string | null
          rating: number
          ratio?: number | null
          time_s: number
          user_id: string
          visual_score?: number | null
          water_temp_c?: number | null
          water_temp_celsius?: number | null
          yield_g: number
          yield_grams?: number | null
        }
        Update: {
          ai_analysis?: Json | null
          analysis_timestamp?: string | null
          bag_id?: string
          brew_date?: string | null
          brewing_method_detected?: string | null
          confidence_score?: number | null
          created_at?: string | null
          dose_g?: number
          dose_grams?: number | null
          estimated_volume_ml?: number | null
          extraction_quality?: string | null
          extraction_time_seconds?: number | null
          flavor_tags?: string[] | null
          grind_setting?: string
          has_ai_analysis?: boolean | null
          has_photo?: boolean | null
          id?: string
          method?: string
          notes?: string | null
          photo_url?: string | null
          rating?: number
          ratio?: number | null
          time_s?: number
          user_id?: string
          visual_score?: number | null
          water_temp_c?: number | null
          water_temp_celsius?: number | null
          yield_g?: number
          yield_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "brews_bag_id_fkey"
            columns: ["bag_id"]
            isOneToOne: false
            referencedRelation: "bags"
            referencedColumns: ["id"]
          },
        ]
      }
      coffees: {
        Row: {
          altitude: number | null
          altitude_range: string | null
          certification: string | null
          coffee_story: string | null
          cooperative: string | null
          created_at: string | null
          cupping_score: number | null
          farm: string | null
          flavor_profile: Json | null
          harvest_season: string | null
          id: string
          name: string
          origin_country: string | null
          process: string | null
          process_details: string | null
          producer: string | null
          region: string | null
          roaster_id: string
          subregion: string | null
          tasting_notes: string | null
          user_id: string | null
          variety: string | null
          variety_details: string | null
        }
        Insert: {
          altitude?: number | null
          altitude_range?: string | null
          certification?: string | null
          coffee_story?: string | null
          cooperative?: string | null
          created_at?: string | null
          cupping_score?: number | null
          farm?: string | null
          flavor_profile?: Json | null
          harvest_season?: string | null
          id?: string
          name: string
          origin_country?: string | null
          process?: string | null
          process_details?: string | null
          producer?: string | null
          region?: string | null
          roaster_id: string
          subregion?: string | null
          tasting_notes?: string | null
          user_id?: string | null
          variety?: string | null
          variety_details?: string | null
        }
        Update: {
          altitude?: number | null
          altitude_range?: string | null
          certification?: string | null
          coffee_story?: string | null
          cooperative?: string | null
          created_at?: string | null
          cupping_score?: number | null
          farm?: string | null
          flavor_profile?: Json | null
          harvest_season?: string | null
          id?: string
          name?: string
          origin_country?: string | null
          process?: string | null
          process_details?: string | null
          producer?: string | null
          region?: string | null
          roaster_id?: string
          subregion?: string | null
          tasting_notes?: string | null
          user_id?: string | null
          variety?: string | null
          variety_details?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coffees_roaster_id_fkey"
            columns: ["roaster_id"]
            isOneToOne: false
            referencedRelation: "roasters"
            referencedColumns: ["id"]
          },
        ]
      }
      roasters: {
        Row: {
          country: string | null
          created_at: string | null
          description: string | null
          founded_year: number | null
          id: string
          name: string
          roasting_style: string | null
          size_category: string | null
          specialty: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          name: string
          roasting_style?: string | null
          size_category?: string | null
          specialty?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          name?: string
          roasting_style?: string | null
          size_category?: string | null
          specialty?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          confirm_bag_finish: boolean | null
          created_at: string | null
          default_method: string | null
          id: string
          units_temp: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confirm_bag_finish?: boolean | null
          created_at?: string | null
          default_method?: string | null
          id?: string
          units_temp?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confirm_bag_finish?: boolean | null
          created_at?: string | null
          default_method?: string | null
          id?: string
          units_temp?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const


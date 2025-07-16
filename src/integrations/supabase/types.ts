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
      access_requests: {
        Row: {
          address: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          plan_type: string | null
          salon_name: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          plan_type?: string | null
          salon_name?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          plan_type?: string | null
          salon_name?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          order_position: number | null
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          order_position?: number | null
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_position?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      kiwify_subscriptions: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          end_date: string | null
          id: string
          kiwify_customer_id: string
          kiwify_order_id: string
          plan_type: string
          product_id: string
          start_date: string
          status: string
          updated_at: string
          webhook_data: Json | null
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          end_date?: string | null
          id?: string
          kiwify_customer_id: string
          kiwify_order_id: string
          plan_type: string
          product_id: string
          start_date?: string
          status?: string
          updated_at?: string
          webhook_data?: Json | null
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          end_date?: string | null
          id?: string
          kiwify_customer_id?: string
          kiwify_order_id?: string
          plan_type?: string
          product_id?: string
          start_date?: string
          status?: string
          updated_at?: string
          webhook_data?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          address_complement: string | null
          address_number: string | null
          created_at: string
          email: string
          has_salon: boolean | null
          id: string
          instagram: string | null
          kiwify_subscription_id: string | null
          name: string
          phone: string | null
          postal_code: string | null
          role: string
          status: string | null
          subscription_plan: string | null
          subscription_status: string | null
          updated_at: string
          user_id: string
          wants_salon: boolean | null
        }
        Insert: {
          address?: string | null
          address_complement?: string | null
          address_number?: string | null
          created_at?: string
          email: string
          has_salon?: boolean | null
          id?: string
          instagram?: string | null
          kiwify_subscription_id?: string | null
          name: string
          phone?: string | null
          postal_code?: string | null
          role?: string
          status?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id: string
          wants_salon?: boolean | null
        }
        Update: {
          address?: string | null
          address_complement?: string | null
          address_number?: string | null
          created_at?: string
          email?: string
          has_salon?: boolean | null
          id?: string
          instagram?: string | null
          kiwify_subscription_id?: string | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          role?: string
          status?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id?: string
          wants_salon?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_kiwify_subscription_id_fkey"
            columns: ["kiwify_subscription_id"]
            isOneToOne: false
            referencedRelation: "kiwify_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      salon_banners: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_active: boolean
          order_position: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          order_position?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          order_position?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      salon_treatments: {
        Row: {
          created_at: string
          custom_price: number
          id: string
          is_active: boolean
          salon_id: string
          treatment_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_price: number
          id?: string
          is_active?: boolean
          salon_id: string
          treatment_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_price?: number
          id?: string
          is_active?: boolean
          salon_id?: string
          treatment_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salon_treatments_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salon_treatments_treatment_id_fkey"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "treatments"
            referencedColumns: ["id"]
          },
        ]
      }
      salons: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          id: string
          instagram: string | null
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          photo_url: string | null
          plan: string | null
          plan_type: string | null
          postal_code: string | null
          responsible_email: string | null
          responsible_name: string | null
          slug: string
          state: string | null
          subscription_plan: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          instagram?: string | null
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          photo_url?: string | null
          plan?: string | null
          plan_type?: string | null
          postal_code?: string | null
          responsible_email?: string | null
          responsible_name?: string | null
          slug: string
          state?: string | null
          subscription_plan?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          instagram?: string | null
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          plan?: string | null
          plan_type?: string | null
          postal_code?: string | null
          responsible_email?: string | null
          responsible_name?: string | null
          slug?: string
          state?: string | null
          subscription_plan?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      treatments: {
        Row: {
          base_price: number
          button_color: string | null
          category: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          images: string[] | null
          is_active: boolean
          is_promotional: boolean | null
          name: string
          promotional_price: number | null
          rating: number | null
          rating_count: number | null
          subtitle: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          base_price?: number
          button_color?: string | null
          category: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          is_promotional?: boolean | null
          name: string
          promotional_price?: number | null
          rating?: number | null
          rating_count?: number | null
          subtitle?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          base_price?: number
          button_color?: string | null
          category?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          is_promotional?: boolean | null
          name?: string
          promotional_price?: number | null
          rating?: number | null
          rating_count?: number | null
          subtitle?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_kiwify_subscription: {
        Args: {
          p_email: string
          p_name: string
          p_kiwify_order_id: string
          p_kiwify_customer_id: string
          p_product_id: string
          p_plan_type: string
          p_webhook_data?: Json
        }
        Returns: string
      }
      admin_update_user_profile: {
        Args: {
          target_user_id: string
          new_name?: string
          new_email?: string
          new_role?: string
          new_phone?: string
          new_instagram?: string
          new_address?: string
          new_address_number?: string
          new_address_complement?: string
          new_postal_code?: string
          new_has_salon?: boolean
          new_wants_salon?: boolean
          new_status?: string
        }
        Returns: boolean
      }
      get_address_from_cep: {
        Args: { cep_input: string }
        Returns: {
          logradouro: string
          bairro: string
          cidade: string
          uf: string
          latitude: number
          longitude: number
        }[]
      }
      get_admin_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          name: string
          email: string
          role: string
          phone: string
          instagram: string
          address: string
          address_number: string
          address_complement: string
          postal_code: string
          created_at: string
          updated_at: string
          has_salon: boolean
          wants_salon: boolean
        }[]
      }
      is_admin_user: {
        Args: { user_uuid: string }
        Returns: boolean
      }
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
  public: {
    Enums: {},
  },
} as const

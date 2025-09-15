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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      delivery_partner_otp: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_used: boolean
          mobile: string
          otp_code: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          is_used?: boolean
          mobile: string
          otp_code: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          mobile?: string
          otp_code?: string
        }
        Relationships: []
      }
      delivery_partners: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_online: boolean
          mobile: string
          name: string
          password_hash: string | null
          profile_photo_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_online?: boolean
          mobile: string
          name: string
          password_hash?: string | null
          profile_photo_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_online?: boolean
          mobile?: string
          name?: string
          password_hash?: string | null
          profile_photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          created_at: string
          franchise_price: number
          id: string
          is_active: boolean
          item_name: string
          item_photo_url: string | null
          seller_id: string
          seller_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          franchise_price: number
          id?: string
          is_active?: boolean
          item_name: string
          item_photo_url?: string | null
          seller_id: string
          seller_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          franchise_price?: number
          id?: string
          is_active?: boolean
          item_name?: string
          item_photo_url?: string | null
          seller_id?: string
          seller_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          assigned_at: string | null
          assigned_delivery_partner_id: string | null
          created_at: string
          delivered_at: string | null
          delivery_address: string
          delivery_fee: number
          delivery_latitude: number | null
          delivery_longitude: number | null
          delivery_pin: string | null
          going_for_delivery_at: string | null
          going_for_pickup_at: string | null
          gst_charges: number
          id: string
          instructions: string | null
          items: Json
          payment_method: string
          pickup_at: string | null
          pickup_pin: string | null
          pickup_status: string | null
          platform_fee: number
          seller_accepted_at: string | null
          seller_id: string
          seller_name: string
          seller_packed_at: string | null
          seller_status: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_delivery_partner_id?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_address: string
          delivery_fee?: number
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          delivery_pin?: string | null
          going_for_delivery_at?: string | null
          going_for_pickup_at?: string | null
          gst_charges?: number
          id?: string
          instructions?: string | null
          items: Json
          payment_method?: string
          pickup_at?: string | null
          pickup_pin?: string | null
          pickup_status?: string | null
          platform_fee?: number
          seller_accepted_at?: string | null
          seller_id: string
          seller_name: string
          seller_packed_at?: string | null
          seller_status?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_delivery_partner_id?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_address?: string
          delivery_fee?: number
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          delivery_pin?: string | null
          going_for_delivery_at?: string | null
          going_for_pickup_at?: string | null
          gst_charges?: number
          id?: string
          instructions?: string | null
          items?: Json
          payment_method?: string
          pickup_at?: string | null
          pickup_pin?: string | null
          pickup_status?: string | null
          platform_fee?: number
          seller_accepted_at?: string | null
          seller_id?: string
          seller_name?: string
          seller_packed_at?: string | null
          seller_status?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_assigned_delivery_partner_id_fkey"
            columns: ["assigned_delivery_partner_id"]
            isOneToOne: false
            referencedRelation: "delivery_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      sellers: {
        Row: {
          account_number: string
          bank_name: string
          created_at: string
          franchise_percentage: number | null
          id: string
          ifsc_code: string
          is_online: boolean
          mobile: string
          owner_name: string
          password_hash: string
          profile_photo_url: string | null
          seller_id: string | null
          seller_latitude: number | null
          seller_longitude: number | null
          seller_name: string
          status: string
          updated_at: string
        }
        Insert: {
          account_number: string
          bank_name: string
          created_at?: string
          franchise_percentage?: number | null
          id?: string
          ifsc_code: string
          is_online?: boolean
          mobile: string
          owner_name: string
          password_hash: string
          profile_photo_url?: string | null
          seller_id?: string | null
          seller_latitude?: number | null
          seller_longitude?: number | null
          seller_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          account_number?: string
          bank_name?: string
          created_at?: string
          franchise_percentage?: number | null
          id?: string
          ifsc_code?: string
          is_online?: boolean
          mobile?: string
          owner_name?: string
          password_hash?: string
          profile_photo_url?: string | null
          seller_id?: string | null
          seller_latitude?: number | null
          seller_longitude?: number | null
          seller_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_otp: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_used: boolean
          mobile: string
          otp_code: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          is_used?: boolean
          mobile: string
          otp_code: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          mobile?: string
          otp_code?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          id: string
          is_verified: boolean
          mobile: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_verified?: boolean
          mobile: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_verified?: boolean
          mobile?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_delivery_pin: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_seller_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      hash_password: {
        Args: { password: string }
        Returns: string
      }
      verify_password: {
        Args: { hash: string; password: string }
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

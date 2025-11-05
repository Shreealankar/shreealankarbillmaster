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
      bill_items: {
        Row: {
          bill_id: string | null
          created_at: string
          id: string
          item_name: string
          making_charges: number | null
          making_charges_percentage: number | null
          making_charges_type: string | null
          metal_type: string
          other_charges: number | null
          purity: string
          rate_per_gram: number
          stone_charges: number | null
          total_amount: number
          weight_grams: number
        }
        Insert: {
          bill_id?: string | null
          created_at?: string
          id?: string
          item_name: string
          making_charges?: number | null
          making_charges_percentage?: number | null
          making_charges_type?: string | null
          metal_type?: string
          other_charges?: number | null
          purity?: string
          rate_per_gram: number
          stone_charges?: number | null
          total_amount: number
          weight_grams: number
        }
        Update: {
          bill_id?: string | null
          created_at?: string
          id?: string
          item_name?: string
          making_charges?: number | null
          making_charges_percentage?: number | null
          making_charges_type?: string | null
          metal_type?: string
          other_charges?: number | null
          purity?: string
          rate_per_gram?: number
          stone_charges?: number | null
          total_amount?: number
          weight_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "bill_items_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          balance_amount: number
          bill_number: string
          created_at: string
          customer_address: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string
          discount_amount: number | null
          discount_percentage: number | null
          final_amount: number
          id: string
          notes: string | null
          paid_amount: number
          payment_method: string | null
          tax_amount: number | null
          tax_percentage: number | null
          total_amount: number
          total_weight: number
          updated_at: string
        }
        Insert: {
          balance_amount?: number
          bill_number: string
          created_at?: string
          customer_address?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          discount_amount?: number | null
          discount_percentage?: number | null
          final_amount?: number
          id?: string
          notes?: string | null
          paid_amount?: number
          payment_method?: string | null
          tax_amount?: number | null
          tax_percentage?: number | null
          total_amount?: number
          total_weight?: number
          updated_at?: string
        }
        Update: {
          balance_amount?: number
          bill_number?: string
          created_at?: string
          customer_address?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          discount_amount?: number | null
          discount_percentage?: number | null
          final_amount?: number
          id?: string
          notes?: string | null
          paid_amount?: number
          payment_method?: string | null
          tax_amount?: number | null
          tax_percentage?: number | null
          total_amount?: number
          total_weight?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_receipts: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          jewelry_name: string | null
          notes: string | null
          paid_amount: number
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          jewelry_name?: string | null
          notes?: string | null
          paid_amount?: number
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          jewelry_name?: string | null
          notes?: string | null
          paid_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_receipts_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_code: string
          booking_type: string
          created_at: string
          customer_id: string | null
          email: string
          full_address: string
          full_name: string
          gold_weight: number
          id: string
          primary_mobile: string
          secondary_mobile: string | null
          status: string
          terms_accepted: boolean
          updated_at: string
        }
        Insert: {
          booking_code?: string
          booking_type: string
          created_at?: string
          customer_id?: string | null
          email: string
          full_address: string
          full_name: string
          gold_weight: number
          id?: string
          primary_mobile: string
          secondary_mobile?: string | null
          status?: string
          terms_accepted?: boolean
          updated_at?: string
        }
        Update: {
          booking_code?: string
          booking_type?: string
          created_at?: string
          customer_id?: string | null
          email?: string
          full_address?: string
          full_name?: string
          gold_weight?: number
          id?: string
          primary_mobile?: string
          secondary_mobile?: string | null
          status?: string
          terms_accepted?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      borrowings: {
        Row: {
          balance_amount: number
          borrowed_amount: number
          borrowed_date: string
          created_at: string
          customer_id: string | null
          customer_name: string
          customer_phone: string
          due_date: string | null
          id: string
          interest_rate: number | null
          notes: string | null
          paid_amount: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          balance_amount: number
          borrowed_amount: number
          borrowed_date?: string
          created_at?: string
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          due_date?: string | null
          id?: string
          interest_rate?: number | null
          notes?: string | null
          paid_amount?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          balance_amount?: number
          borrowed_amount?: number
          borrowed_date?: string
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          due_date?: string | null
          id?: string
          interest_rate?: number | null
          notes?: string | null
          paid_amount?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "borrowings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      carousel_images: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          created_at: string
          device_id: string | null
          email: string | null
          id: string
          is_guest: boolean | null
          is_owner: boolean | null
          last_login: string | null
          name: string | null
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          email?: string | null
          id?: string
          is_guest?: boolean | null
          is_owner?: boolean | null
          last_login?: string | null
          name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string | null
          email?: string | null
          id?: string
          is_guest?: boolean | null
          is_owner?: boolean | null
          last_login?: string | null
          name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_otps: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          is_verified: boolean
          otp_code: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          is_verified?: boolean
          otp_code: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          is_verified?: boolean
          otp_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      jewelry_items: {
        Row: {
          created_at: string
          id: string
          name: string
          photo_url: string | null
          purity: string
          type: string
          updated_at: string
          weight_grams: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          photo_url?: string | null
          purity: string
          type: string
          updated_at?: string
          weight_grams: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          photo_url?: string | null
          purity?: string
          type?: string
          updated_at?: string
          weight_grams?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          customer_id: string | null
          customer_phone: string
          id: string
          message_text: string
          message_type: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          customer_phone: string
          id?: string
          message_text: string
          message_type?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          customer_phone?: string
          id?: string
          message_text?: string
          message_type?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          category: Database["public"]["Enums"]["product_category"]
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          making_charges_manual: number | null
          making_charges_percentage: number | null
          making_charges_type: string | null
          minimum_stock: number | null
          name_english: string
          name_marathi: string | null
          other_charges: number | null
          pieces: number | null
          purity: string
          status: string | null
          stock_quantity: number | null
          stone_charges: number | null
          title: string | null
          type: string
          unique_number: string | null
          updated_at: string
          weight_grams: number
        }
        Insert: {
          barcode?: string | null
          category: Database["public"]["Enums"]["product_category"]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          making_charges_manual?: number | null
          making_charges_percentage?: number | null
          making_charges_type?: string | null
          minimum_stock?: number | null
          name_english?: string
          name_marathi?: string | null
          other_charges?: number | null
          pieces?: number | null
          purity?: string
          status?: string | null
          stock_quantity?: number | null
          stone_charges?: number | null
          title?: string | null
          type?: string
          unique_number?: string | null
          updated_at?: string
          weight_grams: number
        }
        Update: {
          barcode?: string | null
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          making_charges_manual?: number | null
          making_charges_percentage?: number | null
          making_charges_type?: string | null
          minimum_stock?: number | null
          name_english?: string
          name_marathi?: string | null
          other_charges?: number | null
          pieces?: number | null
          purity?: string
          status?: string | null
          stock_quantity?: number | null
          stone_charges?: number | null
          title?: string | null
          type?: string
          unique_number?: string | null
          updated_at?: string
          weight_grams?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          is_owner: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          is_owner?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_owner?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      rate_history: {
        Row: {
          created_at: string
          id: string
          metal_type: string
          rate_per_gram: number
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metal_type: string
          rate_per_gram: number
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metal_type?: string
          rate_per_gram?: number
          updated_by?: string | null
        }
        Relationships: []
      }
      rates: {
        Row: {
          id: string
          is_locked: boolean | null
          metal_type: string
          rate_per_gram: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          is_locked?: boolean | null
          metal_type: string
          rate_per_gram: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          is_locked?: boolean | null
          metal_type?: string
          rate_per_gram?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          phone_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          phone_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          phone_number?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_email_otps: { Args: never; Returns: undefined }
      cleanup_expired_otps: { Args: never; Returns: undefined }
      generate_bill_number: { Args: never; Returns: string }
      generate_product_barcode: { Args: never; Returns: string }
      generate_product_unique_number: { Args: never; Returns: string }
      update_rate_lock_status: {
        Args: { p_is_locked: boolean; p_metal_type: string }
        Returns: undefined
      }
    }
    Enums: {
      product_category:
        | "necklace"
        | "ring"
        | "earring"
        | "bracelet"
        | "pendant"
        | "other"
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
      product_category: [
        "necklace",
        "ring",
        "earring",
        "bracelet",
        "pendant",
        "other",
      ],
    },
  },
} as const

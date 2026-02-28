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
      activity_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bill_items: {
        Row: {
          bill_id: string | null
          created_at: string
          hsn_code: string | null
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
          hsn_code?: string | null
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
          hsn_code?: string | null
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
          cgst_amount: number | null
          created_at: string
          customer_address: string | null
          customer_gstin: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string
          discount_amount: number | null
          discount_percentage: number | null
          final_amount: number
          id: string
          igst_amount: number | null
          is_igst: boolean | null
          notes: string | null
          paid_amount: number
          payment_method: string | null
          sgst_amount: number | null
          tax_amount: number | null
          tax_percentage: number | null
          total_amount: number
          total_weight: number
          updated_at: string
        }
        Insert: {
          balance_amount?: number
          bill_number: string
          cgst_amount?: number | null
          created_at?: string
          customer_address?: string | null
          customer_gstin?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          discount_amount?: number | null
          discount_percentage?: number | null
          final_amount?: number
          id?: string
          igst_amount?: number | null
          is_igst?: boolean | null
          notes?: string | null
          paid_amount?: number
          payment_method?: string | null
          sgst_amount?: number | null
          tax_amount?: number | null
          tax_percentage?: number | null
          total_amount?: number
          total_weight?: number
          updated_at?: string
        }
        Update: {
          balance_amount?: number
          bill_number?: string
          cgst_amount?: number | null
          created_at?: string
          customer_address?: string | null
          customer_gstin?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          discount_amount?: number | null
          discount_percentage?: number | null
          final_amount?: number
          id?: string
          igst_amount?: number | null
          is_igst?: boolean | null
          notes?: string | null
          paid_amount?: number
          payment_method?: string | null
          sgst_amount?: number | null
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
      cash_book_entries: {
        Row: {
          cash_in: number | null
          cash_out: number | null
          category: string
          created_at: string
          description: string
          entry_date: string
          entry_type: string
          id: string
          notes: string | null
          payment_mode: string | null
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          cash_in?: number | null
          cash_out?: number | null
          category: string
          created_at?: string
          description: string
          entry_date?: string
          entry_type?: string
          id?: string
          notes?: string | null
          payment_mode?: string | null
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          cash_in?: number | null
          cash_out?: number | null
          category?: string
          created_at?: string
          description?: string
          entry_date?: string
          entry_type?: string
          id?: string
          notes?: string | null
          payment_mode?: string | null
          reference_id?: string | null
          reference_type?: string | null
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
          anniversary_date: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          gstin: string | null
          id: string
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          anniversary_date?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          name: string
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          anniversary_date?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          gstin?: string | null
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
      estimate_items: {
        Row: {
          created_at: string
          estimate_id: string | null
          hsn_code: string | null
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
          created_at?: string
          estimate_id?: string | null
          hsn_code?: string | null
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
          created_at?: string
          estimate_id?: string | null
          hsn_code?: string | null
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
            foreignKeyName: "estimate_items_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          cgst_amount: number | null
          created_at: string
          customer_address: string | null
          customer_email: string | null
          customer_gstin: string | null
          customer_name: string
          customer_phone: string
          discount_amount: number | null
          discount_percentage: number | null
          estimate_number: string
          final_amount: number
          id: string
          igst_amount: number | null
          is_igst: boolean | null
          notes: string | null
          sgst_amount: number | null
          status: string
          tax_amount: number | null
          tax_percentage: number | null
          total_amount: number
          total_weight: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          cgst_amount?: number | null
          created_at?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_gstin?: string | null
          customer_name: string
          customer_phone: string
          discount_amount?: number | null
          discount_percentage?: number | null
          estimate_number: string
          final_amount?: number
          id?: string
          igst_amount?: number | null
          is_igst?: boolean | null
          notes?: string | null
          sgst_amount?: number | null
          status?: string
          tax_amount?: number | null
          tax_percentage?: number | null
          total_amount?: number
          total_weight?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          cgst_amount?: number | null
          created_at?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_gstin?: string | null
          customer_name?: string
          customer_phone?: string
          discount_amount?: number | null
          discount_percentage?: number | null
          estimate_number?: string
          final_amount?: number
          id?: string
          igst_amount?: number | null
          is_igst?: boolean | null
          notes?: string | null
          sgst_amount?: number | null
          status?: string
          tax_amount?: number | null
          tax_percentage?: number | null
          total_amount?: number
          total_weight?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          expense_date: string
          id: string
          notes: string | null
          payment_method: string | null
          receipt_number: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          receipt_number?: string | null
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
      old_gold_exchanges: {
        Row: {
          bill_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          exchange_date: string
          exchange_number: string
          exchange_value: number
          gross_weight: number
          id: string
          net_weight: number
          notes: string | null
          old_item_description: string
          old_metal_type: string
          old_purity: string
          rate_per_gram: number
          stone_weight: number | null
        }
        Insert: {
          bill_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          exchange_date?: string
          exchange_number: string
          exchange_value: number
          gross_weight: number
          id?: string
          net_weight: number
          notes?: string | null
          old_item_description: string
          old_metal_type: string
          old_purity: string
          rate_per_gram: number
          stone_weight?: number | null
        }
        Update: {
          bill_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          exchange_date?: string
          exchange_number?: string
          exchange_value?: number
          gross_weight?: number
          id?: string
          net_weight?: number
          notes?: string | null
          old_item_description?: string
          old_metal_type?: string
          old_purity?: string
          rate_per_gram?: number
          stone_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "old_gold_exchanges_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "old_gold_exchanges_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_transfers: {
        Row: {
          created_at: string
          created_by: string | null
          from_location: string
          id: string
          notes: string | null
          product_id: string | null
          quantity: number
          received_by: string | null
          received_date: string | null
          status: string | null
          to_location: string
          transfer_date: string
          transfer_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          from_location: string
          id?: string
          notes?: string | null
          product_id?: string | null
          quantity: number
          received_by?: string | null
          received_date?: string | null
          status?: string | null
          to_location: string
          transfer_date?: string
          transfer_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          from_location?: string
          id?: string
          notes?: string | null
          product_id?: string | null
          quantity?: number
          received_by?: string | null
          received_date?: string | null
          status?: string | null
          to_location?: string
          transfer_date?: string
          transfer_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_transfers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
          hallmark_center: string | null
          hallmark_date: string | null
          hallmark_status: string | null
          huid_number: string | null
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
          hallmark_center?: string | null
          hallmark_date?: string | null
          hallmark_status?: string | null
          huid_number?: string | null
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
          hallmark_center?: string | null
          hallmark_date?: string | null
          hallmark_status?: string | null
          huid_number?: string | null
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
      purchase_order_items: {
        Row: {
          created_at: string
          id: string
          po_id: string | null
          product_id: string | null
          quantity: number
          received_quantity: number | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          po_id?: string | null
          product_id?: string | null
          quantity: number
          received_quantity?: number | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          po_id?: string | null
          product_id?: string | null
          quantity?: number
          received_quantity?: number | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          created_by: string | null
          expected_delivery_date: string | null
          id: string
          notes: string | null
          order_date: string
          paid_amount: number | null
          po_number: string
          status: string | null
          total_amount: number | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          paid_amount?: number | null
          po_number: string
          status?: string | null
          total_amount?: number | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          paid_amount?: number | null
          po_number?: string
          status?: string | null
          total_amount?: number | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_voucher_items: {
        Row: {
          created_at: string
          id: string
          item_description: string
          metal_type: string | null
          net_weight: number
          purity: string
          rate_per_gram: number
          total_amount: number
          voucher_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_description: string
          metal_type?: string | null
          net_weight: number
          purity: string
          rate_per_gram: number
          total_amount: number
          voucher_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          item_description?: string
          metal_type?: string | null
          net_weight?: number
          purity?: string
          rate_per_gram?: number
          total_amount?: number
          voucher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_voucher_items_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "purchase_vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_vouchers: {
        Row: {
          created_at: string
          customer_address: string | null
          customer_name: string
          customer_phone: string
          id: string
          notes: string | null
          pan_aadhaar: string | null
          payment_method: string | null
          total_amount: number
          total_weight: number
          utr_number: string | null
          voucher_date: string
          voucher_number: string
        }
        Insert: {
          created_at?: string
          customer_address?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          notes?: string | null
          pan_aadhaar?: string | null
          payment_method?: string | null
          total_amount?: number
          total_weight?: number
          utr_number?: string | null
          voucher_date?: string
          voucher_number: string
        }
        Update: {
          created_at?: string
          customer_address?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          notes?: string | null
          pan_aadhaar?: string | null
          payment_method?: string | null
          total_amount?: number
          total_weight?: number
          utr_number?: string | null
          voucher_date?: string
          voucher_number?: string
        }
        Relationships: []
      }
      purity_tests: {
        Row: {
          claimed_purity: string
          created_at: string
          customer_name: string | null
          id: string
          metal_type: string
          notes: string | null
          product_id: string | null
          test_date: string
          test_method: string | null
          test_number: string
          test_result: string
          tested_by: string | null
          tested_purity: string
          weight_grams: number
        }
        Insert: {
          claimed_purity: string
          created_at?: string
          customer_name?: string | null
          id?: string
          metal_type: string
          notes?: string | null
          product_id?: string | null
          test_date?: string
          test_method?: string | null
          test_number: string
          test_result: string
          tested_by?: string | null
          tested_purity: string
          weight_grams: number
        }
        Update: {
          claimed_purity?: string
          created_at?: string
          customer_name?: string | null
          id?: string
          metal_type?: string
          notes?: string | null
          product_id?: string | null
          test_date?: string
          test_method?: string | null
          test_number?: string
          test_result?: string
          tested_by?: string | null
          tested_purity?: string
          weight_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "purity_tests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      repair_jobs: {
        Row: {
          actual_cost: number | null
          advance_paid: number | null
          completion_date: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          delivery_date: string | null
          estimated_cost: number | null
          id: string
          item_description: string
          job_number: string
          job_type: string
          metal_type: string
          notes: string | null
          photos: Json | null
          promised_date: string | null
          received_date: string
          status: string | null
          updated_at: string
          weight_grams: number | null
        }
        Insert: {
          actual_cost?: number | null
          advance_paid?: number | null
          completion_date?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivery_date?: string | null
          estimated_cost?: number | null
          id?: string
          item_description: string
          job_number: string
          job_type: string
          metal_type: string
          notes?: string | null
          photos?: Json | null
          promised_date?: string | null
          received_date?: string
          status?: string | null
          updated_at?: string
          weight_grams?: number | null
        }
        Update: {
          actual_cost?: number | null
          advance_paid?: number | null
          completion_date?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivery_date?: string | null
          estimated_cost?: number | null
          id?: string
          item_description?: string
          job_number?: string
          job_type?: string
          metal_type?: string
          notes?: string | null
          photos?: Json | null
          promised_date?: string | null
          received_date?: string
          status?: string | null
          updated_at?: string
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "repair_jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      scheme_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          installment_number: number
          notes: string | null
          payment_date: string
          payment_method: string | null
          receipt_number: string | null
          scheme_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          installment_number: number
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          receipt_number?: string | null
          scheme_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          installment_number?: number
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          receipt_number?: string | null
          scheme_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheme_payments_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      schemes: {
        Row: {
          bonus_percentage: number | null
          created_at: string
          customer_id: string | null
          end_date: string
          id: string
          installment_amount: number
          notes: string | null
          paid_installments: number | null
          scheme_code: string
          scheme_name: string
          start_date: string
          status: string | null
          total_amount: number
          total_installments: number
          updated_at: string
        }
        Insert: {
          bonus_percentage?: number | null
          created_at?: string
          customer_id?: string | null
          end_date: string
          id?: string
          installment_amount: number
          notes?: string | null
          paid_installments?: number | null
          scheme_code: string
          scheme_name: string
          start_date: string
          status?: string | null
          total_amount: number
          total_installments: number
          updated_at?: string
        }
        Update: {
          bonus_percentage?: number | null
          created_at?: string
          customer_id?: string | null
          end_date?: string
          id?: string
          installment_amount?: number
          notes?: string | null
          paid_installments?: number | null
          scheme_code?: string
          scheme_name?: string
          start_date?: string
          status?: string | null
          total_amount?: number
          total_installments?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schemes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          product_id: string | null
          threshold_quantity: number | null
          updated_at: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          product_id?: string | null
          threshold_quantity?: number | null
          updated_at?: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          product_id?: string | null
          threshold_quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stone_inventory: {
        Row: {
          carat_weight: number | null
          certificate_number: string | null
          clarity: string | null
          color: string | null
          cost_per_piece: number | null
          created_at: string
          cut_grade: string | null
          id: string
          location: string | null
          notes: string | null
          quantity: number | null
          shape: string | null
          size_mm: string | null
          status: string | null
          stone_code: string
          stone_type: string
          total_value: number | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          carat_weight?: number | null
          certificate_number?: string | null
          clarity?: string | null
          color?: string | null
          cost_per_piece?: number | null
          created_at?: string
          cut_grade?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          quantity?: number | null
          shape?: string | null
          size_mm?: string | null
          status?: string | null
          stone_code: string
          stone_type: string
          total_value?: number | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          carat_weight?: number | null
          certificate_number?: string | null
          clarity?: string | null
          color?: string | null
          cost_per_piece?: number | null
          created_at?: string
          cut_grade?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          quantity?: number | null
          shape?: string | null
          size_mm?: string | null
          status?: string | null
          stone_code?: string
          stone_type?: string
          total_value?: number | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stone_inventory_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          gstin: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      wastage_records: {
        Row: {
          created_at: string
          created_by: string | null
          disposal_date: string | null
          disposed: boolean | null
          id: string
          metal_type: string
          notes: string | null
          purity: string
          reason: string
          record_number: string
          recorded_date: string
          updated_at: string
          value_estimate: number | null
          weight_grams: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          disposal_date?: string | null
          disposed?: boolean | null
          id?: string
          metal_type: string
          notes?: string | null
          purity: string
          reason: string
          record_number: string
          recorded_date?: string
          updated_at?: string
          value_estimate?: number | null
          weight_grams: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          disposal_date?: string | null
          disposed?: boolean | null
          id?: string
          metal_type?: string
          notes?: string | null
          purity?: string
          reason?: string
          record_number?: string
          recorded_date?: string
          updated_at?: string
          value_estimate?: number | null
          weight_grams?: number
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
      generate_estimate_number: { Args: never; Returns: string }
      generate_exchange_number: { Args: never; Returns: string }
      generate_job_number: { Args: never; Returns: string }
      generate_po_number: { Args: never; Returns: string }
      generate_product_barcode: { Args: never; Returns: string }
      generate_product_unique_number: { Args: never; Returns: string }
      generate_scheme_code: { Args: never; Returns: string }
      generate_test_number: { Args: never; Returns: string }
      generate_transfer_number: { Args: never; Returns: string }
      generate_voucher_number: { Args: never; Returns: string }
      generate_wastage_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_authenticated_staff: { Args: never; Returns: boolean }
      update_rate_lock_status: {
        Args: { p_is_locked: boolean; p_metal_type: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "customer"
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
      app_role: ["admin", "staff", "customer"],
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

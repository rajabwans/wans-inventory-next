export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: number
          name: string
          slug: string
          currency: string
          logo: string | null
          about: string | null
          plan: string
          status: string
          paid_until: string | null
          upgrade_requested: boolean
          upgrade_note: string | null
          upgrade_proof: string | null
          upgrade_requested_at: string | null
          trial_ends_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          currency?: string
          logo?: string | null
          about?: string | null
          plan?: string
          status?: string
          paid_until?: string | null
          upgrade_requested?: boolean
          upgrade_note?: string | null
          upgrade_proof?: string | null
          upgrade_requested_at?: string | null
          trial_ends_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          currency?: string
          logo?: string | null
          about?: string | null
          plan?: string
          status?: string
          paid_until?: string | null
          upgrade_requested?: boolean
          upgrade_note?: string | null
          upgrade_proof?: string | null
          upgrade_requested_at?: string | null
          trial_ends_at?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      users: {
        Row: {
          id: number
          business_id: number
          username: string
          password_hash: string
          full_name: string | null
          role: string
          created_at: string
        }
        Insert: {
          id?: number
          business_id: number
          username: string
          password_hash: string
          full_name?: string | null
          role?: string
          created_at?: string
        }
        Update: {
          id?: number
          business_id?: number
          username?: string
          password_hash?: string
          full_name?: string | null
          role?: string
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          business_id: number
          name: string
          kind: string
          created_at: string
        }
        Insert: {
          id?: number
          business_id: number
          name: string
          kind?: string
          created_at?: string
        }
        Update: {
          id?: number
          business_id?: number
          name?: string
          kind?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: number
          business_id: number
          title: string
          author: string | null
          isbn: string | null
          publisher: string | null
          category: string | null
          quantity: number
          buying_price: number
          selling_price: number
          notes: string | null
          expiry_date: string | null
          version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          business_id: number
          title: string
          author?: string | null
          isbn?: string | null
          publisher?: string | null
          category?: string | null
          quantity?: number
          buying_price?: number
          selling_price?: number
          notes?: string | null
          expiry_date?: string | null
          version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          business_id?: number
          title?: string
          author?: string | null
          isbn?: string | null
          publisher?: string | null
          category?: string | null
          quantity?: number
          buying_price?: number
          selling_price?: number
          notes?: string | null
          expiry_date?: string | null
          version?: number
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: number
          business_id: number
          name: string
          phone: string | null
          email: string | null
          address: string | null
          created_at: string
        }
        Insert: {
          id?: number
          business_id: number
          name: string
          phone?: string | null
          email?: string | null
          address?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          business_id?: number
          name?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          created_at?: string
        }
      }
      sales: {
        Row: {
          id: number
          business_id: number
          product_id: number
          customer_id: number | null
          customer_name: string | null
          quantity_sold: number
          unit_price: number
          total_amount: number
          profit: number
          payment_status: string
          amount_paid: number
          payment_method: string
          due_date: string | null
          sale_date: string
        }
        Insert: {
          id?: number
          business_id: number
          product_id: number
          customer_id?: number | null
          customer_name?: string | null
          quantity_sold: number
          unit_price: number
          total_amount: number
          profit: number
          payment_status?: string
          amount_paid?: number
          payment_method?: string
          due_date?: string | null
          sale_date?: string
        }
        Update: {
          id?: number
          business_id?: number
          product_id?: number
          customer_id?: number | null
          customer_name?: string | null
          quantity_sold?: number
          unit_price?: number
          total_amount?: number
          profit?: number
          payment_status?: string
          amount_paid?: number
          payment_method?: string
          due_date?: string | null
          sale_date?: string
        }
      }
      sale_payments: {
        Row: {
          id: number
          business_id: number
          sale_id: number
          amount: number
          method: string
          note: string | null
          recorded_by: number | null
          paid_at: string
          created_at: string
        }
        Insert: {
          id?: number
          business_id: number
          sale_id: number
          amount: number
          method?: string
          note?: string | null
          recorded_by?: number | null
          paid_at?: string
          created_at?: string
        }
        Update: {
          id?: number
          business_id?: number
          sale_id?: number
          amount?: number
          method?: string
          note?: string | null
          recorded_by?: number | null
          paid_at?: string
          created_at?: string
        }
      }
      suppliers: {
        Row: {
          id: number
          business_id: number
          name: string
          phone: string | null
          email: string | null
          address: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: number
          business_id: number
          name: string
          phone?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          business_id?: number
          name?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      purchases: {
        Row: {
          id: number
          business_id: number
          supplier_id: number | null
          purchase_date: string
          total_amount: number
          note: string | null
          created_by: number | null
          created_at: string
        }
        Insert: {
          id?: number
          business_id: number
          supplier_id?: number | null
          purchase_date?: string
          total_amount?: number
          note?: string | null
          created_by?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          business_id?: number
          supplier_id?: number | null
          purchase_date?: string
          total_amount?: number
          note?: string | null
          created_by?: number | null
          created_at?: string
        }
      }
      purchase_items: {
        Row: {
          id: number
          business_id: number
          purchase_id: number
          product_id: number
          quantity: number
          unit_cost: number
          line_total: number
          expiry_date: string | null
        }
        Insert: {
          id?: number
          business_id: number
          purchase_id: number
          product_id: number
          quantity: number
          unit_cost?: number
          line_total?: number
          expiry_date?: string | null
        }
        Update: {
          id?: number
          business_id?: number
          purchase_id?: number
          product_id?: number
          quantity?: number
          unit_cost?: number
          line_total?: number
          expiry_date?: string | null
        }
      }
      sale_returns: {
        Row: {
          id: number
          business_id: number
          sale_id: number
          product_id: number
          quantity_sold: number
          quantity_returned: number
          refund_amount: number
          reason: string | null
          created_by: number | null
          created_at: string
        }
        Insert: {
          id?: number
          business_id: number
          sale_id: number
          product_id: number
          quantity_sold?: number
          quantity_returned: number
          refund_amount?: number
          reason?: string | null
          created_by?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          business_id?: number
          sale_id?: number
          product_id?: number
          quantity_sold?: number
          quantity_returned?: number
          refund_amount?: number
          reason?: string | null
          created_by?: number | null
          created_at?: string
        }
      }
      till_closures: {
        Row: {
          id: number
          business_id: number
          close_date: string
          cash_counted: number
          momo_counted: number
          card_counted: number
          note: string | null
          closed_by: number | null
          created_at: string
        }
        Insert: {
          id?: number
          business_id: number
          close_date: string
          cash_counted?: number
          momo_counted?: number
          card_counted?: number
          note?: string | null
          closed_by?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          business_id?: number
          close_date?: string
          cash_counted?: number
          momo_counted?: number
          card_counted?: number
          note?: string | null
          closed_by?: number | null
          created_at?: string
        }
      }
      product_batches: {
        Row: {
          id: number
          business_id: number
          product_id: number
          quantity: number
          unit_cost: number
          expiry_date: string | null
          received_date: string
          source: string
          source_id: number | null
          created_at: string
        }
        Insert: {
          id?: number
          business_id: number
          product_id: number
          quantity?: number
          unit_cost?: number
          expiry_date?: string | null
          received_date?: string
          source?: string
          source_id?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          business_id?: number
          product_id?: number
          quantity?: number
          unit_cost?: number
          expiry_date?: string | null
          received_date?: string
          source?: string
          source_id?: number | null
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: number
          business_id: number
          description: string
          amount: number
          category: string | null
          user_id: number | null
          expense_date: string
          created_at: string
        }
        Insert: {
          id?: number
          business_id: number
          description: string
          amount: number
          category?: string | null
          user_id?: number | null
          expense_date?: string
          created_at?: string
        }
        Update: {
          id?: number
          business_id?: number
          description?: string
          amount?: number
          category?: string | null
          user_id?: number | null
          expense_date?: string
          created_at?: string
        }
      }
      stock_adjustments: {
        Row: {
          id: number
          product_id: number
          business_id: number
          adjustment_type: string
          quantity: number
          reason: string | null
          user_id: number | null
          created_at: string
        }
        Insert: {
          id?: number
          product_id: number
          business_id: number
          adjustment_type: string
          quantity: number
          reason?: string | null
          user_id?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          product_id?: number
          business_id?: number
          adjustment_type?: string
          quantity?: number
          reason?: string | null
          user_id?: number | null
          created_at?: string
        }
      }
      audit_log: {
        Row: {
          id: number
          business_id: number
          user_id: number | null
          username: string | null
          action: string
          table_name: string
          record_id: number | null
          details: string | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: number
          business_id: number
          user_id?: number | null
          username?: string | null
          action: string
          table_name: string
          record_id?: number | null
          details?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          business_id?: number
          user_id?: number | null
          username?: string | null
          action?: string
          table_name?: string
          record_id?: number | null
          details?: string | null
          ip_address?: string | null
          created_at?: string
        }
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
  }
}

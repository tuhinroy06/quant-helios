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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      backtest_results: {
        Row: {
          completed_at: string | null
          created_at: string
          equity_curve: Json | null
          error_message: string | null
          id: string
          metrics: Json | null
          parameters: Json
          results: Json | null
          started_at: string | null
          status: string | null
          strategy_id: string
          strategy_version: number
          trade_log: Json | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          equity_curve?: Json | null
          error_message?: string | null
          id?: string
          metrics?: Json | null
          parameters?: Json
          results?: Json | null
          started_at?: string | null
          status?: string | null
          strategy_id: string
          strategy_version: number
          trade_log?: Json | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          equity_curve?: Json | null
          error_message?: string | null
          id?: string
          metrics?: Json | null
          parameters?: Json
          results?: Json | null
          started_at?: string | null
          status?: string | null
          strategy_id?: string
          strategy_version?: number
          trade_log?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "backtest_results_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      fno_simulations: {
        Row: {
          breakeven_points: Json | null
          config: Json
          created_at: string
          direction: string | null
          expiry_date: string | null
          greeks: Json | null
          id: string
          instrument_type: string
          lot_size: number | null
          max_loss: number | null
          max_profit: number | null
          payoff_data: Json | null
          premium: number | null
          quantity: number | null
          risk_acknowledged: boolean
          risk_acknowledged_at: string | null
          strike_price: number | null
          underlying: string
          updated_at: string
          user_id: string
        }
        Insert: {
          breakeven_points?: Json | null
          config?: Json
          created_at?: string
          direction?: string | null
          expiry_date?: string | null
          greeks?: Json | null
          id?: string
          instrument_type: string
          lot_size?: number | null
          max_loss?: number | null
          max_profit?: number | null
          payoff_data?: Json | null
          premium?: number | null
          quantity?: number | null
          risk_acknowledged?: boolean
          risk_acknowledged_at?: string | null
          strike_price?: number | null
          underlying: string
          updated_at?: string
          user_id: string
        }
        Update: {
          breakeven_points?: Json | null
          config?: Json
          created_at?: string
          direction?: string | null
          expiry_date?: string | null
          greeks?: Json | null
          id?: string
          instrument_type?: string
          lot_size?: number | null
          max_loss?: number | null
          max_profit?: number | null
          payoff_data?: Json | null
          premium?: number | null
          quantity?: number | null
          risk_acknowledged?: boolean
          risk_acknowledged_at?: string | null
          strike_price?: number | null
          underlying?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      paper_accounts: {
        Row: {
          created_at: string
          currency: string | null
          current_balance: number | null
          id: string
          initial_balance: number | null
          is_active: boolean | null
          name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          current_balance?: number | null
          id?: string
          initial_balance?: number | null
          is_active?: boolean | null
          name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          current_balance?: number | null
          id?: string
          initial_balance?: number | null
          is_active?: boolean | null
          name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      paper_trades: {
        Row: {
          account_id: string
          closed_at: string | null
          entry_price: number
          exit_price: number | null
          fees: number | null
          id: string
          notes: string | null
          opened_at: string
          order_type: string | null
          pnl: number | null
          quantity: number
          side: string
          status: string | null
          stop_loss: number | null
          strategy_id: string | null
          symbol: string
          take_profit: number | null
        }
        Insert: {
          account_id: string
          closed_at?: string | null
          entry_price: number
          exit_price?: number | null
          fees?: number | null
          id?: string
          notes?: string | null
          opened_at?: string
          order_type?: string | null
          pnl?: number | null
          quantity: number
          side: string
          status?: string | null
          stop_loss?: number | null
          strategy_id?: string | null
          symbol: string
          take_profit?: number | null
        }
        Update: {
          account_id?: string
          closed_at?: string | null
          entry_price?: number
          exit_price?: number | null
          fees?: number | null
          id?: string
          notes?: string | null
          opened_at?: string
          order_type?: string | null
          pnl?: number | null
          quantity?: number
          side?: string
          status?: string | null
          stop_loss?: number | null
          strategy_id?: string | null
          symbol?: string
          take_profit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "paper_trades_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "paper_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paper_trades_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      strategies: {
        Row: {
          config: Json
          created_at: string
          description: string | null
          entry_rules: Json
          exit_rules: Json
          id: string
          is_public: boolean | null
          market_type: string
          name: string
          position_sizing: Json | null
          risk_limits: Json | null
          status: string | null
          timeframe: string
          updated_at: string
          user_id: string
          validation_result: Json | null
          version: number | null
        }
        Insert: {
          config?: Json
          created_at?: string
          description?: string | null
          entry_rules?: Json
          exit_rules?: Json
          id?: string
          is_public?: boolean | null
          market_type: string
          name: string
          position_sizing?: Json | null
          risk_limits?: Json | null
          status?: string | null
          timeframe: string
          updated_at?: string
          user_id: string
          validation_result?: Json | null
          version?: number | null
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string | null
          entry_rules?: Json
          exit_rules?: Json
          id?: string
          is_public?: boolean | null
          market_type?: string
          name?: string
          position_sizing?: Json | null
          risk_limits?: Json | null
          status?: string | null
          timeframe?: string
          updated_at?: string
          user_id?: string
          validation_result?: Json | null
          version?: number | null
        }
        Relationships: []
      }
      strategy_versions: {
        Row: {
          change_summary: string | null
          config_snapshot: Json
          created_at: string
          created_by: string | null
          id: string
          strategy_id: string
          version: number
        }
        Insert: {
          change_summary?: string | null
          config_snapshot: Json
          created_at?: string
          created_by?: string | null
          id?: string
          strategy_id: string
          version: number
        }
        Update: {
          change_summary?: string | null
          config_snapshot?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          strategy_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "strategy_versions_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          features: Json
          id: string
          is_active: boolean | null
          limits: Json
          name: string
          price_monthly: number | null
          price_yearly: number | null
          region: string | null
          tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean | null
          limits?: Json
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
          region?: string | null
          tier: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean | null
          limits?: Json
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
          region?: string | null
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_audit_log: {
        Args: {
          _action: string
          _details?: Json
          _new_values?: Json
          _old_values?: Json
          _resource_id?: string
          _resource_type: string
        }
        Returns: string
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      owns_paper_account: { Args: { _account_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "retail" | "pro" | "b2b_admin" | "b2b_member" | "admin"
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
      app_role: ["retail", "pro", "b2b_admin", "b2b_member", "admin"],
    },
  },
} as const

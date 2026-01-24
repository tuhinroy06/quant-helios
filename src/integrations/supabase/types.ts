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
      behavior_signals: {
        Row: {
          behavior: string
          confidence: number
          detected_at: string
          id: string
          strategy_id: string | null
          strength: number
          user_id: string
          window_end: string | null
          window_start: string | null
        }
        Insert: {
          behavior: string
          confidence: number
          detected_at?: string
          id?: string
          strategy_id?: string | null
          strength: number
          user_id: string
          window_end?: string | null
          window_start?: string | null
        }
        Update: {
          behavior?: string
          confidence?: number
          detected_at?: string
          id?: string
          strategy_id?: string | null
          strength?: number
          user_id?: string
          window_end?: string | null
          window_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "behavior_signals_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_connections: {
        Row: {
          access_token_encrypted: string | null
          api_key_encrypted: string | null
          broker_name: string
          connected_at: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          token_expiry: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          api_key_encrypted?: string | null
          broker_name: string
          connected_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          token_expiry?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          api_key_encrypted?: string | null
          broker_name?: string
          connected_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          token_expiry?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      control_decisions: {
        Row: {
          admin_id: string | null
          created_at: string | null
          decided_at: string
          decision_id: string
          global_kill_override: boolean | null
          id: string
          new_state: string
          previous_state: string
          reason: string
          requires_manual_reset: boolean | null
          scope: string
          signals: Json | null
          target_id: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          decided_at: string
          decision_id: string
          global_kill_override?: boolean | null
          id?: string
          new_state: string
          previous_state: string
          reason: string
          requires_manual_reset?: boolean | null
          scope: string
          signals?: Json | null
          target_id: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          decided_at?: string
          decision_id?: string
          global_kill_override?: boolean | null
          id?: string
          new_state?: string
          previous_state?: string
          reason?: string
          requires_manual_reset?: boolean | null
          scope?: string
          signals?: Json | null
          target_id?: string
        }
        Relationships: []
      }
      control_signals: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          reason: string
          scope: string
          severity: number
          source: string
          target_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reason: string
          scope: string
          severity: number
          source: string
          target_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reason?: string
          scope?: string
          severity?: number
          source?: string
          target_id?: string
        }
        Relationships: []
      }
      control_states: {
        Row: {
          created_at: string | null
          id: string
          last_transition_at: string | null
          scope: string
          state: string
          target_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_transition_at?: string | null
          scope: string
          state?: string
          target_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_transition_at?: string | null
          scope?: string
          state?: string
          target_id?: string
          updated_at?: string | null
        }
        Relationships: []
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
      live_orders: {
        Row: {
          average_price: number | null
          broker_connection_id: string | null
          broker_order_id: string | null
          created_at: string | null
          error_message: string | null
          executed_at: string | null
          filled_quantity: number | null
          id: string
          order_type: string
          placed_at: string | null
          price: number | null
          quantity: number
          side: string
          status: string | null
          strategy_id: string | null
          symbol: string
          user_id: string
        }
        Insert: {
          average_price?: number | null
          broker_connection_id?: string | null
          broker_order_id?: string | null
          created_at?: string | null
          error_message?: string | null
          executed_at?: string | null
          filled_quantity?: number | null
          id?: string
          order_type: string
          placed_at?: string | null
          price?: number | null
          quantity: number
          side: string
          status?: string | null
          strategy_id?: string | null
          symbol: string
          user_id: string
        }
        Update: {
          average_price?: number | null
          broker_connection_id?: string | null
          broker_order_id?: string | null
          created_at?: string | null
          error_message?: string | null
          executed_at?: string | null
          filled_quantity?: number | null
          id?: string
          order_type?: string
          placed_at?: string | null
          price?: number | null
          quantity?: number
          side?: string
          status?: string | null
          strategy_id?: string | null
          symbol?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_orders_broker_connection_id_fkey"
            columns: ["broker_connection_id"]
            isOneToOne: false
            referencedRelation: "broker_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_orders_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      live_trading_configs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          broker_connection_id: string | null
          created_at: string | null
          daily_loss_limit: number | null
          id: string
          is_enabled: boolean | null
          max_position_size: number | null
          risk_acknowledged: boolean | null
          risk_acknowledged_at: string | null
          strategy_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          broker_connection_id?: string | null
          created_at?: string | null
          daily_loss_limit?: number | null
          id?: string
          is_enabled?: boolean | null
          max_position_size?: number | null
          risk_acknowledged?: boolean | null
          risk_acknowledged_at?: string | null
          strategy_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          broker_connection_id?: string | null
          created_at?: string | null
          daily_loss_limit?: number | null
          id?: string
          is_enabled?: boolean | null
          max_position_size?: number | null
          risk_acknowledged?: boolean | null
          risk_acknowledged_at?: string | null
          strategy_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_trading_configs_broker_connection_id_fkey"
            columns: ["broker_connection_id"]
            isOneToOne: false
            referencedRelation: "broker_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_trading_configs_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invites: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by: string
          organization_id: string
          role?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string | null
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_strategies: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          permissions: Json | null
          shared_by: string
          strategy_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          permissions?: Json | null
          shared_by: string
          strategy_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          permissions?: Json | null
          shared_by?: string
          strategy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_strategies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_strategies_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          max_members: number | null
          name: string
          settings: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          max_members?: number | null
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          max_members?: number | null
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string | null
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
          status: string | null
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
          status?: string | null
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
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      paper_positions: {
        Row: {
          account_id: string
          created_at: string | null
          entry_price: number
          id: string
          market: string
          opened_at: string
          quantity: number
          side: string
          status: string | null
          stop_loss: number
          strategy_id: string | null
          symbol: string
          take_profit: number | null
          unrealized_pnl: number | null
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          entry_price: number
          id?: string
          market?: string
          opened_at?: string
          quantity: number
          side: string
          status?: string | null
          stop_loss: number
          strategy_id?: string | null
          symbol: string
          take_profit?: number | null
          unrealized_pnl?: number | null
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          entry_price?: number
          id?: string
          market?: string
          opened_at?: string
          quantity?: number
          side?: string
          status?: string | null
          stop_loss?: number
          strategy_id?: string | null
          symbol?: string
          take_profit?: number | null
          unrealized_pnl?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "paper_positions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "paper_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paper_positions_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      paper_trade_logs: {
        Row: {
          created_at: string
          event_type: string
          id: string
          message: string
          metadata: Json | null
          trade_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          message: string
          metadata?: Json | null
          trade_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          message?: string
          metadata?: Json | null
          trade_id?: string | null
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
          market: string | null
          notes: string | null
          opened_at: string
          order_type: string | null
          pnl: number | null
          pnl_pct: number | null
          quantity: number
          reason: string | null
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
          market?: string | null
          notes?: string | null
          opened_at?: string
          order_type?: string | null
          pnl?: number | null
          pnl_pct?: number | null
          quantity: number
          reason?: string | null
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
          market?: string | null
          notes?: string | null
          opened_at?: string
          order_type?: string | null
          pnl?: number | null
          pnl_pct?: number | null
          quantity?: number
          reason?: string | null
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
      stock_rankings: {
        Row: {
          ai_analysis: string | null
          company_name: string | null
          created_at: string | null
          id: string
          last_updated: string | null
          market_cap_tier: string | null
          model_version: string | null
          momentum_score: number | null
          quality_score: number | null
          rank_score: number | null
          sector: string | null
          symbol: string
          user_id: string
          value_score: number | null
          volatility_score: number | null
        }
        Insert: {
          ai_analysis?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          market_cap_tier?: string | null
          model_version?: string | null
          momentum_score?: number | null
          quality_score?: number | null
          rank_score?: number | null
          sector?: string | null
          symbol: string
          user_id: string
          value_score?: number | null
          volatility_score?: number | null
        }
        Update: {
          ai_analysis?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          market_cap_tier?: string | null
          model_version?: string | null
          momentum_score?: number | null
          quality_score?: number | null
          rank_score?: number | null
          sector?: string | null
          symbol?: string
          user_id?: string
          value_score?: number | null
          volatility_score?: number | null
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
          health_status: string | null
          id: string
          is_public: boolean | null
          last_health_check: string | null
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
          health_status?: string | null
          id?: string
          is_public?: boolean | null
          last_health_check?: string | null
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
          health_status?: string | null
          id?: string
          is_public?: boolean | null
          last_health_check?: string | null
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
      strategy_health_reports: {
        Row: {
          behavior_flags: Json | null
          degradation_reasons: Json | null
          execution_risk_breakdown: Json | null
          generated_at: string
          health_delta: number | null
          health_score: number
          health_status: string
          id: string
          is_deteriorating: boolean | null
          is_improving: boolean | null
          logic_stability_by_regime: Json | null
          logic_stability_score: number | null
          recommended_action: string
          strategy_id: string
          user_id: string
          window_trades: number
        }
        Insert: {
          behavior_flags?: Json | null
          degradation_reasons?: Json | null
          execution_risk_breakdown?: Json | null
          generated_at?: string
          health_delta?: number | null
          health_score: number
          health_status: string
          id?: string
          is_deteriorating?: boolean | null
          is_improving?: boolean | null
          logic_stability_by_regime?: Json | null
          logic_stability_score?: number | null
          recommended_action: string
          strategy_id: string
          user_id: string
          window_trades: number
        }
        Update: {
          behavior_flags?: Json | null
          degradation_reasons?: Json | null
          execution_risk_breakdown?: Json | null
          generated_at?: string
          health_delta?: number | null
          health_score?: number
          health_status?: string
          id?: string
          is_deteriorating?: boolean | null
          is_improving?: boolean | null
          logic_stability_by_regime?: Json | null
          logic_stability_score?: number | null
          recommended_action?: string
          strategy_id?: string
          user_id?: string
          window_trades?: number
        }
        Relationships: [
          {
            foreignKeyName: "strategy_health_reports_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
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
      trade_attributions: {
        Row: {
          created_at: string
          execution_sub_type: string | null
          id: string
          liquidity_regime: string | null
          pnl: number
          primary_cause: string
          stop_loss_hit: boolean | null
          strategy_id: string
          take_profit_hit: boolean | null
          timestamp: string
          trade_id: string | null
          trade_source: string | null
          user_id: string
          volatility_regime: string | null
        }
        Insert: {
          created_at?: string
          execution_sub_type?: string | null
          id?: string
          liquidity_regime?: string | null
          pnl: number
          primary_cause: string
          stop_loss_hit?: boolean | null
          strategy_id: string
          take_profit_hit?: boolean | null
          timestamp: string
          trade_id?: string | null
          trade_source?: string | null
          user_id: string
          volatility_regime?: string | null
        }
        Update: {
          created_at?: string
          execution_sub_type?: string | null
          id?: string
          liquidity_regime?: string | null
          pnl?: number
          primary_cause?: string
          stop_loss_hit?: boolean | null
          strategy_id?: string
          take_profit_hit?: boolean | null
          timestamp?: string
          trade_id?: string | null
          trade_source?: string | null
          user_id?: string
          volatility_regime?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trade_attributions_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
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
      is_org_admin: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      owns_paper_account: { Args: { _account_id: string }; Returns: boolean }
      owns_paper_position: { Args: { position_id: string }; Returns: boolean }
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

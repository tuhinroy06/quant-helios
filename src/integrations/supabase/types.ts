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
      attribution_reports: {
        Row: {
          confidence_score: number
          contributing_factors: string[] | null
          counterfactuals: Json | null
          created_at: string
          determinism_hash: string
          duration_seconds: number
          entry_price: number
          evidence: Json
          execution_sub_type: string | null
          exit_price: number
          generated_at: string
          id: string
          instrument: string
          primary_cause: string
          quantity: number
          realized_pnl: number
          return_pct: number
          ruled_out_causes: string[] | null
          strategy_id: string
          trade_id: string
          user_id: string
        }
        Insert: {
          confidence_score: number
          contributing_factors?: string[] | null
          counterfactuals?: Json | null
          created_at?: string
          determinism_hash: string
          duration_seconds: number
          entry_price: number
          evidence: Json
          execution_sub_type?: string | null
          exit_price: number
          generated_at?: string
          id?: string
          instrument: string
          primary_cause: string
          quantity: number
          realized_pnl: number
          return_pct: number
          ruled_out_causes?: string[] | null
          strategy_id: string
          trade_id: string
          user_id: string
        }
        Update: {
          confidence_score?: number
          contributing_factors?: string[] | null
          counterfactuals?: Json | null
          created_at?: string
          determinism_hash?: string
          duration_seconds?: number
          entry_price?: number
          evidence?: Json
          execution_sub_type?: string | null
          exit_price?: number
          generated_at?: string
          id?: string
          instrument?: string
          primary_cause?: string
          quantity?: number
          realized_pnl?: number
          return_pct?: number
          ruled_out_causes?: string[] | null
          strategy_id?: string
          trade_id?: string
          user_id?: string
        }
        Relationships: []
      }
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
          category: string | null
          confidence: number
          context: Json | null
          detected_at: string
          id: string
          severity: string | null
          strategy_id: string | null
          strength: number
          trade_id: string | null
          user_id: string
          window_end: string | null
          window_start: string | null
        }
        Insert: {
          behavior: string
          category?: string | null
          confidence: number
          context?: Json | null
          detected_at?: string
          id?: string
          severity?: string | null
          strategy_id?: string | null
          strength: number
          trade_id?: string | null
          user_id: string
          window_end?: string | null
          window_start?: string | null
        }
        Update: {
          behavior?: string
          category?: string | null
          confidence?: number
          context?: Json | null
          detected_at?: string
          id?: string
          severity?: string | null
          strategy_id?: string | null
          strength?: number
          trade_id?: string | null
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
      data_integrity_logs: {
        Row: {
          created_at: string | null
          error_code: string
          error_message: string | null
          id: string
          symbol: string
          tick_price: number | null
          tick_timestamp: number | null
          tick_volume: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_code: string
          error_message?: string | null
          id?: string
          symbol: string
          tick_price?: number | null
          tick_timestamp?: number | null
          tick_volume?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_code?: string
          error_message?: string | null
          id?: string
          symbol?: string
          tick_price?: number | null
          tick_timestamp?: number | null
          tick_volume?: number | null
          user_id?: string
        }
        Relationships: []
      }
      emergency_events: {
        Row: {
          account_id: string | null
          activated_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          positions_closed: number | null
          reason: string
          total_pnl: number | null
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          activated_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          positions_closed?: number | null
          reason: string
          total_pnl?: number | null
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          activated_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          positions_closed?: number | null
          reason?: string
          total_pnl?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      execution_configs: {
        Row: {
          broker_mode: string
          created_at: string | null
          data_mode: string
          id: string
          is_active: boolean | null
          latency_ms: number | null
          name: string
          partial_fill_rate: number | null
          partial_fills_enabled: boolean | null
          slippage_bps: number | null
          updated_at: string | null
          use_transaction_costs: boolean | null
          user_id: string
        }
        Insert: {
          broker_mode?: string
          created_at?: string | null
          data_mode?: string
          id?: string
          is_active?: boolean | null
          latency_ms?: number | null
          name?: string
          partial_fill_rate?: number | null
          partial_fills_enabled?: boolean | null
          slippage_bps?: number | null
          updated_at?: string | null
          use_transaction_costs?: boolean | null
          user_id: string
        }
        Update: {
          broker_mode?: string
          created_at?: string | null
          data_mode?: string
          id?: string
          is_active?: boolean | null
          latency_ms?: number | null
          name?: string
          partial_fill_rate?: number | null
          partial_fills_enabled?: boolean | null
          slippage_bps?: number | null
          updated_at?: string | null
          use_transaction_costs?: boolean | null
          user_id?: string
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
      health_heartbeats: {
        Row: {
          account_id: string
          accounts_status: Json | null
          created_at: string | null
          id: string
          status: string
          system_health: Json | null
          uptime_seconds: number | null
        }
        Insert: {
          account_id: string
          accounts_status?: Json | null
          created_at?: string | null
          id?: string
          status: string
          system_health?: Json | null
          uptime_seconds?: number | null
        }
        Update: {
          account_id?: string
          accounts_status?: Json | null
          created_at?: string | null
          id?: string
          status?: string
          system_health?: Json | null
          uptime_seconds?: number | null
        }
        Relationships: []
      }
      immutable_configs: {
        Row: {
          account_id: string
          config_data: Json
          config_hash: string
          created_at: string | null
          id: string
          run_id: string
          time_source: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          account_id: string
          config_data: Json
          config_hash: string
          created_at?: string | null
          id?: string
          run_id: string
          time_source?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          account_id?: string
          config_data?: Json
          config_hash?: string
          created_at?: string | null
          id?: string
          run_id?: string
          time_source?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "immutable_configs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "paper_accounts"
            referencedColumns: ["id"]
          },
        ]
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
      live_safety_configs: {
        Row: {
          account_id: string | null
          completed_at: string | null
          created_at: string | null
          days_active: number | null
          disable_auto_reenable: boolean | null
          enabled: boolean | null
          id: string
          max_concurrent_positions: number | null
          max_daily_loss_override: number | null
          max_drawdown_override: number | null
          position_size_multiplier: number | null
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          days_active?: number | null
          disable_auto_reenable?: boolean | null
          enabled?: boolean | null
          id?: string
          max_concurrent_positions?: number | null
          max_daily_loss_override?: number | null
          max_drawdown_override?: number | null
          position_size_multiplier?: number | null
          start_date?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          days_active?: number | null
          disable_auto_reenable?: boolean | null
          enabled?: boolean | null
          id?: string
          max_concurrent_positions?: number | null
          max_daily_loss_override?: number | null
          max_drawdown_override?: number | null
          position_size_multiplier?: number | null
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_safety_configs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "paper_accounts"
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
      llm_explanation_contracts: {
        Row: {
          allowed_facts: Json
          attribution_report_id: string | null
          created_at: string
          explanation_goals: string[] | null
          forbidden_topics: string[]
          id: string
          llm_response: string | null
          refusal_conditions: Json | null
          required_references: Json | null
          response_valid: boolean | null
          response_violations: string[] | null
          scope_contract: Json | null
          tone: string | null
          updated_at: string
          user_id: string
          validation_requirements: Json | null
        }
        Insert: {
          allowed_facts: Json
          attribution_report_id?: string | null
          created_at?: string
          explanation_goals?: string[] | null
          forbidden_topics: string[]
          id?: string
          llm_response?: string | null
          refusal_conditions?: Json | null
          required_references?: Json | null
          response_valid?: boolean | null
          response_violations?: string[] | null
          scope_contract?: Json | null
          tone?: string | null
          updated_at?: string
          user_id: string
          validation_requirements?: Json | null
        }
        Update: {
          allowed_facts?: Json
          attribution_report_id?: string | null
          created_at?: string
          explanation_goals?: string[] | null
          forbidden_topics?: string[]
          id?: string
          llm_response?: string | null
          refusal_conditions?: Json | null
          required_references?: Json | null
          response_valid?: boolean | null
          response_violations?: string[] | null
          scope_contract?: Json | null
          tone?: string | null
          updated_at?: string
          user_id?: string
          validation_requirements?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "llm_explanation_contracts_attribution_report_id_fkey"
            columns: ["attribution_report_id"]
            isOneToOne: false
            referencedRelation: "attribution_reports"
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
      position_sizing_configs: {
        Row: {
          account_id: string | null
          atr_multiplier: number | null
          confidence_weighting: boolean | null
          created_at: string | null
          id: string
          max_position_size: number
          min_position_size: number
          risk_per_trade_pct: number
          updated_at: string | null
          use_atr_stops: boolean | null
          user_id: string
          volatility_adjustment: boolean | null
        }
        Insert: {
          account_id?: string | null
          atr_multiplier?: number | null
          confidence_weighting?: boolean | null
          created_at?: string | null
          id?: string
          max_position_size?: number
          min_position_size?: number
          risk_per_trade_pct?: number
          updated_at?: string | null
          use_atr_stops?: boolean | null
          user_id: string
          volatility_adjustment?: boolean | null
        }
        Update: {
          account_id?: string | null
          atr_multiplier?: number | null
          confidence_weighting?: boolean | null
          created_at?: string | null
          id?: string
          max_position_size?: number
          min_position_size?: number
          risk_per_trade_pct?: number
          updated_at?: string | null
          use_atr_stops?: boolean | null
          user_id?: string
          volatility_adjustment?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "position_sizing_configs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "paper_accounts"
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
      reconciliation_broker_fills: {
        Row: {
          broker_account_id: string
          broker_name: string
          broker_order_id: string
          commission: number | null
          created_at: string
          fill_id: string
          id: string
          is_reconciled: boolean | null
          price: number
          quantity: number
          raw_data: Json | null
          reconciled_at: string | null
          side: string
          strategy_id: string | null
          symbol: string
          timestamp: string
          user_id: string
        }
        Insert: {
          broker_account_id: string
          broker_name: string
          broker_order_id: string
          commission?: number | null
          created_at?: string
          fill_id: string
          id?: string
          is_reconciled?: boolean | null
          price: number
          quantity: number
          raw_data?: Json | null
          reconciled_at?: string | null
          side: string
          strategy_id?: string | null
          symbol: string
          timestamp: string
          user_id: string
        }
        Update: {
          broker_account_id?: string
          broker_name?: string
          broker_order_id?: string
          commission?: number | null
          created_at?: string
          fill_id?: string
          id?: string
          is_reconciled?: boolean | null
          price?: number
          quantity?: number
          raw_data?: Json | null
          reconciled_at?: string | null
          side?: string
          strategy_id?: string | null
          symbol?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      reconciliation_capital_snapshots: {
        Row: {
          available_capital: number
          broker_account_id: string
          broker_name: string
          cash_balance: number
          created_at: string
          discrepancy: number | null
          discrepancy_pct: number | null
          id: string
          internal_equity: number | null
          is_reconciled: boolean | null
          positions_value: number | null
          snapshot_timestamp: string
          total_equity: number
          unrealized_pnl: number | null
          used_margin: number | null
          user_id: string
        }
        Insert: {
          available_capital: number
          broker_account_id: string
          broker_name: string
          cash_balance: number
          created_at?: string
          discrepancy?: number | null
          discrepancy_pct?: number | null
          id?: string
          internal_equity?: number | null
          is_reconciled?: boolean | null
          positions_value?: number | null
          snapshot_timestamp: string
          total_equity: number
          unrealized_pnl?: number | null
          used_margin?: number | null
          user_id: string
        }
        Update: {
          available_capital?: number
          broker_account_id?: string
          broker_name?: string
          cash_balance?: number
          created_at?: string
          discrepancy?: number | null
          discrepancy_pct?: number | null
          id?: string
          internal_equity?: number | null
          is_reconciled?: boolean | null
          positions_value?: number | null
          snapshot_timestamp?: string
          total_equity?: number
          unrealized_pnl?: number | null
          used_margin?: number | null
          user_id?: string
        }
        Relationships: []
      }
      reconciliation_cycles: {
        Row: {
          capital_checked: boolean | null
          completed_at: string | null
          created_at: string
          cycle_number: number
          diffs_found: number | null
          error_message: string | null
          escalations_created: number | null
          fills_checked: number | null
          global_freeze_triggered: boolean | null
          id: string
          metrics: Json | null
          mode: string
          orders_checked: number | null
          positions_checked: number | null
          repairs_applied: number | null
          started_at: string
          status: string
          user_id: string | null
        }
        Insert: {
          capital_checked?: boolean | null
          completed_at?: string | null
          created_at?: string
          cycle_number: number
          diffs_found?: number | null
          error_message?: string | null
          escalations_created?: number | null
          fills_checked?: number | null
          global_freeze_triggered?: boolean | null
          id?: string
          metrics?: Json | null
          mode: string
          orders_checked?: number | null
          positions_checked?: number | null
          repairs_applied?: number | null
          started_at?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          capital_checked?: boolean | null
          completed_at?: string | null
          created_at?: string
          cycle_number?: number
          diffs_found?: number | null
          error_message?: string | null
          escalations_created?: number | null
          fills_checked?: number | null
          global_freeze_triggered?: boolean | null
          id?: string
          metrics?: Json | null
          mode?: string
          orders_checked?: number | null
          positions_checked?: number | null
          repairs_applied?: number | null
          started_at?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      reconciliation_escalation_events: {
        Row: {
          action_taken: string
          broker_account_id: string
          created_at: string
          diff_count: number | null
          event_id: string
          id: string
          is_resolved: boolean | null
          metadata: Json | null
          reason: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          strategy_id: string | null
          timestamp: string
          user_id: string
        }
        Insert: {
          action_taken: string
          broker_account_id: string
          created_at?: string
          diff_count?: number | null
          event_id: string
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          reason: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          strategy_id?: string | null
          timestamp?: string
          user_id: string
        }
        Update: {
          action_taken?: string
          broker_account_id?: string
          created_at?: string
          diff_count?: number | null
          event_id?: string
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          reason?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          strategy_id?: string | null
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      reconciliation_fingerprint_cache: {
        Row: {
          applied_at: string
          created_at: string
          diff_type: string | null
          expires_at: string
          fingerprint: string
          id: string
          strategy_id: string | null
          user_id: string | null
        }
        Insert: {
          applied_at?: string
          created_at?: string
          diff_type?: string | null
          expires_at: string
          fingerprint: string
          id?: string
          strategy_id?: string | null
          user_id?: string | null
        }
        Update: {
          applied_at?: string
          created_at?: string
          diff_type?: string | null
          expires_at?: string
          fingerprint?: string
          id?: string
          strategy_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      reconciliation_freeze_states: {
        Row: {
          created_at: string
          frozen_at: string
          frozen_by: string | null
          frozen_reason: string
          id: string
          is_frozen: boolean
          metadata: Json | null
          requires_manual_reset: boolean | null
          scope: string
          target_id: string
          unfrozen_at: string | null
          unfrozen_by: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          frozen_at?: string
          frozen_by?: string | null
          frozen_reason: string
          id?: string
          is_frozen?: boolean
          metadata?: Json | null
          requires_manual_reset?: boolean | null
          scope: string
          target_id: string
          unfrozen_at?: string | null
          unfrozen_by?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          frozen_at?: string
          frozen_by?: string | null
          frozen_reason?: string
          id?: string
          is_frozen?: boolean
          metadata?: Json | null
          requires_manual_reset?: boolean | null
          scope?: string
          target_id?: string
          unfrozen_at?: string | null
          unfrozen_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reconciliation_repair_records: {
        Row: {
          action_taken: string
          broker_account_id: string
          confidence: string
          created_at: string
          description: string
          diff_severity: string
          diff_status: string
          fingerprint: string
          id: string
          metadata: Json | null
          mode: string
          monetary_impact: number | null
          reason: string
          repair_id: string
          side_effects: Json
          strategy_id: string | null
          timestamp: string
          user_id: string
          was_applied: boolean
        }
        Insert: {
          action_taken: string
          broker_account_id: string
          confidence: string
          created_at?: string
          description: string
          diff_severity: string
          diff_status: string
          fingerprint: string
          id?: string
          metadata?: Json | null
          mode: string
          monetary_impact?: number | null
          reason: string
          repair_id: string
          side_effects?: Json
          strategy_id?: string | null
          timestamp?: string
          user_id: string
          was_applied?: boolean
        }
        Update: {
          action_taken?: string
          broker_account_id?: string
          confidence?: string
          created_at?: string
          description?: string
          diff_severity?: string
          diff_status?: string
          fingerprint?: string
          id?: string
          metadata?: Json | null
          mode?: string
          monetary_impact?: number | null
          reason?: string
          repair_id?: string
          side_effects?: Json
          strategy_id?: string | null
          timestamp?: string
          user_id?: string
          was_applied?: boolean
        }
        Relationships: []
      }
      screener_presets: {
        Row: {
          created_at: string
          description: string | null
          filters: Json
          id: string
          is_default: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          filters?: Json
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          filters?: Json
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      signed_daily_summaries: {
        Row: {
          account_id: string
          config_hash: string
          created_at: string | null
          data_hash: string
          final_cash: number
          final_equity: number
          id: string
          max_drawdown: number | null
          num_trades: number
          signature: string
          summary_data: Json
          summary_date: string
          total_costs: number
          total_gross_pnl: number
          total_net_pnl: number
          trade_hashes: Json | null
          user_id: string
        }
        Insert: {
          account_id: string
          config_hash: string
          created_at?: string | null
          data_hash: string
          final_cash: number
          final_equity: number
          id?: string
          max_drawdown?: number | null
          num_trades?: number
          signature: string
          summary_data: Json
          summary_date: string
          total_costs?: number
          total_gross_pnl?: number
          total_net_pnl?: number
          trade_hashes?: Json | null
          user_id: string
        }
        Update: {
          account_id?: string
          config_hash?: string
          created_at?: string | null
          data_hash?: string
          final_cash?: number
          final_equity?: number
          id?: string
          max_drawdown?: number | null
          num_trades?: number
          signature?: string
          summary_data?: Json
          summary_date?: string
          total_costs?: number
          total_gross_pnl?: number
          total_net_pnl?: number
          trade_hashes?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signed_daily_summaries_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "paper_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      signed_trade_ledger: {
        Row: {
          account_id: string
          config_hash: string
          created_at: string | null
          entry_price: number
          exit_price: number
          exit_reason: string
          gross_pnl: number
          id: string
          net_pnl: number
          quantity: number
          signature: string
          strategy: string
          symbol: string
          total_costs: number
          trade_hash: string
          trade_id: string | null
          trade_timestamp: number
          user_id: string
        }
        Insert: {
          account_id: string
          config_hash: string
          created_at?: string | null
          entry_price: number
          exit_price: number
          exit_reason: string
          gross_pnl: number
          id?: string
          net_pnl: number
          quantity: number
          signature: string
          strategy: string
          symbol: string
          total_costs: number
          trade_hash: string
          trade_id?: string | null
          trade_timestamp: number
          user_id: string
        }
        Update: {
          account_id?: string
          config_hash?: string
          created_at?: string | null
          entry_price?: number
          exit_price?: number
          exit_reason?: string
          gross_pnl?: number
          id?: string
          net_pnl?: number
          quantity?: number
          signature?: string
          strategy?: string
          symbol?: string
          total_costs?: number
          trade_hash?: string
          trade_id?: string | null
          trade_timestamp?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signed_trade_ledger_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "paper_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_price_cache: {
        Row: {
          change: number | null
          change_percent: number | null
          day_high: number | null
          day_low: number | null
          last_updated: string | null
          price: number
          source: string | null
          symbol: string
          volume: number | null
          yahoo_symbol: string | null
        }
        Insert: {
          change?: number | null
          change_percent?: number | null
          day_high?: number | null
          day_low?: number | null
          last_updated?: string | null
          price: number
          source?: string | null
          symbol: string
          volume?: number | null
          yahoo_symbol?: string | null
        }
        Update: {
          change?: number | null
          change_percent?: number | null
          day_high?: number | null
          day_low?: number | null
          last_updated?: string | null
          price?: number
          source?: string | null
          symbol?: string
          volume?: number | null
          yahoo_symbol?: string | null
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
      strategy_capital_allocations: {
        Row: {
          account_id: string
          allocated_capital: number
          allocated_pct: number
          created_at: string | null
          enabled: boolean | null
          id: string
          max_drawdown_pct: number
          peak_capital: number
          strategy: string
          updated_at: string | null
          used_capital: number
          user_id: string
        }
        Insert: {
          account_id: string
          allocated_capital?: number
          allocated_pct: number
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          max_drawdown_pct?: number
          peak_capital?: number
          strategy: string
          updated_at?: string | null
          used_capital?: number
          user_id: string
        }
        Update: {
          account_id?: string
          allocated_capital?: number
          allocated_pct?: number
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          max_drawdown_pct?: number
          peak_capital?: number
          strategy?: string
          updated_at?: string | null
          used_capital?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_capital_allocations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "paper_accounts"
            referencedColumns: ["id"]
          },
        ]
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
          frozen: boolean | null
          id: string
          performance_metrics: Json | null
          strategy_id: string
          version: number
        }
        Insert: {
          change_summary?: string | null
          config_snapshot: Json
          created_at?: string
          created_by?: string | null
          frozen?: boolean | null
          id?: string
          performance_metrics?: Json | null
          strategy_id: string
          version: number
        }
        Update: {
          change_summary?: string | null
          config_snapshot?: Json
          created_at?: string
          created_by?: string | null
          frozen?: boolean | null
          id?: string
          performance_metrics?: Json | null
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
      streak_analyses: {
        Row: {
          account_id: string | null
          avg_pnl: number | null
          avg_volatility: number | null
          behaviors: Json
          created_at: string
          explanation_id: string | null
          id: string
          strategy_id: string | null
          streak_end: string
          streak_start: string
          streak_type: string
          total_pnl: number
          trade_count: number
          trade_ids: Json
          user_id: string
        }
        Insert: {
          account_id?: string | null
          avg_pnl?: number | null
          avg_volatility?: number | null
          behaviors?: Json
          created_at?: string
          explanation_id?: string | null
          id?: string
          strategy_id?: string | null
          streak_end?: string
          streak_start?: string
          streak_type?: string
          total_pnl?: number
          trade_count?: number
          trade_ids?: Json
          user_id: string
        }
        Update: {
          account_id?: string | null
          avg_pnl?: number | null
          avg_volatility?: number | null
          behaviors?: Json
          created_at?: string
          explanation_id?: string | null
          id?: string
          strategy_id?: string | null
          streak_end?: string
          streak_start?: string
          streak_type?: string
          total_pnl?: number
          trade_count?: number
          trade_ids?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "streak_analyses_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "paper_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "streak_analyses_strategy_id_fkey"
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
      system_health_logs: {
        Row: {
          account_id: string
          cpu_percent: number | null
          created_at: string | null
          disk_free_gb: number | null
          disk_percent: number | null
          errors: Json | null
          id: string
          is_healthy: boolean | null
          memory_percent: number | null
          warnings: Json | null
        }
        Insert: {
          account_id: string
          cpu_percent?: number | null
          created_at?: string | null
          disk_free_gb?: number | null
          disk_percent?: number | null
          errors?: Json | null
          id?: string
          is_healthy?: boolean | null
          memory_percent?: number | null
          warnings?: Json | null
        }
        Update: {
          account_id?: string
          cpu_percent?: number | null
          created_at?: string | null
          disk_free_gb?: number | null
          disk_percent?: number | null
          errors?: Json | null
          id?: string
          is_healthy?: boolean | null
          memory_percent?: number | null
          warnings?: Json | null
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
      trade_explanations: {
        Row: {
          account_id: string | null
          attribution: Json | null
          behaviors: Json | null
          causation: string | null
          created_at: string
          explanation_text: string
          explanation_type: string
          id: string
          market_context: string | null
          observations: Json | null
          priority_score: number | null
          risk_interaction: string | null
          sanitized_payload: Json | null
          severity: string | null
          strategy_id: string | null
          summary: string | null
          total_pnl: number | null
          trade_count: number | null
          trade_id: string
          updated_at: string
          user_id: string | null
          validated: boolean | null
        }
        Insert: {
          account_id?: string | null
          attribution?: Json | null
          behaviors?: Json | null
          causation?: string | null
          created_at?: string
          explanation_text: string
          explanation_type: string
          id?: string
          market_context?: string | null
          observations?: Json | null
          priority_score?: number | null
          risk_interaction?: string | null
          sanitized_payload?: Json | null
          severity?: string | null
          strategy_id?: string | null
          summary?: string | null
          total_pnl?: number | null
          trade_count?: number | null
          trade_id: string
          updated_at?: string
          user_id?: string | null
          validated?: boolean | null
        }
        Update: {
          account_id?: string | null
          attribution?: Json | null
          behaviors?: Json | null
          causation?: string | null
          created_at?: string
          explanation_text?: string
          explanation_type?: string
          id?: string
          market_context?: string | null
          observations?: Json | null
          priority_score?: number | null
          risk_interaction?: string | null
          sanitized_payload?: Json | null
          severity?: string | null
          strategy_id?: string | null
          summary?: string | null
          total_pnl?: number | null
          trade_count?: number | null
          trade_id?: string
          updated_at?: string
          user_id?: string | null
          validated?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "trade_explanations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "paper_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_explanations_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_accounts: {
        Row: {
          account_name: string
          account_type: string
          broker_session_id: string | null
          created_at: string | null
          current_cash: number
          enabled: boolean | null
          id: string
          initial_cash: number
          isolation_mode: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_name: string
          account_type?: string
          broker_session_id?: string | null
          created_at?: string | null
          current_cash?: number
          enabled?: boolean | null
          id?: string
          initial_cash?: number
          isolation_mode?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_name?: string
          account_type?: string
          broker_session_id?: string | null
          created_at?: string | null
          current_cash?: number
          enabled?: boolean | null
          id?: string
          initial_cash?: number
          isolation_mode?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trading_state_snapshots: {
        Row: {
          account_id: string
          cash: number
          config_hash: string
          config_run_id: string
          created_at: string | null
          equity: number
          id: string
          is_latest: boolean | null
          kill_switch_state: Json | null
          ml_state: Json | null
          open_orders: Json | null
          positions: Json | null
          strategy_allocations: Json | null
          trades_count: number | null
          user_id: string
        }
        Insert: {
          account_id: string
          cash: number
          config_hash: string
          config_run_id: string
          created_at?: string | null
          equity: number
          id?: string
          is_latest?: boolean | null
          kill_switch_state?: Json | null
          ml_state?: Json | null
          open_orders?: Json | null
          positions?: Json | null
          strategy_allocations?: Json | null
          trades_count?: number | null
          user_id: string
        }
        Update: {
          account_id?: string
          cash?: number
          config_hash?: string
          config_run_id?: string
          created_at?: string | null
          equity?: number
          id?: string
          is_latest?: boolean | null
          kill_switch_state?: Json | null
          ml_state?: Json | null
          open_orders?: Json | null
          positions?: Json | null
          strategy_allocations?: Json | null
          trades_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trading_state_snapshots_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "paper_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_cost_configs: {
        Row: {
          brokerage_pct: number
          created_at: string | null
          exchange_txn_charge_pct: number
          gst_pct: number
          id: string
          is_default: boolean | null
          max_brokerage_per_order: number
          name: string
          sebi_charge_pct: number
          stamp_duty_pct: number
          stt_sell_pct: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brokerage_pct?: number
          created_at?: string | null
          exchange_txn_charge_pct?: number
          gst_pct?: number
          id?: string
          is_default?: boolean | null
          max_brokerage_per_order?: number
          name?: string
          sebi_charge_pct?: number
          stamp_duty_pct?: number
          stt_sell_pct?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brokerage_pct?: number
          created_at?: string | null
          exchange_txn_charge_pct?: number
          gst_pct?: number
          id?: string
          is_default?: boolean | null
          max_brokerage_per_order?: number
          name?: string
          sebi_charge_pct?: number
          stamp_duty_pct?: number
          stt_sell_pct?: number
          updated_at?: string | null
          user_id?: string
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
      cleanup_expired_fingerprints: { Args: never; Returns: undefined }
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

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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      account_deletion_requests: {
        Row: {
          deleted_data_summary: Json | null
          executed_at: string | null
          id: string
          ip_address: string | null
          reason: string | null
          requested_at: string
          status: string
          user_agent: string | null
          user_email: string
          user_id: string
        }
        Insert: {
          deleted_data_summary?: Json | null
          executed_at?: string | null
          id?: string
          ip_address?: string | null
          reason?: string | null
          requested_at?: string
          status?: string
          user_agent?: string | null
          user_email: string
          user_id: string
        }
        Update: {
          deleted_data_summary?: Json | null
          executed_at?: string | null
          id?: string
          ip_address?: string | null
          reason?: string | null
          requested_at?: string
          status?: string
          user_agent?: string | null
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_chat_queries: {
        Row: {
          ai_answer: string
          audience: string
          created_at: string
          id: string
          moderated_at: string | null
          published_at: string | null
          question: string
          seo_description: string | null
          seo_title: string | null
          slug: string | null
          status: string
          tags: string[] | null
          user_id: string | null
          views_count: number
        }
        Insert: {
          ai_answer: string
          audience?: string
          created_at?: string
          id?: string
          moderated_at?: string | null
          published_at?: string | null
          question: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          status?: string
          tags?: string[] | null
          user_id?: string | null
          views_count?: number
        }
        Update: {
          ai_answer?: string
          audience?: string
          created_at?: string
          id?: string
          moderated_at?: string | null
          published_at?: string | null
          question?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          status?: string
          tags?: string[] | null
          user_id?: string | null
          views_count?: number
        }
        Relationships: []
      }
      ai_credit_transactions: {
        Row: {
          acting_user_id: string
          cabinet_id: string | null
          created_at: string
          credits_spent: number
          delegation_id: string | null
          delegation_kind: string | null
          id: string
          metadata: Json
          model_used: string | null
          operation_type: string
          payer_user_id: string | null
          tokens_in: number | null
          tokens_out: number | null
          wallet_id: string
        }
        Insert: {
          acting_user_id: string
          cabinet_id?: string | null
          created_at?: string
          credits_spent: number
          delegation_id?: string | null
          delegation_kind?: string | null
          id?: string
          metadata?: Json
          model_used?: string | null
          operation_type: string
          payer_user_id?: string | null
          tokens_in?: number | null
          tokens_out?: number | null
          wallet_id: string
        }
        Update: {
          acting_user_id?: string
          cabinet_id?: string | null
          created_at?: string
          credits_spent?: number
          delegation_id?: string | null
          delegation_kind?: string | null
          id?: string
          metadata?: Json
          model_used?: string | null
          operation_type?: string
          payer_user_id?: string | null
          tokens_in?: number | null
          tokens_out?: number | null
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_credit_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "ai_credit_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_credit_wallets: {
        Row: {
          auto_topup_enabled: boolean
          balance_credits: number
          created_at: string
          free_quota_period_start: string
          free_quota_used_this_month: number
          id: string
          low_balance_threshold: number
          owner_id: string
          owner_type: string
          updated_at: string
        }
        Insert: {
          auto_topup_enabled?: boolean
          balance_credits?: number
          created_at?: string
          free_quota_period_start?: string
          free_quota_used_this_month?: number
          id?: string
          low_balance_threshold?: number
          owner_id: string
          owner_type: string
          updated_at?: string
        }
        Update: {
          auto_topup_enabled?: boolean
          balance_credits?: number
          created_at?: string
          free_quota_period_start?: string
          free_quota_used_this_month?: number
          id?: string
          low_balance_threshold?: number
          owner_id?: string
          owner_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      article_revisions: {
        Row: {
          after_value: string | null
          article_slug: string
          author_email: string | null
          author_id: string | null
          before_value: string | null
          created_at: string
          field: string
          id: string
          source: string
        }
        Insert: {
          after_value?: string | null
          article_slug: string
          author_email?: string | null
          author_id?: string | null
          before_value?: string | null
          created_at?: string
          field: string
          id?: string
          source?: string
        }
        Update: {
          after_value?: string | null
          article_slug?: string
          author_email?: string | null
          author_id?: string | null
          before_value?: string | null
          created_at?: string
          field?: string
          id?: string
          source?: string
        }
        Relationships: []
      }
      auto_sign_rules: {
        Row: {
          cabinet_id: string
          contract_id: string
          created_at: string
          document_kinds: string[]
          enabled: boolean
          id: string
          last_changed_by: string
          max_amount_uah: number | null
          requires_trusted_review: boolean
          trusted_reviewer_user_ids: string[]
          updated_at: string
        }
        Insert: {
          cabinet_id: string
          contract_id: string
          created_at?: string
          document_kinds?: string[]
          enabled?: boolean
          id?: string
          last_changed_by: string
          max_amount_uah?: number | null
          requires_trusted_review?: boolean
          trusted_reviewer_user_ids?: string[]
          updated_at?: string
        }
        Update: {
          cabinet_id?: string
          contract_id?: string
          created_at?: string
          document_kinds?: string[]
          enabled?: boolean
          id?: string
          last_changed_by?: string
          max_amount_uah?: number | null
          requires_trusted_review?: boolean
          trusted_reviewer_user_ids?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_sign_rules_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "delegation_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      cabinet_chat_conversations: {
        Row: {
          cabinet_id: string
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cabinet_id: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cabinet_id?: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cabinet_chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          pin_label: string | null
          pinned: boolean
          role: string
          tool_payload: Json | null
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          pin_label?: string | null
          pinned?: boolean
          role: string
          tool_payload?: Json | null
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          pin_label?: string | null
          pinned?: boolean
          role?: string
          tool_payload?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cabinet_chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "cabinet_chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      cabinet_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          cabinet_id: string
          cabinet_name: string
          cabinet_type: string
          code: string
          created_at: string
          expires_at: string
          id: string
          invited_by: string
          invited_email: string
          personal_message: string | null
          role: string
          role_label: string
          status: Database["public"]["Enums"]["cabinet_invitation_status"]
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          cabinet_id: string
          cabinet_name: string
          cabinet_type: string
          code: string
          created_at?: string
          expires_at?: string
          id?: string
          invited_by: string
          invited_email: string
          personal_message?: string | null
          role: string
          role_label: string
          status?: Database["public"]["Enums"]["cabinet_invitation_status"]
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          cabinet_id?: string
          cabinet_name?: string
          cabinet_type?: string
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          invited_by?: string
          invited_email?: string
          personal_message?: string | null
          role?: string
          role_label?: string
          status?: Database["public"]["Enums"]["cabinet_invitation_status"]
          updated_at?: string
        }
        Relationships: []
      }
      cabinet_members: {
        Row: {
          cabinet_id: string
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          role: string
          status: Database["public"]["Enums"]["cabinet_member_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cabinet_id: string
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          role?: string
          status?: Database["public"]["Enums"]["cabinet_member_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cabinet_id?: string
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          role?: string
          status?: Database["public"]["Enums"]["cabinet_member_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cabinet_notification_preferences: {
        Row: {
          cabinet_id: string
          created_at: string
          id: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          cabinet_id: string
          created_at?: string
          id?: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          cabinet_id?: string
          created_at?: string
          id?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      catalog_invitations: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          publication_id: string
          used_at: string | null
          used_by_user_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          publication_id: string
          used_at?: string | null
          used_by_user_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          publication_id?: string
          used_at?: string | null
          used_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_invitations_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "catalog_publications"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_publications: {
        Row: {
          address: string | null
          category_key: string
          created_at: string
          display_name: string
          id: string
          kind: Database["public"]["Enums"]["catalog_publication_kind"]
          phone: string | null
          provider_cabinet_id: string
          public_booking_url: string | null
          short_description: string | null
          slug: string
          status: Database["public"]["Enums"]["catalog_publication_status"]
          terms_md: string | null
          updated_at: string
          visibility: Database["public"]["Enums"]["catalog_publication_visibility"]
        }
        Insert: {
          address?: string | null
          category_key: string
          created_at?: string
          display_name: string
          id?: string
          kind: Database["public"]["Enums"]["catalog_publication_kind"]
          phone?: string | null
          provider_cabinet_id: string
          public_booking_url?: string | null
          short_description?: string | null
          slug: string
          status?: Database["public"]["Enums"]["catalog_publication_status"]
          terms_md?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["catalog_publication_visibility"]
        }
        Update: {
          address?: string | null
          category_key?: string
          created_at?: string
          display_name?: string
          id?: string
          kind?: Database["public"]["Enums"]["catalog_publication_kind"]
          phone?: string | null
          provider_cabinet_id?: string
          public_booking_url?: string | null
          short_description?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["catalog_publication_status"]
          terms_md?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["catalog_publication_visibility"]
        }
        Relationships: []
      }
      catalog_subscriptions: {
        Row: {
          accepted_terms_at: string | null
          client_card_id: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          publication_id: string
          scope: Json
          status: Database["public"]["Enums"]["catalog_subscription_status"]
          subscriber_cabinet_id: string | null
          subscriber_user_id: string | null
          updated_at: string
        }
        Insert: {
          accepted_terms_at?: string | null
          client_card_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          publication_id: string
          scope?: Json
          status?: Database["public"]["Enums"]["catalog_subscription_status"]
          subscriber_cabinet_id?: string | null
          subscriber_user_id?: string | null
          updated_at?: string
        }
        Update: {
          accepted_terms_at?: string | null
          client_card_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          publication_id?: string
          scope?: Json
          status?: Database["public"]["Enums"]["catalog_subscription_status"]
          subscriber_cabinet_id?: string | null
          subscriber_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_subscriptions_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "catalog_publications"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_chat_messages: {
        Row: {
          created_at: string
          id: string
          parts: Json
          role: string
          thread_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parts?: Json
          role: string
          thread_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parts?: Json
          role?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "cms_chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_chat_threads: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cms_settings: {
        Row: {
          created_at: string
          key: string
          scope: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          key: string
          scope?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          created_at?: string
          key?: string
          scope?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      consultations: {
        Row: {
          answer: string
          audience: string
          created_at: string
          id: string
          published_at: string | null
          question: string
          search_vector: unknown
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          slug: string
          status: string
          tags: string[] | null
          views_count: number
        }
        Insert: {
          answer: string
          audience?: string
          created_at?: string
          id?: string
          published_at?: string | null
          question: string
          search_vector?: unknown
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          views_count?: number
        }
        Update: {
          answer?: string
          audience?: string
          created_at?: string
          id?: string
          published_at?: string | null
          question?: string
          search_vector?: unknown
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          views_count?: number
        }
        Relationships: []
      }
      content_idea_generations: {
        Row: {
          created_at: string
          created_by: string | null
          duration_ms: number | null
          error_message: string | null
          generated_content: string | null
          generated_seo_description: string | null
          generated_seo_title: string | null
          generated_title: string | null
          generated_tldr: string | null
          generated_word_count: number | null
          id: string
          idea_id: string
          model: string | null
          page_path: string
          prompt_audience: string | null
          prompt_content_target: string | null
          prompt_description: string | null
          prompt_tags: string[]
          prompt_topic: string
          source_ref: string | null
          status: string
          system_prompt_version: string | null
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          duration_ms?: number | null
          error_message?: string | null
          generated_content?: string | null
          generated_seo_description?: string | null
          generated_seo_title?: string | null
          generated_title?: string | null
          generated_tldr?: string | null
          generated_word_count?: number | null
          id?: string
          idea_id: string
          model?: string | null
          page_path: string
          prompt_audience?: string | null
          prompt_content_target?: string | null
          prompt_description?: string | null
          prompt_tags?: string[]
          prompt_topic: string
          source_ref?: string | null
          status?: string
          system_prompt_version?: string | null
          version: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          duration_ms?: number | null
          error_message?: string | null
          generated_content?: string | null
          generated_seo_description?: string | null
          generated_seo_title?: string | null
          generated_title?: string | null
          generated_tldr?: string | null
          generated_word_count?: number | null
          id?: string
          idea_id?: string
          model?: string | null
          page_path?: string
          prompt_audience?: string | null
          prompt_content_target?: string | null
          prompt_description?: string | null
          prompt_tags?: string[]
          prompt_topic?: string
          source_ref?: string | null
          status?: string
          system_prompt_version?: string | null
          version?: number
        }
        Relationships: []
      }
      content_ideas: {
        Row: {
          audience: string
          content_target: string
          created_at: string
          created_by: string | null
          description: string | null
          generated_article_id: string | null
          generated_at: string | null
          generated_content: string | null
          generated_seo_description: string | null
          generated_seo_title: string | null
          generated_tldr: string | null
          generated_word_count: number | null
          id: string
          page_path: string
          priority: number
          source: string
          source_ref: string | null
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string
          content_target?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          generated_article_id?: string | null
          generated_at?: string | null
          generated_content?: string | null
          generated_seo_description?: string | null
          generated_seo_title?: string | null
          generated_tldr?: string | null
          generated_word_count?: number | null
          id?: string
          page_path: string
          priority?: number
          source?: string
          source_ref?: string | null
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string
          content_target?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          generated_article_id?: string | null
          generated_at?: string | null
          generated_content?: string | null
          generated_seo_description?: string | null
          generated_seo_title?: string | null
          generated_tldr?: string | null
          generated_word_count?: number | null
          id?: string
          page_path?: string
          priority?: number
          source?: string
          source_ref?: string | null
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_certificates: {
        Row: {
          certificate_number: string
          course_id: string
          course_title: string
          email: string
          full_name: string
          id: string
          issued_at: string
          user_id: string | null
        }
        Insert: {
          certificate_number: string
          course_id: string
          course_title: string
          email: string
          full_name: string
          id?: string
          issued_at?: string
          user_id?: string | null
        }
        Update: {
          certificate_number?: string
          course_id?: string
          course_title?: string
          email?: string
          full_name?: string
          id?: string
          issued_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      delegation_contracts: {
        Row: {
          cabinet_id: string
          cabinet_owner_user_id: string
          contract_kind: string
          contract_number: string | null
          created_at: string
          delegate_kind: string
          delegate_user_id: string
          file_url: string | null
          id: string
          service_fee_terms: string | null
          signature_provider: string | null
          signed_at: string | null
          status: string
          terminated_at: string | null
          terms: Json
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          cabinet_id: string
          cabinet_owner_user_id: string
          contract_kind: string
          contract_number?: string | null
          created_at?: string
          delegate_kind: string
          delegate_user_id: string
          file_url?: string | null
          id?: string
          service_fee_terms?: string | null
          signature_provider?: string | null
          signed_at?: string | null
          status?: string
          terminated_at?: string | null
          terms?: Json
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          cabinet_id?: string
          cabinet_owner_user_id?: string
          contract_kind?: string
          contract_number?: string | null
          created_at?: string
          delegate_kind?: string
          delegate_user_id?: string
          file_url?: string | null
          id?: string
          service_fee_terms?: string | null
          signature_provider?: string | null
          signed_at?: string | null
          status?: string
          terminated_at?: string | null
          terms?: Json
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      direct_delegations: {
        Row: {
          billing_payer: string
          billing_payer_overrides: Json
          cabinet_id: string
          cabinet_owner_user_id: string
          contract_id: string | null
          created_at: string
          delegate_user_id: string
          granted_permissions: Json
          id: string
          revoked_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          billing_payer?: string
          billing_payer_overrides?: Json
          cabinet_id: string
          cabinet_owner_user_id: string
          contract_id?: string | null
          created_at?: string
          delegate_user_id: string
          granted_permissions?: Json
          id?: string
          revoked_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          billing_payer?: string
          billing_payer_overrides?: Json
          cabinet_id?: string
          cabinet_owner_user_id?: string
          contract_id?: string | null
          created_at?: string
          delegate_user_id?: string
          granted_permissions?: Json
          id?: string
          revoked_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_delegations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "delegation_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      email_change_requests: {
        Row: {
          attempts: number
          code_expires_at: string
          created_at: string
          current_email: string
          id: string
          ip_address: string | null
          new_email: string
          status: string
          user_agent: string | null
          user_id: string
          verification_code_hash: string
          verified_at: string | null
        }
        Insert: {
          attempts?: number
          code_expires_at?: string
          created_at?: string
          current_email: string
          id?: string
          ip_address?: string | null
          new_email: string
          status?: string
          user_agent?: string | null
          user_id: string
          verification_code_hash: string
          verified_at?: string | null
        }
        Update: {
          attempts?: number
          code_expires_at?: string
          created_at?: string
          current_email?: string
          id?: string
          ip_address?: string | null
          new_email?: string
          status?: string
          user_agent?: string | null
          user_id?: string
          verification_code_hash?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      email_subscriptions: {
        Row: {
          article_slug: string | null
          audience_type: string | null
          confirmed_at: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string | null
          source: string
          topics: string[] | null
        }
        Insert: {
          article_slug?: string | null
          audience_type?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          source: string
          topics?: string[] | null
        }
        Update: {
          article_slug?: string | null
          audience_type?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          source?: string
          topics?: string[] | null
        }
        Relationships: []
      }
      gov_branches: {
        Row: {
          address: string
          agency_slug: string
          branch_type: Database["public"]["Enums"]["gov_branch_type"]
          city: string
          created_at: string
          district: string | null
          email: string | null
          has_accessibility: boolean
          has_queue_system: boolean
          head_name: string | null
          head_position: string | null
          id: string
          is_open_24h: boolean
          lat: number | null
          lng: number | null
          map_url: string | null
          name: string
          phones: string[] | null
          region: string
          status: Database["public"]["Enums"]["gov_branch_status"]
          updated_at: string
          war_note: string | null
          website: string | null
          working_hours: Json | null
        }
        Insert: {
          address: string
          agency_slug: string
          branch_type?: Database["public"]["Enums"]["gov_branch_type"]
          city: string
          created_at?: string
          district?: string | null
          email?: string | null
          has_accessibility?: boolean
          has_queue_system?: boolean
          head_name?: string | null
          head_position?: string | null
          id?: string
          is_open_24h?: boolean
          lat?: number | null
          lng?: number | null
          map_url?: string | null
          name: string
          phones?: string[] | null
          region: string
          status?: Database["public"]["Enums"]["gov_branch_status"]
          updated_at?: string
          war_note?: string | null
          website?: string | null
          working_hours?: Json | null
        }
        Update: {
          address?: string
          agency_slug?: string
          branch_type?: Database["public"]["Enums"]["gov_branch_type"]
          city?: string
          created_at?: string
          district?: string | null
          email?: string | null
          has_accessibility?: boolean
          has_queue_system?: boolean
          head_name?: string | null
          head_position?: string | null
          id?: string
          is_open_24h?: boolean
          lat?: number | null
          lng?: number | null
          map_url?: string | null
          name?: string
          phones?: string[] | null
          region?: string
          status?: Database["public"]["Enums"]["gov_branch_status"]
          updated_at?: string
          war_note?: string | null
          website?: string | null
          working_hours?: Json | null
        }
        Relationships: []
      }
      gov_reviews: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          rating: number
          service_id: string | null
          status: Database["public"]["Enums"]["gov_review_status"]
          text: string | null
          updated_at: string
          user_id: string
          visit_date: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          rating: number
          service_id?: string | null
          status?: Database["public"]["Enums"]["gov_review_status"]
          text?: string | null
          updated_at?: string
          user_id: string
          visit_date?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          rating?: number
          service_id?: string | null
          status?: Database["public"]["Enums"]["gov_review_status"]
          text?: string | null
          updated_at?: string
          user_id?: string
          visit_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gov_reviews_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "gov_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gov_reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "gov_services"
            referencedColumns: ["id"]
          },
        ]
      }
      gov_service_docs: {
        Row: {
          created_at: string
          document_name: string
          how_to_get: string | null
          id: string
          is_required: boolean
          note: string | null
          service_id: string
          sort_order: number
          template_url: string | null
        }
        Insert: {
          created_at?: string
          document_name: string
          how_to_get?: string | null
          id?: string
          is_required?: boolean
          note?: string | null
          service_id: string
          sort_order?: number
          template_url?: string | null
        }
        Update: {
          created_at?: string
          document_name?: string
          how_to_get?: string | null
          id?: string
          is_required?: boolean
          note?: string | null
          service_id?: string
          sort_order?: number
          template_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gov_service_docs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "gov_services"
            referencedColumns: ["id"]
          },
        ]
      }
      gov_services: {
        Row: {
          agency_slug: string
          audience: Database["public"]["Enums"]["gov_service_audience"]
          category: string | null
          common_mistakes: string[] | null
          created_at: string
          description: string | null
          id: string
          is_online_available: boolean
          legal_basis: string | null
          name: string
          online_url: string | null
          price: string | null
          price_note: string | null
          processing_time: string | null
          requirements: string[] | null
          sort_order: number
          tips: string[] | null
          updated_at: string
        }
        Insert: {
          agency_slug: string
          audience?: Database["public"]["Enums"]["gov_service_audience"]
          category?: string | null
          common_mistakes?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_online_available?: boolean
          legal_basis?: string | null
          name: string
          online_url?: string | null
          price?: string | null
          price_note?: string | null
          processing_time?: string | null
          requirements?: string[] | null
          sort_order?: number
          tips?: string[] | null
          updated_at?: string
        }
        Update: {
          agency_slug?: string
          audience?: Database["public"]["Enums"]["gov_service_audience"]
          category?: string | null
          common_mistakes?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_online_available?: boolean
          legal_basis?: string | null
          name?: string
          online_url?: string | null
          price?: string | null
          price_note?: string | null
          processing_time?: string | null
          requirements?: string[] | null
          sort_order?: number
          tips?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      institution_reviews: {
        Row: {
          created_at: string
          id: string
          institution_slug: string
          rating: number
          status: string
          text: string | null
          updated_at: string
          user_id: string
          visit_date: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          institution_slug: string
          rating: number
          status?: string
          text?: string | null
          updated_at?: string
          user_id: string
          visit_date?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          institution_slug?: string
          rating?: number
          status?: string
          text?: string | null
          updated_at?: string
          user_id?: string
          visit_date?: string | null
        }
        Relationships: []
      }
      integration_sync_settings: {
        Row: {
          cabinet_id: string
          count_per_period: number
          created_at: string
          enabled: boolean
          frequency: string
          id: string
          operation_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cabinet_id: string
          count_per_period?: number
          created_at?: string
          enabled?: boolean
          frequency?: string
          id?: string
          operation_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cabinet_id?: string
          count_per_period?: number
          created_at?: string
          enabled?: boolean
          frequency?: string
          id?: string
          operation_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_client_links: {
        Row: {
          accountant_slug: string
          attribution_verified_at: string | null
          auto_sign_enabled: boolean
          billing_payer: string
          billing_payer_overrides: Json
          cabinet_id: string
          client_owner_user_id: string
          commission_basis: string
          commission_rate: number
          contract_id: string | null
          created_at: string
          discount_mode: string
          discount_percent: number
          ended_at: string | null
          id: string
          partner_user_id: string
          plan_id: string | null
          revoked_at: string | null
          scope: Json
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          accountant_slug: string
          attribution_verified_at?: string | null
          auto_sign_enabled?: boolean
          billing_payer?: string
          billing_payer_overrides?: Json
          cabinet_id: string
          client_owner_user_id: string
          commission_basis?: string
          commission_rate?: number
          contract_id?: string | null
          created_at?: string
          discount_mode?: string
          discount_percent: number
          ended_at?: string | null
          id?: string
          partner_user_id: string
          plan_id?: string | null
          revoked_at?: string | null
          scope?: Json
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          accountant_slug?: string
          attribution_verified_at?: string | null
          auto_sign_enabled?: boolean
          billing_payer?: string
          billing_payer_overrides?: Json
          cabinet_id?: string
          client_owner_user_id?: string
          commission_basis?: string
          commission_rate?: number
          contract_id?: string | null
          created_at?: string
          discount_mode?: string
          discount_percent?: number
          ended_at?: string | null
          id?: string
          partner_user_id?: string
          plan_id?: string | null
          revoked_at?: string | null
          scope?: Json
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_client_links_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "delegation_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_commission_ledger: {
        Row: {
          cabinet_id: string
          client_link_id: string
          client_uah_spent: number
          commission_rate: number
          commission_uah: number
          created_at: string
          id: string
          paid_at: string | null
          partner_user_id: string
          payout_id: string | null
          period: string
          status: string
          updated_at: string
        }
        Insert: {
          cabinet_id: string
          client_link_id: string
          client_uah_spent?: number
          commission_rate?: number
          commission_uah?: number
          created_at?: string
          id?: string
          paid_at?: string | null
          partner_user_id: string
          payout_id?: string | null
          period: string
          status?: string
          updated_at?: string
        }
        Update: {
          cabinet_id?: string
          client_link_id?: string
          client_uah_spent?: number
          commission_rate?: number
          commission_uah?: number
          created_at?: string
          id?: string
          paid_at?: string | null
          partner_user_id?: string
          payout_id?: string | null
          period?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      partner_commission_runs: {
        Row: {
          error: string | null
          id: string
          links_processed: number
          period: string
          ran_at: string
          status: string
          triggered_by: string
          triggered_by_user: string | null
        }
        Insert: {
          error?: string | null
          id?: string
          links_processed?: number
          period: string
          ran_at?: string
          status?: string
          triggered_by?: string
          triggered_by_user?: string | null
        }
        Update: {
          error?: string | null
          id?: string
          links_processed?: number
          period?: string
          ran_at?: string
          status?: string
          triggered_by?: string
          triggered_by_user?: string | null
        }
        Relationships: []
      }
      partner_employee_assignments: {
        Row: {
          billing_payer_override: string | null
          billing_payer_overrides: Json
          client_link_id: string
          created_at: string
          employee_user_id: string
          granted_at: string
          granted_by: string
          granted_permissions: Json
          id: string
          partner_user_id: string
          revoked_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          billing_payer_override?: string | null
          billing_payer_overrides?: Json
          client_link_id: string
          created_at?: string
          employee_user_id: string
          granted_at?: string
          granted_by: string
          granted_permissions?: Json
          id?: string
          partner_user_id: string
          revoked_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          billing_payer_override?: string | null
          billing_payer_overrides?: Json
          client_link_id?: string
          created_at?: string
          employee_user_id?: string
          granted_at?: string
          granted_by?: string
          granted_permissions?: Json
          id?: string
          partner_user_id?: string
          revoked_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_employee_assignments_client_link_id_fkey"
            columns: ["client_link_id"]
            isOneToOne: false
            referencedRelation: "partner_client_links"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_engagement_requests: {
        Row: {
          accountant_slug: string
          business_type: string | null
          cabinet_id: string | null
          client_email: string | null
          client_name: string | null
          client_user_id: string
          created_at: string
          current_status: string | null
          id: string
          industry: string | null
          message: string | null
          responded_at: string | null
          services_needed: string[] | null
          status: string
          tax_group: string | null
        }
        Insert: {
          accountant_slug: string
          business_type?: string | null
          cabinet_id?: string | null
          client_email?: string | null
          client_name?: string | null
          client_user_id: string
          created_at?: string
          current_status?: string | null
          id?: string
          industry?: string | null
          message?: string | null
          responded_at?: string | null
          services_needed?: string[] | null
          status?: string
          tax_group?: string | null
        }
        Update: {
          accountant_slug?: string
          business_type?: string | null
          cabinet_id?: string | null
          client_email?: string | null
          client_name?: string | null
          client_user_id?: string
          created_at?: string
          current_status?: string | null
          id?: string
          industry?: string | null
          message?: string | null
          responded_at?: string | null
          services_needed?: string[] | null
          status?: string
          tax_group?: string | null
        }
        Relationships: []
      }
      partner_leads: {
        Row: {
          clients_count: number | null
          contact: string
          created_at: string
          id: string
          ip_address: string | null
          message: string | null
          name: string
          source: string
          status: string
          user_agent: string | null
        }
        Insert: {
          clients_count?: number | null
          contact: string
          created_at?: string
          id?: string
          ip_address?: string | null
          message?: string | null
          name: string
          source?: string
          status?: string
          user_agent?: string | null
        }
        Update: {
          clients_count?: number | null
          contact?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          message?: string | null
          name?: string
          source?: string
          status?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      partner_payouts: {
        Row: {
          amount_uah: number
          card_last4: string | null
          created_at: string
          iban: string | null
          id: string
          method: string
          note: string | null
          paid_at: string | null
          partner_user_id: string
          period_from: string
          period_to: string
          processed_by: string | null
          recipient_name: string | null
          reference: string | null
          rejected_at: string | null
          rejected_reason: string | null
          requested_at: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_uah: number
          card_last4?: string | null
          created_at?: string
          iban?: string | null
          id?: string
          method?: string
          note?: string | null
          paid_at?: string | null
          partner_user_id: string
          period_from: string
          period_to: string
          processed_by?: string | null
          recipient_name?: string | null
          reference?: string | null
          rejected_at?: string | null
          rejected_reason?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount_uah?: number
          card_last4?: string | null
          created_at?: string
          iban?: string | null
          id?: string
          method?: string
          note?: string | null
          paid_at?: string | null
          partner_user_id?: string
          period_from?: string
          period_to?: string
          processed_by?: string | null
          recipient_name?: string | null
          reference?: string | null
          rejected_at?: string | null
          rejected_reason?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      partner_profiles: {
        Row: {
          accountant_slug: string
          active_clients_count: number
          certified_at: string | null
          created_at: string
          current_tier: string
          discount_mode: string
          is_certified: boolean
          payout_card_last4: string | null
          payout_iban: string | null
          payout_method: string | null
          payout_min_uah: number
          payout_recipient_name: string | null
          plan_id: string
          seat_limit: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accountant_slug: string
          active_clients_count?: number
          certified_at?: string | null
          created_at?: string
          current_tier?: string
          discount_mode?: string
          is_certified?: boolean
          payout_card_last4?: string | null
          payout_iban?: string | null
          payout_method?: string | null
          payout_min_uah?: number
          payout_recipient_name?: string | null
          plan_id?: string
          seat_limit?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accountant_slug?: string
          active_clients_count?: number
          certified_at?: string | null
          created_at?: string
          current_tier?: string
          discount_mode?: string
          is_certified?: boolean
          payout_card_last4?: string | null
          payout_iban?: string | null
          payout_method?: string | null
          payout_min_uah?: number
          payout_recipient_name?: string | null
          plan_id?: string
          seat_limit?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portal_ai_usage: {
        Row: {
          created_at: string
          id: string
          ip_hash: string
          operation_type: string
          tokens_in: number | null
          tokens_out: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_hash: string
          operation_type: string
          tokens_in?: number | null
          tokens_out?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_hash?: string
          operation_type?: string
          tokens_in?: number | null
          tokens_out?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      pre_registrations: {
        Row: {
          audience: string
          created_at: string
          email: string
          id: string
          name: string | null
          phone: string | null
          user_type: string | null
        }
        Insert: {
          audience?: string
          created_at?: string
          email: string
          id?: string
          name?: string | null
          phone?: string | null
          user_type?: string | null
        }
        Update: {
          audience?: string
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      signature_audit_log: {
        Row: {
          action: string
          actor_user_id: string
          cabinet_id: string | null
          created_at: string
          details: Json
          id: string
          ip_address: string | null
          signature_request_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_user_id: string
          cabinet_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          ip_address?: string | null
          signature_request_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string
          cabinet_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          ip_address?: string | null
          signature_request_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signature_audit_log_signature_request_id_fkey"
            columns: ["signature_request_id"]
            isOneToOne: false
            referencedRelation: "signature_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      signature_requests: {
        Row: {
          cabinet_id: string | null
          created_at: string
          deeplink: string | null
          document_hash: string
          document_id: string
          document_kind: string
          expires_at: string
          failure_reason: string | null
          id: string
          initiated_by: string
          is_auto_sign: boolean
          provider: string
          provider_request_id: string | null
          qr_payload: string | null
          signed_at: string | null
          signer_role: string
          signer_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          cabinet_id?: string | null
          created_at?: string
          deeplink?: string | null
          document_hash: string
          document_id: string
          document_kind: string
          expires_at?: string
          failure_reason?: string | null
          id?: string
          initiated_by: string
          is_auto_sign?: boolean
          provider?: string
          provider_request_id?: string | null
          qr_payload?: string | null
          signed_at?: string | null
          signer_role: string
          signer_user_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          cabinet_id?: string | null
          created_at?: string
          deeplink?: string | null
          document_hash?: string
          document_id?: string
          document_kind?: string
          expires_at?: string
          failure_reason?: string | null
          id?: string
          initiated_by?: string
          is_auto_sign?: boolean
          provider?: string
          provider_request_id?: string | null
          qr_payload?: string | null
          signed_at?: string | null
          signer_role?: string
          signer_user_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      signed_documents: {
        Row: {
          cabinet_id: string | null
          created_at: string
          document_hash: string
          document_id: string
          document_kind: string
          id: string
          is_valid: boolean
          signed_blob_format: string | null
          signed_blob_url: string | null
          signers: Json
          timestamp_authority: string | null
        }
        Insert: {
          cabinet_id?: string | null
          created_at?: string
          document_hash: string
          document_id: string
          document_kind: string
          id?: string
          is_valid?: boolean
          signed_blob_format?: string | null
          signed_blob_url?: string | null
          signers?: Json
          timestamp_authority?: string | null
        }
        Update: {
          cabinet_id?: string | null
          created_at?: string
          document_hash?: string
          document_id?: string
          document_kind?: string
          id?: string
          is_valid?: boolean
          signed_blob_format?: string | null
          signed_blob_url?: string | null
          signers?: Json
          timestamp_authority?: string | null
        }
        Relationships: []
      }
      user_2fa_settings: {
        Row: {
          backup_codes_generated_at: string | null
          enabled_at: string | null
          is_enabled: boolean
          method: string | null
          totp_secret_encrypted: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes_generated_at?: string | null
          enabled_at?: string | null
          is_enabled?: boolean
          method?: string | null
          totp_secret_encrypted?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes_generated_at?: string | null
          enabled_at?: string | null
          is_enabled?: boolean
          method?: string | null
          totp_secret_encrypted?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_backup_codes: {
        Row: {
          code_hash: string
          created_at: string
          expires_at: string
          id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string
          expires_at?: string
          id?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          code_hash?: string
          created_at?: string
          expires_at?: string
          id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_events: {
        Row: {
          cabinet_id: string | null
          created_at: string
          description: string | null
          event_at: string
          id: string
          source: Database["public"]["Enums"]["user_event_source"]
          status: Database["public"]["Enums"]["user_event_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cabinet_id?: string | null
          created_at?: string
          description?: string | null
          event_at: string
          id?: string
          source?: Database["public"]["Enums"]["user_event_source"]
          status?: Database["public"]["Enums"]["user_event_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cabinet_id?: string | null
          created_at?: string
          description?: string | null
          event_at?: string
          id?: string
          source?: Database["public"]["Enums"]["user_event_source"]
          status?: Database["public"]["Enums"]["user_event_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_messenger_connections: {
        Row: {
          connected_at: string | null
          created_at: string
          external_chat_id: string | null
          external_username: string | null
          id: string
          last_message_at: string | null
          metadata: Json
          pairing_code: string | null
          pairing_code_expires_at: string | null
          provider: Database["public"]["Enums"]["messenger_provider"]
          status: Database["public"]["Enums"]["messenger_connection_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          connected_at?: string | null
          created_at?: string
          external_chat_id?: string | null
          external_username?: string | null
          id?: string
          last_message_at?: string | null
          metadata?: Json
          pairing_code?: string | null
          pairing_code_expires_at?: string | null
          provider: Database["public"]["Enums"]["messenger_provider"]
          status?: Database["public"]["Enums"]["messenger_connection_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          connected_at?: string | null
          created_at?: string
          external_chat_id?: string | null
          external_username?: string | null
          id?: string
          last_message_at?: string | null
          metadata?: Json
          pairing_code?: string | null
          pairing_code_expires_at?: string | null
          provider?: Database["public"]["Enums"]["messenger_provider"]
          status?: Database["public"]["Enums"]["messenger_connection_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notification_preferences: {
        Row: {
          channels: Json
          created_at: string
          critical_overrides_quiet_hours: boolean
          deadline_lead_days: Json
          quiet_hours_enabled: boolean
          quiet_hours_end: string
          quiet_hours_start: string
          timezone: string
          types: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          channels?: Json
          created_at?: string
          critical_overrides_quiet_hours?: boolean
          deadline_lead_days?: Json
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string
          quiet_hours_start?: string
          timezone?: string
          types?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          channels?: Json
          created_at?: string
          critical_overrides_quiet_hours?: boolean
          deadline_lead_days?: Json
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string
          quiet_hours_start?: string
          timezone?: string
          types?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          action_path: string | null
          body: string | null
          cabinet_id: string | null
          created_at: string
          id: string
          read_at: string | null
          related_event_id: string | null
          severity: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_path?: string | null
          body?: string | null
          cabinet_id?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          related_event_id?: string | null
          severity?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_path?: string | null
          body?: string | null
          cabinet_id?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          related_event_id?: string | null
          severity?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_related_event_id_fkey"
            columns: ["related_event_id"]
            isOneToOne: false
            referencedRelation: "user_events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reminders: {
        Row: {
          channel: Database["public"]["Enums"]["reminder_channel"]
          created_at: string
          event_id: string
          id: string
          remind_at: string
          sent_at: string | null
          user_id: string
        }
        Insert: {
          channel?: Database["public"]["Enums"]["reminder_channel"]
          created_at?: string
          event_id: string
          id?: string
          remind_at: string
          sent_at?: string | null
          user_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["reminder_channel"]
          created_at?: string
          event_id?: string
          id?: string
          remind_at?: string
          sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "user_events"
            referencedColumns: ["id"]
          },
        ]
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
      user_subscriptions: {
        Row: {
          created_at: string
          id: string
          period_end: string
          period_start: string
          plan_id: string
          scheduled_at: string | null
          scheduled_plan_id: string | null
          source: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          plan_id?: string
          scheduled_at?: string | null
          scheduled_plan_id?: string | null
          source?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          plan_id?: string
          scheduled_at?: string | null
          scheduled_plan_id?: string | null
          source?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      partner_profiles_public: {
        Row: {
          accountant_slug: string | null
          active_clients_count: number | null
          certified_at: string | null
          created_at: string | null
          current_tier: string | null
          is_certified: boolean | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accountant_slug?: string | null
          active_clients_count?: number | null
          certified_at?: string | null
          created_at?: string | null
          current_tier?: string | null
          is_certified?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accountant_slug?: string | null
          active_clients_count?: number | null
          certified_at?: string | null
          created_at?: string | null
          current_tier?: string | null
          is_certified?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_client_profile_v: {
        Row: {
          client_card_id: string | null
          created_at: string | null
          display_name: string | null
          phone: string | null
          publication_id: string | null
          status:
            | Database["public"]["Enums"]["catalog_subscription_status"]
            | null
          subscription_id: string | null
        }
        Insert: {
          client_card_id?: string | null
          created_at?: string | null
          display_name?: string | null
          phone?: string | null
          publication_id?: string | null
          status?:
            | Database["public"]["Enums"]["catalog_subscription_status"]
            | null
          subscription_id?: string | null
        }
        Update: {
          client_card_id?: string | null
          created_at?: string | null
          display_name?: string | null
          phone?: string | null
          publication_id?: string | null
          status?:
            | Database["public"]["Enums"]["catalog_subscription_status"]
            | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_subscriptions_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "catalog_publications"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_cabinet_invitation: { Args: { _code: string }; Returns: Json }
      accrue_partner_commission: { Args: { _period: string }; Returns: Json }
      get_effective_plan: { Args: { _user_id: string }; Returns: string }
      get_partner_discount_percent: { Args: { _tier: string }; Returns: number }
      has_effective_access: {
        Args: { _cabinet_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_cabinet_admin: {
        Args: { _cabinet_id: string; _user_id: string }
        Returns: boolean
      }
      is_cabinet_member: {
        Args: { _cabinet_id: string; _user_id: string }
        Returns: boolean
      }
      mark_partner_payout_paid: {
        Args: { _note?: string; _payout_id: string; _reference?: string }
        Returns: Json
      }
      reject_partner_payout: {
        Args: { _payout_id: string; _reason: string }
        Returns: Json
      }
      request_partner_payout: { Args: never; Returns: Json }
      resolve_billing_wallet:
        | { Args: { _acting_user: string; _cabinet_id: string }; Returns: Json }
        | {
            Args: {
              _acting_user: string
              _cabinet_id: string
              _operation_type?: string
            }
            Returns: Json
          }
      run_commission_accrual_logged: {
        Args: { _period: string; _trigger?: string }
        Returns: Json
      }
      verify_certificate: {
        Args: { _certificate_number: string }
        Returns: {
          certificate_number: string
          course_id: string
          course_title: string
          is_valid: boolean
          issued_at: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "viewer" | "partner_accountant"
      cabinet_invitation_status: "pending" | "accepted" | "revoked" | "expired"
      cabinet_member_status: "active" | "invited" | "suspended" | "removed"
      catalog_publication_kind: "b2b_supplier" | "c2b_place"
      catalog_publication_status: "draft" | "active" | "paused" | "archived"
      catalog_publication_visibility: "public" | "invite_only"
      catalog_subscription_status: "pending" | "active" | "paused" | "ended"
      gov_branch_status: "active" | "temporarily_closed" | "destroyed"
      gov_branch_type:
        | "main"
        | "regional"
        | "district"
        | "cnap"
        | "court"
        | "other"
      gov_review_status: "pending" | "published" | "rejected"
      gov_service_audience: "business" | "personal" | "both"
      messenger_connection_status:
        | "disconnected"
        | "pending"
        | "connected"
        | "error"
      messenger_provider: "telegram" | "viber"
      reminder_channel: "in-app" | "email"
      user_event_source: "manual" | "ai"
      user_event_status: "scheduled" | "completed" | "cancelled"
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
      app_role: ["admin", "editor", "viewer", "partner_accountant"],
      cabinet_invitation_status: ["pending", "accepted", "revoked", "expired"],
      cabinet_member_status: ["active", "invited", "suspended", "removed"],
      catalog_publication_kind: ["b2b_supplier", "c2b_place"],
      catalog_publication_status: ["draft", "active", "paused", "archived"],
      catalog_publication_visibility: ["public", "invite_only"],
      catalog_subscription_status: ["pending", "active", "paused", "ended"],
      gov_branch_status: ["active", "temporarily_closed", "destroyed"],
      gov_branch_type: [
        "main",
        "regional",
        "district",
        "cnap",
        "court",
        "other",
      ],
      gov_review_status: ["pending", "published", "rejected"],
      gov_service_audience: ["business", "personal", "both"],
      messenger_connection_status: [
        "disconnected",
        "pending",
        "connected",
        "error",
      ],
      messenger_provider: ["telegram", "viber"],
      reminder_channel: ["in-app", "email"],
      user_event_source: ["manual", "ai"],
      user_event_status: ["scheduled", "completed", "cancelled"],
    },
  },
} as const

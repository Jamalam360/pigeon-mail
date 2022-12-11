export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  auth: {
    Tables: {
      audit_log_entries: {
        Row: {
          instance_id: string | null;
          id: string;
          payload: Json | null;
          created_at: string | null;
          ip_address: string;
        };
        Insert: {
          instance_id?: string | null;
          id: string;
          payload?: Json | null;
          created_at?: string | null;
          ip_address?: string;
        };
        Update: {
          instance_id?: string | null;
          id?: string;
          payload?: Json | null;
          created_at?: string | null;
          ip_address?: string;
        };
      };
      identities: {
        Row: {
          id: string;
          user_id: string;
          identity_data: Json;
          provider: string;
          last_sign_in_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          user_id: string;
          identity_data: Json;
          provider: string;
          last_sign_in_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          identity_data?: Json;
          provider?: string;
          last_sign_in_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      instances: {
        Row: {
          id: string;
          uuid: string | null;
          raw_base_config: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          uuid?: string | null;
          raw_base_config?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          uuid?: string | null;
          raw_base_config?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      mfa_amr_claims: {
        Row: {
          session_id: string;
          created_at: string;
          updated_at: string;
          authentication_method: string;
          id: string;
        };
        Insert: {
          session_id: string;
          created_at: string;
          updated_at: string;
          authentication_method: string;
          id: string;
        };
        Update: {
          session_id?: string;
          created_at?: string;
          updated_at?: string;
          authentication_method?: string;
          id?: string;
        };
      };
      mfa_challenges: {
        Row: {
          id: string;
          factor_id: string;
          created_at: string;
          verified_at: string | null;
          ip_address: unknown;
        };
        Insert: {
          id: string;
          factor_id: string;
          created_at: string;
          verified_at?: string | null;
          ip_address: unknown;
        };
        Update: {
          id?: string;
          factor_id?: string;
          created_at?: string;
          verified_at?: string | null;
          ip_address?: unknown;
        };
      };
      mfa_factors: {
        Row: {
          id: string;
          user_id: string;
          friendly_name: string | null;
          factor_type: Database["auth"]["Enums"]["factor_type"];
          status: Database["auth"]["Enums"]["factor_status"];
          created_at: string;
          updated_at: string;
          secret: string | null;
        };
        Insert: {
          id: string;
          user_id: string;
          friendly_name?: string | null;
          factor_type: Database["auth"]["Enums"]["factor_type"];
          status: Database["auth"]["Enums"]["factor_status"];
          created_at: string;
          updated_at: string;
          secret?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          friendly_name?: string | null;
          factor_type?: Database["auth"]["Enums"]["factor_type"];
          status?: Database["auth"]["Enums"]["factor_status"];
          created_at?: string;
          updated_at?: string;
          secret?: string | null;
        };
      };
      refresh_tokens: {
        Row: {
          instance_id: string | null;
          id: number;
          token: string | null;
          user_id: string | null;
          revoked: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          parent: string | null;
          session_id: string | null;
        };
        Insert: {
          instance_id?: string | null;
          id?: number;
          token?: string | null;
          user_id?: string | null;
          revoked?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          parent?: string | null;
          session_id?: string | null;
        };
        Update: {
          instance_id?: string | null;
          id?: number;
          token?: string | null;
          user_id?: string | null;
          revoked?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          parent?: string | null;
          session_id?: string | null;
        };
      };
      saml_providers: {
        Row: {
          id: string;
          sso_provider_id: string;
          entity_id: string;
          metadata_xml: string;
          metadata_url: string | null;
          attribute_mapping: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          sso_provider_id: string;
          entity_id: string;
          metadata_xml: string;
          metadata_url?: string | null;
          attribute_mapping?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          sso_provider_id?: string;
          entity_id?: string;
          metadata_xml?: string;
          metadata_url?: string | null;
          attribute_mapping?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      saml_relay_states: {
        Row: {
          id: string;
          sso_provider_id: string;
          request_id: string;
          for_email: string | null;
          redirect_to: string | null;
          from_ip_address: unknown | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          sso_provider_id: string;
          request_id: string;
          for_email?: string | null;
          redirect_to?: string | null;
          from_ip_address?: unknown | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          sso_provider_id?: string;
          request_id?: string;
          for_email?: string | null;
          redirect_to?: string | null;
          from_ip_address?: unknown | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      schema_migrations: {
        Row: {
          version: string;
        };
        Insert: {
          version: string;
        };
        Update: {
          version?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          created_at: string | null;
          updated_at: string | null;
          factor_id: string | null;
          aal: Database["auth"]["Enums"]["aal_level"] | null;
          not_after: string | null;
        };
        Insert: {
          id: string;
          user_id: string;
          created_at?: string | null;
          updated_at?: string | null;
          factor_id?: string | null;
          aal?: Database["auth"]["Enums"]["aal_level"] | null;
          not_after?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string | null;
          updated_at?: string | null;
          factor_id?: string | null;
          aal?: Database["auth"]["Enums"]["aal_level"] | null;
          not_after?: string | null;
        };
      };
      sso_domains: {
        Row: {
          id: string;
          sso_provider_id: string;
          domain: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          sso_provider_id: string;
          domain: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          sso_provider_id?: string;
          domain?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      sso_providers: {
        Row: {
          id: string;
          resource_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          resource_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          resource_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      sso_sessions: {
        Row: {
          id: string;
          session_id: string;
          sso_provider_id: string | null;
          not_before: string | null;
          not_after: string | null;
          idp_initiated: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          session_id: string;
          sso_provider_id?: string | null;
          not_before?: string | null;
          not_after?: string | null;
          idp_initiated?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          sso_provider_id?: string | null;
          not_before?: string | null;
          not_after?: string | null;
          idp_initiated?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      users: {
        Row: {
          instance_id: string | null;
          id: string;
          aud: string | null;
          role: string | null;
          email: string | null;
          encrypted_password: string | null;
          email_confirmed_at: string | null;
          invited_at: string | null;
          confirmation_token: string | null;
          confirmation_sent_at: string | null;
          recovery_token: string | null;
          recovery_sent_at: string | null;
          email_change_token_new: string | null;
          email_change: string | null;
          email_change_sent_at: string | null;
          last_sign_in_at: string | null;
          raw_app_meta_data: Json | null;
          raw_user_meta_data: Json | null;
          is_super_admin: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          phone: string | null;
          phone_confirmed_at: string | null;
          phone_change: string | null;
          phone_change_token: string | null;
          phone_change_sent_at: string | null;
          confirmed_at: string | null;
          email_change_token_current: string | null;
          email_change_confirm_status: number | null;
          banned_until: string | null;
          reauthentication_token: string | null;
          reauthentication_sent_at: string | null;
        };
        Insert: {
          instance_id?: string | null;
          id: string;
          aud?: string | null;
          role?: string | null;
          email?: string | null;
          encrypted_password?: string | null;
          email_confirmed_at?: string | null;
          invited_at?: string | null;
          confirmation_token?: string | null;
          confirmation_sent_at?: string | null;
          recovery_token?: string | null;
          recovery_sent_at?: string | null;
          email_change_token_new?: string | null;
          email_change?: string | null;
          email_change_sent_at?: string | null;
          last_sign_in_at?: string | null;
          raw_app_meta_data?: Json | null;
          raw_user_meta_data?: Json | null;
          is_super_admin?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          phone?: string | null;
          phone_confirmed_at?: string | null;
          phone_change?: string | null;
          phone_change_token?: string | null;
          phone_change_sent_at?: string | null;
          confirmed_at?: string | null;
          email_change_token_current?: string | null;
          email_change_confirm_status?: number | null;
          banned_until?: string | null;
          reauthentication_token?: string | null;
          reauthentication_sent_at?: string | null;
        };
        Update: {
          instance_id?: string | null;
          id?: string;
          aud?: string | null;
          role?: string | null;
          email?: string | null;
          encrypted_password?: string | null;
          email_confirmed_at?: string | null;
          invited_at?: string | null;
          confirmation_token?: string | null;
          confirmation_sent_at?: string | null;
          recovery_token?: string | null;
          recovery_sent_at?: string | null;
          email_change_token_new?: string | null;
          email_change?: string | null;
          email_change_sent_at?: string | null;
          last_sign_in_at?: string | null;
          raw_app_meta_data?: Json | null;
          raw_user_meta_data?: Json | null;
          is_super_admin?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          phone?: string | null;
          phone_confirmed_at?: string | null;
          phone_change?: string | null;
          phone_change_token?: string | null;
          phone_change_sent_at?: string | null;
          confirmed_at?: string | null;
          email_change_token_current?: string | null;
          email_change_confirm_status?: number | null;
          banned_until?: string | null;
          reauthentication_token?: string | null;
          reauthentication_sent_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      email: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      jwt: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      uid: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      aal_level: "aal1" | "aal2" | "aal3";
      factor_status: "unverified" | "verified";
      factor_type: "totp" | "webauthn";
    };
  };
  public: {
    Tables: {
      messages: {
        Row: {
          id: number;
          sent_at: string | null;
          delivery_time: number | null;
          sender: string | null;
          recipient: string | null;
          content: string | null;
        };
        Insert: {
          id?: number;
          sent_at?: string | null;
          delivery_time?: number | null;
          sender?: string | null;
          recipient?: string | null;
          content?: string | null;
        };
        Update: {
          id?: number;
          sent_at?: string | null;
          delivery_time?: number | null;
          sender?: string | null;
          recipient?: string | null;
          content?: string | null;
        };
      };
      users: {
        Row: {
          id: string;
          country: string | null;
          name: string | null;
          pen_pal: string | null;
          searching_today: boolean;
          avatar: string | null;
        };
        Insert: {
          id: string;
          country?: string | null;
          name?: string | null;
          pen_pal?: string | null;
          searching_today?: boolean;
          avatar?: string | null;
        };
        Update: {
          id?: string;
          country?: string | null;
          name?: string | null;
          pen_pal?: string | null;
          searching_today?: boolean;
          avatar?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

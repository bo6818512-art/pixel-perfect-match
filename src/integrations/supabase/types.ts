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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      account_notifications: {
        Row: {
          created_at: string
          event_key: string | null
          id: string
          message: string
          read_at: string | null
          request_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_key?: string | null
          id?: string
          message: string
          read_at?: string | null
          request_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_key?: string | null
          id?: string
          message?: string
          read_at?: string | null
          request_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_notifications_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "license_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_request_events: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          id: string
          note: string
          request_id: string
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          id?: string
          note?: string
          request_id: string
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          id?: string
          note?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_request_events_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "license_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      application_documents: {
        Row: {
          bucket: string
          document_id: number
          document_name: string
          path: string
          request_id: string
        }
        Insert: {
          bucket?: string
          document_id: number
          document_name: string
          path: string
          request_id: string
        }
        Update: {
          bucket?: string
          document_id?: number
          document_name?: string
          path?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "license_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          commercial_number: string
          commercial_path: string
          name: string
          representative_name: string
          representative_national_id: string
          representative_phone: string
          representative_role: string
          tax_number: string
          tax_path: string
          user_id: string
        }
        Insert: {
          commercial_number: string
          commercial_path: string
          name: string
          representative_name: string
          representative_national_id: string
          representative_phone: string
          representative_role: string
          tax_number: string
          tax_path: string
          user_id: string
        }
        Update: {
          commercial_number?: string
          commercial_path?: string
          name?: string
          representative_name?: string
          representative_national_id?: string
          representative_phone?: string
          representative_role?: string
          tax_number?: string
          tax_path?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      environmental_requests: {
        Row: {
          created_at: string
          documents: Json
          id: string
          payment_method: string
          project_name: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          documents: Json
          id?: string
          payment_method: string
          project_name: string
          status?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          documents?: Json
          id?: string
          payment_method?: string
          project_name?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      license_drafts: {
        Row: {
          id: string
          mode: string
          payload: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          mode?: string
          payload?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          mode?: string
          payload?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      license_requests: {
        Row: {
          active_plot_claim: boolean
          activity: string
          activity_category: string
          area: number | null
          building_type: string | null
          created_at: string
          deleted_at: string | null
          district: string | null
          documents: Json
          documents_approved_at: string | null
          expires_at: string | null
          fee: number | null
          floor: string | null
          id: string
          issued_at: string | null
          kind: string
          license_number: string | null
          license_type: string
          owner_name: string
          owner_type: string | null
          paid_at: string | null
          parent_id: string | null
          payment_method: string
          plot_number: string
          property_id: string | null
          receipt_path: string | null
          receipt_uploaded_at: string | null
          required_document_snapshot: Json
          selected_location: Json | null
          status: string
          temp_track_id: string
          tracking_id: string
          unit_id: string | null
          unit_number: string | null
          user_id: string
        }
        Insert: {
          active_plot_claim?: boolean
          activity: string
          activity_category?: string
          area?: number | null
          building_type?: string | null
          created_at?: string
          deleted_at?: string | null
          district?: string | null
          documents?: Json
          documents_approved_at?: string | null
          expires_at?: string | null
          fee?: number | null
          floor?: string | null
          id?: string
          issued_at?: string | null
          kind?: string
          license_number?: string | null
          license_type: string
          owner_name: string
          owner_type?: string | null
          paid_at?: string | null
          parent_id?: string | null
          payment_method: string
          plot_number: string
          property_id?: string | null
          receipt_path?: string | null
          receipt_uploaded_at?: string | null
          required_document_snapshot?: Json
          selected_location?: Json | null
          status?: string
          temp_track_id?: string
          tracking_id?: string
          unit_id?: string | null
          unit_number?: string | null
          user_id: string
        }
        Update: {
          active_plot_claim?: boolean
          activity?: string
          activity_category?: string
          area?: number | null
          building_type?: string | null
          created_at?: string
          deleted_at?: string | null
          district?: string | null
          documents?: Json
          documents_approved_at?: string | null
          expires_at?: string | null
          fee?: number | null
          floor?: string | null
          id?: string
          issued_at?: string | null
          kind?: string
          license_number?: string | null
          license_type?: string
          owner_name?: string
          owner_type?: string | null
          paid_at?: string | null
          parent_id?: string | null
          payment_method?: string
          plot_number?: string
          property_id?: string | null
          receipt_path?: string | null
          receipt_uploaded_at?: string | null
          required_document_snapshot?: Json
          selected_location?: Json | null
          status?: string
          temp_track_id?: string
          tracking_id?: string
          unit_id?: string | null
          unit_number?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "license_requests_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "license_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "license_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "licensing_plots"
            referencedColumns: ["id"]
          },
        ]
      }
      licensing_plots: {
        Row: {
          code: string
          district: string
          enabled: boolean
          has_units: boolean
          id: string
          latitude: number | null
          longitude: number | null
          profile_id: string
        }
        Insert: {
          code: string
          district: string
          enabled?: boolean
          has_units?: boolean
          id?: string
          latitude?: number | null
          longitude?: number | null
          profile_id?: string
        }
        Update: {
          code?: string
          district?: string
          enabled?: boolean
          has_units?: boolean
          id?: string
          latitude?: number | null
          longitude?: number | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "licensing_plots_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "requirement_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_documents: {
        Row: {
          condition: string
          document_id: number
          is_required: boolean
          profile_id: string
        }
        Insert: {
          condition?: string
          document_id: number
          is_required?: boolean
          profile_id: string
        }
        Update: {
          condition?: string
          document_id?: number
          is_required?: boolean
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_documents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "requirement_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string
          created_at: string
          full_name: string
          id: string
          national_id: string | null
          national_id_verified_at: string | null
          phone: string
          requested_account_type: string | null
        }
        Insert: {
          account_type?: string
          created_at?: string
          full_name?: string
          id: string
          national_id?: string | null
          national_id_verified_at?: string | null
          phone?: string
          requested_account_type?: string | null
        }
        Update: {
          account_type?: string
          created_at?: string
          full_name?: string
          id?: string
          national_id?: string | null
          national_id_verified_at?: string | null
          phone?: string
          requested_account_type?: string | null
        }
        Relationships: []
      }
      requirement_profiles: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      support_submissions: {
        Row: {
          complaint_type: string
          created_at: string
          email: string
          id: string
          kind: string
          message: string
          name: string
          phone: string
        }
        Insert: {
          complaint_type?: string
          created_at?: string
          email: string
          id: string
          kind: string
          message: string
          name: string
          phone?: string
        }
        Update: {
          complaint_type?: string
          created_at?: string
          email?: string
          id?: string
          kind?: string
          message?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_approve_documents: {
        Args: { request_id: string; review_note: string; reviewed_fee?: number }
        Returns: undefined
      }
      admin_confirm_treasury_payment: {
        Args: { receipt_reference: string; request_id: string }
        Returns: undefined
      }
      admin_review_request: {
        Args: {
          next_status: string
          request_id: string
          review_note: string
          reviewed_fee?: number
        }
        Returns: undefined
      }
      check_license_property: {
        Args: {
          p_floor?: string
          p_property_id: string
          p_unit_number?: string
        }
        Returns: string
      }
      delete_own_license_request: {
        Args: { request_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      license_slot: { Args: { f: string; u: string }; Returns: string }
      next_license_tracking_id: { Args: never; Returns: string }
      plot_availability: {
        Args: { p_district: string }
        Returns: {
          blocked: boolean
          code: string
          district: string
          has_units: boolean
          id: string
          latitude: number
          longitude: number
          renewal_id: string
        }[]
      }
      request_missing_documents: {
        Args: { p_note: string; p_request: string }
        Returns: undefined
      }
      required_plot_documents: {
        Args: { p_category: string; p_property: string }
        Returns: {
          id: number
          name: string
        }[]
      }
      resubmit_missing_documents: {
        Args: { p_request: string }
        Returns: undefined
      }
      save_contact_details: {
        Args: { p_phone: string; p_representative_phone?: string }
        Returns: undefined
      }
      save_portal_account: { Args: { p_data: Json }; Returns: undefined }
      send_license_renewal_alerts: { Args: never; Returns: number }
      submit_missing_document: {
        Args: { p_path: string; p_request: string; p_slot: number }
        Returns: undefined
      }
      submit_payment_receipt: {
        Args: { receipt_path: string; request_id: string }
        Returns: undefined
      }
      verify_portal_identity: { Args: { p_user: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
    },
  },
} as const

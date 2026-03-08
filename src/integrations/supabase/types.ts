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
      endorsements: {
        Row: {
          created_at: string
          id: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      founder_profiles: {
        Row: {
          bio: string | null
          concentration: string | null
          created_at: string
          graduation_year: number | null
          harvard_school: string
          id: string
          previous_founding_description: string | null
          previously_founded: boolean
          role_at_startup: string | null
          skills: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          concentration?: string | null
          created_at?: string
          graduation_year?: number | null
          harvard_school: string
          id?: string
          previous_founding_description?: string | null
          previously_founded?: boolean
          role_at_startup?: string | null
          skills?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          concentration?: string | null
          created_at?: string
          graduation_year?: number | null
          harvard_school?: string
          id?: string
          previous_founding_description?: string | null
          previously_founded?: boolean
          role_at_startup?: string | null
          skills?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      investor_profiles: {
        Row: {
          approved_at: string | null
          check_size_range: string | null
          created_at: string
          firm_name: string
          id: string
          industries_focus: string[]
          investment_thesis: string | null
          linkedin_url: string | null
          portfolio_companies: string | null
          stage_focus: string[]
          status: Database["public"]["Enums"]["investor_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          check_size_range?: string | null
          created_at?: string
          firm_name: string
          id?: string
          industries_focus?: string[]
          investment_thesis?: string | null
          linkedin_url?: string | null
          portfolio_companies?: string | null
          stage_focus?: string[]
          status?: Database["public"]["Enums"]["investor_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          check_size_range?: string | null
          created_at?: string
          firm_name?: string
          id?: string
          industries_focus?: string[]
          investment_thesis?: string | null
          linkedin_url?: string | null
          portfolio_companies?: string | null
          stage_focus?: string[]
          status?: Database["public"]["Enums"]["investor_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      open_roles: {
        Row: {
          compensation: Database["public"]["Enums"]["compensation_type"]
          created_at: string
          hours_per_week: number
          id: string
          startup_id: string
          title: string
        }
        Insert: {
          compensation: Database["public"]["Enums"]["compensation_type"]
          created_at?: string
          hours_per_week: number
          id?: string
          startup_id: string
          title: string
        }
        Update: {
          compensation?: Database["public"]["Enums"]["compensation_type"]
          created_at?: string
          hours_per_week?: number
          id?: string
          startup_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "open_roles_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          linkedin_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          linkedin_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          linkedin_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      startups: {
        Row: {
          business_model:
            | Database["public"]["Enums"]["business_model_type"]
            | null
          created_at: string
          description: string
          founded_year: number
          full_description: string | null
          funding_raised: string | null
          harvard_affiliation: string
          id: string
          industry: Database["public"]["Enums"]["industry_type"]
          is_hiring: boolean
          linkedin_url: string | null
          logo_url: string | null
          looking_for_cofounder: boolean
          name: string
          open_to_vc: boolean
          pitch_deck_url: string | null
          stage: Database["public"]["Enums"]["stage_type"]
          target_market: string | null
          team_size: number
          tech_stack: string | null
          traction: string | null
          twitter_url: string | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          business_model?:
            | Database["public"]["Enums"]["business_model_type"]
            | null
          created_at?: string
          description: string
          founded_year: number
          full_description?: string | null
          funding_raised?: string | null
          harvard_affiliation: string
          id?: string
          industry: Database["public"]["Enums"]["industry_type"]
          is_hiring?: boolean
          linkedin_url?: string | null
          logo_url?: string | null
          looking_for_cofounder?: boolean
          name: string
          open_to_vc?: boolean
          pitch_deck_url?: string | null
          stage: Database["public"]["Enums"]["stage_type"]
          target_market?: string | null
          team_size?: number
          tech_stack?: string | null
          traction?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          business_model?:
            | Database["public"]["Enums"]["business_model_type"]
            | null
          created_at?: string
          description?: string
          founded_year?: number
          full_description?: string | null
          funding_raised?: string | null
          harvard_affiliation?: string
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"]
          is_hiring?: boolean
          linkedin_url?: string | null
          logo_url?: string | null
          looking_for_cofounder?: boolean
          name?: string
          open_to_vc?: boolean
          pitch_deck_url?: string | null
          stage?: Database["public"]["Enums"]["stage_type"]
          target_market?: string | null
          team_size?: number
          tech_stack?: string | null
          traction?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          bio: string | null
          concentration: string | null
          created_at: string
          github_url: string | null
          graduation_year: number | null
          harvard_school: string
          id: string
          looking_for: string[]
          open_to_cofounding: boolean
          skills: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          concentration?: string | null
          created_at?: string
          github_url?: string | null
          graduation_year?: number | null
          harvard_school: string
          id?: string
          looking_for?: string[]
          open_to_cofounding?: boolean
          skills?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          concentration?: string | null
          created_at?: string
          github_url?: string | null
          graduation_year?: number | null
          harvard_school?: string
          id?: string
          looking_for?: string[]
          open_to_cofounding?: boolean
          skills?: string[]
          updated_at?: string
          user_id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_all_startup_endorsements: {
        Args: never
        Returns: {
          investor_count: number
          startup_id: string
          total: number
        }[]
      }
      get_endorsement_counts: {
        Args: { p_target_id: string; p_target_type: string }
        Returns: {
          investor_count: number
          total: number
        }[]
      }
      get_trending_startup_ids: {
        Args: never
        Returns: {
          recent_count: number
          startup_id: string
        }[]
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
    }
    Enums: {
      app_role: "founder" | "investor" | "student" | "applicant" | "admin"
      business_model_type: "B2B" | "B2C" | "B2B2C" | "Marketplace" | "Other"
      compensation_type: "Paid" | "Equity" | "Unpaid"
      industry_type:
        | "Fintech"
        | "Biotech"
        | "AI/ML"
        | "Consumer"
        | "B2B SaaS"
        | "Hardware"
        | "Social Impact"
        | "Other"
        | "Deep Tech"
      investor_status: "pending" | "approved" | "rejected"
      stage_type: "Idea" | "Pre-seed" | "Seed" | "Series A+"
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
      app_role: ["founder", "investor", "student", "applicant", "admin"],
      business_model_type: ["B2B", "B2C", "B2B2C", "Marketplace", "Other"],
      compensation_type: ["Paid", "Equity", "Unpaid"],
      industry_type: [
        "Fintech",
        "Biotech",
        "AI/ML",
        "Consumer",
        "B2B SaaS",
        "Hardware",
        "Social Impact",
        "Other",
        "Deep Tech",
      ],
      investor_status: ["pending", "approved", "rejected"],
      stage_type: ["Idea", "Pre-seed", "Seed", "Series A+"],
    },
  },
} as const

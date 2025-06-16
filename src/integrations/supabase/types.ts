export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_notes: {
        Row: {
          admin_id: string
          candidate_id: string
          created_at: string
          id: string
          notes: string | null
          rating: number | null
          section: Database["public"]["Enums"]["interview_section"] | null
          updated_at: string
        }
        Insert: {
          admin_id: string
          candidate_id: string
          created_at?: string
          id?: string
          notes?: string | null
          rating?: number | null
          section?: Database["public"]["Enums"]["interview_section"] | null
          updated_at?: string
        }
        Update: {
          admin_id?: string
          candidate_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          rating?: number | null
          section?: Database["public"]["Enums"]["interview_section"] | null
          updated_at?: string
        }
        Relationships: []
      }
      exercise_uploads: {
        Row: {
          created_at: string
          exercise_key: string
          file_name: string | null
          file_path: string | null
          file_type: string | null
          id: string
          updated_at: string | null
          upload_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          exercise_key: string
          file_name?: string | null
          file_path?: string | null
          file_type?: string | null
          id?: string
          updated_at?: string | null
          upload_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          exercise_key?: string
          file_name?: string | null
          file_path?: string | null
          file_type?: string | null
          id?: string
          updated_at?: string | null
          upload_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      interview_answers: {
        Row: {
          answer: string | null
          created_at: string
          id: string
          metadata: Json | null
          question_key: string
          section: Database["public"]["Enums"]["interview_section"]
          updated_at: string
          user_id: string
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          question_key: string
          section: Database["public"]["Enums"]["interview_section"]
          updated_at?: string
          user_id: string
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          question_key?: string
          section?: Database["public"]["Enums"]["interview_section"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      interview_invitations: {
        Row: {
          candidate_email: string
          candidate_name: string | null
          created_at: string
          expires_at: string
          id: string
          invitation_token: string
          sent_at: string
          sent_by: string
          status: string
          updated_at: string
        }
        Insert: {
          candidate_email: string
          candidate_name?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          sent_at?: string
          sent_by: string
          status?: string
          updated_at?: string
        }
        Update: {
          candidate_email?: string
          candidate_name?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          sent_at?: string
          sent_by?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      interview_progress: {
        Row: {
          completed_sections: Json | null
          created_at: string | null
          current_step: number | null
          id: string
          submission_status: string | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_sections?: Json | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          submission_status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_sections?: Json | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          submission_status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          linkedin_url: string | null
          phone: string | null
          resume_file_path: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          linkedin_url?: string | null
          phone?: string | null
          resume_file_path?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          resume_file_path?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      interview_section:
        | "general"
        | "technical_scenarios"
        | "technical_exercises"
        | "culture"
      user_role: "candidate" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      interview_section: [
        "general",
        "technical_scenarios",
        "technical_exercises",
        "culture",
      ],
      user_role: ["candidate", "admin"],
    },
  },
} as const

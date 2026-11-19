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
      appointments: {
        Row: {
          created_at: string
          doctor_id: string | null
          id: string
          notes: string | null
          patient_id: string
          scheduled_at: string | null
          status: string
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          scheduled_at?: string | null
          status?: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          scheduled_at?: string | null
          status?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      care_plans: {
        Row: {
          created_at: string
          department: string
          disease: string
          doctor_name: string | null
          id: string
          note: string | null
          open_ended: boolean
          patient_id: string
          period_end: string | null
          period_start: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string
          disease: string
          doctor_name?: string | null
          id?: string
          note?: string | null
          open_ended?: boolean
          patient_id: string
          period_end?: string | null
          period_start?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string
          disease?: string
          doctor_name?: string | null
          id?: string
          note?: string | null
          open_ended?: boolean
          patient_id?: string
          period_end?: string | null
          period_start?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          patient_id: string
          sender_name: string
          sender_role: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          patient_id: string
          sender_name: string
          sender_role: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          patient_id?: string
          sender_name?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      education_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          duration: string
          id: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          duration?: string
          id?: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          duration?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      followups: {
        Row: {
          created_at: string
          id: string
          item: string
          note: string | null
          patient_id: string
          post_discharge_day: number | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item: string
          note?: string | null
          patient_id: string
          post_discharge_day?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item?: string
          note?: string | null
          patient_id?: string
          post_discharge_day?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "followups_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          chief_complaint: string | null
          created_at: string
          diagnosis: string | null
          doctor_id: string | null
          id: string
          patient_id: string
          present_illness: string | null
          treatment_plan: string | null
          updated_at: string
        }
        Insert: {
          chief_complaint?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string | null
          id?: string
          patient_id: string
          present_illness?: string | null
          treatment_plan?: string | null
          updated_at?: string
        }
        Update: {
          chief_complaint?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string | null
          id?: string
          patient_id?: string
          present_illness?: string | null
          treatment_plan?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      nurse_tasks: {
        Row: {
          created_at: string
          due_text: string | null
          id: string
          kind: string
          patient_id: string
          source_plan_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_text?: string | null
          id?: string
          kind?: string
          patient_id: string
          source_plan_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_text?: string | null
          id?: string
          kind?: string
          patient_id?: string
          source_plan_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nurse_tasks_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nurse_tasks_source_plan_id_fkey"
            columns: ["source_plan_id"]
            isOneToOne: false
            referencedRelation: "care_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_checkins: {
        Row: {
          bp_morning: string | null
          created_at: string
          diet_kcal: number | null
          exercise_min: number | null
          id: string
          med_adherence: number | null
          patient_id: string
          recorded_on: string
          sleep_hours: number | null
        }
        Insert: {
          bp_morning?: string | null
          created_at?: string
          diet_kcal?: number | null
          exercise_min?: number | null
          id?: string
          med_adherence?: number | null
          patient_id: string
          recorded_on?: string
          sleep_hours?: number | null
        }
        Update: {
          bp_morning?: string | null
          created_at?: string
          diet_kcal?: number | null
          exercise_min?: number | null
          id?: string
          med_adherence?: number | null
          patient_id?: string
          recorded_on?: string
          sleep_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_checkins_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_documents: {
        Row: {
          created_at: string
          id: string
          kind: string
          path: string
          patient_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          path: string
          patient_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          path?: string
          patient_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_education: {
        Row: {
          education_item_id: string
          id: string
          patient_id: string
          pushed_at: string
          read_at: string | null
          status: string
        }
        Insert: {
          education_item_id: string
          id?: string
          patient_id: string
          pushed_at?: string
          read_at?: string | null
          status?: string
        }
        Update: {
          education_item_id?: string
          id?: string
          patient_id?: string
          pushed_at?: string
          read_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_education_education_item_id_fkey"
            columns: ["education_item_id"]
            isOneToOne: false
            referencedRelation: "education_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_education_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          abnormal: boolean
          ad8: number | null
          adl: number | null
          age: number
          ai_plan: Json | null
          ai_plan_at: string | null
          ai_plan_confirmed_at: string | null
          ai_plan_confirmed_by: string | null
          ai_risk: Json | null
          ai_risk_at: string | null
          allergy: string | null
          appointment_time: string | null
          bed_number: string | null
          bp: string | null
          caregiver: string | null
          cognitive_diagnosis: string | null
          cognitive_risk: string | null
          community_stage: string | null
          condition_category: string | null
          created_at: string
          diagnosis: string
          doctor_id: string | null
          gender: string
          glucose: string | null
          hospital_stage: string | null
          hr: string | null
          id: string
          id_no: string | null
          last_visit: string | null
          ldl: string | null
          lifestyle_warnings: string[]
          limb_power: string | null
          mmse: number | null
          moca: number | null
          mrs: string | null
          name: string
          next_reassess: string | null
          nihss: string | null
          phone: string | null
          refer_dept: string | null
          refer_doctor: string | null
          risk_tags: string[]
          scd_q9: number | null
          source: Database["public"]["Enums"]["patient_source"]
          status: Database["public"]["Enums"]["patient_status"]
          stroke_type: string | null
          updated_at: string
          vip: boolean
          vitals_flags: Json
        }
        Insert: {
          abnormal?: boolean
          ad8?: number | null
          adl?: number | null
          age: number
          ai_plan?: Json | null
          ai_plan_at?: string | null
          ai_plan_confirmed_at?: string | null
          ai_plan_confirmed_by?: string | null
          ai_risk?: Json | null
          ai_risk_at?: string | null
          allergy?: string | null
          appointment_time?: string | null
          bed_number?: string | null
          bp?: string | null
          caregiver?: string | null
          cognitive_diagnosis?: string | null
          cognitive_risk?: string | null
          community_stage?: string | null
          condition_category?: string | null
          created_at?: string
          diagnosis: string
          doctor_id?: string | null
          gender: string
          glucose?: string | null
          hospital_stage?: string | null
          hr?: string | null
          id?: string
          id_no?: string | null
          last_visit?: string | null
          ldl?: string | null
          lifestyle_warnings?: string[]
          limb_power?: string | null
          mmse?: number | null
          moca?: number | null
          mrs?: string | null
          name: string
          next_reassess?: string | null
          nihss?: string | null
          phone?: string | null
          refer_dept?: string | null
          refer_doctor?: string | null
          risk_tags?: string[]
          scd_q9?: number | null
          source?: Database["public"]["Enums"]["patient_source"]
          status?: Database["public"]["Enums"]["patient_status"]
          stroke_type?: string | null
          updated_at?: string
          vip?: boolean
          vitals_flags?: Json
        }
        Update: {
          abnormal?: boolean
          ad8?: number | null
          adl?: number | null
          age?: number
          ai_plan?: Json | null
          ai_plan_at?: string | null
          ai_plan_confirmed_at?: string | null
          ai_plan_confirmed_by?: string | null
          ai_risk?: Json | null
          ai_risk_at?: string | null
          allergy?: string | null
          appointment_time?: string | null
          bed_number?: string | null
          bp?: string | null
          caregiver?: string | null
          cognitive_diagnosis?: string | null
          cognitive_risk?: string | null
          community_stage?: string | null
          condition_category?: string | null
          created_at?: string
          diagnosis?: string
          doctor_id?: string | null
          gender?: string
          glucose?: string | null
          hospital_stage?: string | null
          hr?: string | null
          id?: string
          id_no?: string | null
          last_visit?: string | null
          ldl?: string | null
          lifestyle_warnings?: string[]
          limb_power?: string | null
          mmse?: number | null
          moca?: number | null
          mrs?: string | null
          name?: string
          next_reassess?: string | null
          nihss?: string | null
          phone?: string | null
          refer_dept?: string | null
          refer_doctor?: string | null
          risk_tags?: string[]
          scd_q9?: number | null
          source?: Database["public"]["Enums"]["patient_source"]
          status?: Database["public"]["Enums"]["patient_status"]
          stroke_type?: string | null
          updated_at?: string
          vip?: boolean
          vitals_flags?: Json
        }
        Relationships: []
      }
      plan_reviews: {
        Row: {
          category: string
          created_at: string
          department: string
          disease: string
          id: string
          patient_id: string
          status: string
          submitted_at: string
          summary: string
        }
        Insert: {
          category: string
          created_at?: string
          department?: string
          disease: string
          id?: string
          patient_id: string
          status?: string
          submitted_at?: string
          summary: string
        }
        Update: {
          category?: string
          created_at?: string
          department?: string
          disease?: string
          id?: string
          patient_id?: string
          status?: string
          submitted_at?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_reviews_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string
          diagnosis: string | null
          doctor_id: string | null
          id: string
          medications: Json
          notes: string | null
          patient_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string | null
          id?: string
          medications?: Json
          notes?: string | null
          patient_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string | null
          id?: string
          medications?: Json
          notes?: string | null
          patient_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          dept: string | null
          direction: string
          doctor_name: string | null
          feedback: string | null
          from_hospital: string
          id: string
          patient_id: string
          reason: string | null
          received_at: string | null
          status: string
          to_community: string
        }
        Insert: {
          created_at?: string
          dept?: string | null
          direction?: string
          doctor_name?: string | null
          feedback?: string | null
          from_hospital?: string
          id?: string
          patient_id: string
          reason?: string | null
          received_at?: string | null
          status?: string
          to_community?: string
        }
        Update: {
          created_at?: string
          dept?: string | null
          direction?: string
          doctor_name?: string | null
          feedback?: string | null
          from_hospital?: string
          id?: string
          patient_id?: string
          reason?: string | null
          received_at?: string | null
          status?: string
          to_community?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      scale_assessments: {
        Row: {
          assessed_by: string | null
          created_at: string
          id: string
          items: Json
          patient_id: string
          scale: string
          total: number
        }
        Insert: {
          assessed_by?: string | null
          created_at?: string
          id?: string
          items?: Json
          patient_id: string
          scale: string
          total: number
        }
        Update: {
          assessed_by?: string | null
          created_at?: string
          id?: string
          items?: Json
          patient_id?: string
          scale?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "scale_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      screenings: {
        Row: {
          ad8: number
          age: number
          appointment_at: string | null
          created_at: string
          exam_date: string
          gender: string
          id: string
          name: string
          note: string | null
          patient_id: string | null
          phone: string | null
          refer_to: string | null
          status: string
          updated_at: string
          verified_by: string | null
        }
        Insert: {
          ad8: number
          age: number
          appointment_at?: string | null
          created_at?: string
          exam_date?: string
          gender?: string
          id?: string
          name: string
          note?: string | null
          patient_id?: string | null
          phone?: string | null
          refer_to?: string | null
          status?: string
          updated_at?: string
          verified_by?: string | null
        }
        Update: {
          ad8?: number
          age?: number
          appointment_at?: string | null
          created_at?: string
          exam_date?: string
          gender?: string
          id?: string
          name?: string
          note?: string | null
          patient_id?: string | null
          phone?: string | null
          refer_to?: string | null
          status?: string
          updated_at?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "screenings_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      training_records: {
        Row: {
          activity: string
          completion: string
          created_at: string
          domain: string
          duration_min: number
          feedback: string | null
          id: string
          operator: string | null
          patient_id: string
          setting: string
          trained_on: string
          training_time: string | null
        }
        Insert: {
          activity: string
          completion?: string
          created_at?: string
          domain: string
          duration_min?: number
          feedback?: string | null
          id?: string
          operator?: string | null
          patient_id: string
          setting?: string
          trained_on?: string
          training_time?: string | null
        }
        Update: {
          activity?: string
          completion?: string
          created_at?: string
          domain?: string
          duration_min?: number
          feedback?: string | null
          id?: string
          operator?: string | null
          patient_id?: string
          setting?: string
          trained_on?: string
          training_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_plans: {
        Row: {
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          id: string
          patient_id: string
          plan: Json
          risk: string | null
        }
        Insert: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          patient_id: string
          plan: Json
          risk?: string | null
        }
        Update: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          patient_id?: string
          plan?: Json
          risk?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treatment_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      uploads: {
        Row: {
          created_at: string
          id: string
          note: string | null
          patient_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          patient_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          patient_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploads_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_program_member: { Args: never; Returns: boolean }
      save_treatment_revision: {
        Args: { _expected_at: string; _patient_id: string; _plan: Json }
        Returns: string
      }
    }
    Enums: {
      app_role: "doctor" | "nurse" | "community" | "patient"
      patient_source: "南京市鼓楼医院" | "兰园社区" | "小市社区"
      patient_status: "候诊中" | "接诊中" | "待处方" | "已完成"
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
      app_role: ["doctor", "nurse", "community", "patient"],
      patient_source: ["南京市鼓楼医院", "兰园社区", "小市社区"],
      patient_status: ["候诊中", "接诊中", "待处方", "已完成"],
    },
  },
} as const

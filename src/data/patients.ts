import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// 四端共用的数据层：所有患者与流程记录都来自同一个数据库。
// 端与端之间看到的必须是同一个人，所以这里只做读取与写入，不再放任何硬编码名单。

export type Source = "南京市鼓楼医院" | "小市社区";
export type CognitiveRisk = "低风险" | "中风险" | "高风险";
/** 护士端(评估师/治疗管理师)阶段 */
export type HospitalStage = "待评估" | "评估中" | "待转诊" | "历史";
/** 社区端(认知训练站)阶段 */
export type CommunityStage = "新接收" | "干预中" | "待复评" | "历史";
export type FollowupStatus = "待随访" | "需复访" | "已完成";
export type ReferralStatus = "待接收" | "已接收";
export type TaskKind = "待办" | "宣教" | "转诊";
export type TaskStatus = "待执行" | "已完成";

export type Patient = {
  id: string;
  name: string;
  gender: "男" | "女";
  age: number;
  phone: string | null;
  diagnosis: string;
  allergy: string | null;
  source: Source;
  bed_number: string | null;
  id_no: string | null;
  vip: boolean;
  stroke_type: string | null;
  condition_category: string | null;
  hospital_stage: HospitalStage | null;
  community_stage: CommunityStage | null;
  ai_plan: unknown;
  ai_plan_at: string | null;
  abnormal: boolean;
  last_visit: string | null;
  refer_dept: string | null;
  refer_doctor: string | null;
  nihss: string | null;
  mrs: string | null;
  limb_power: string | null;
  bp: string | null;
  hr: string | null;
  ldl: string | null;
  glucose: string | null;
  vitals_flags: Record<string, "正常" | "偏高" | "偏低" | "异常">;
  risk_tags: string[];
  lifestyle_warnings: string[];
  ad8: number | null;
  mmse: number | null;
  moca: number | null;
  scd_q9: number | null;
  adl: number | null;
  cognitive_risk: CognitiveRisk | null;
  cognitive_diagnosis: string | null;
  next_reassess: string | null;
  caregiver: string | null;
  created_at: string;
};

export type CarePlan = {
  id: string;
  patient_id: string;
  disease: string;
  department: string;
  period_start: string | null;
  period_end: string | null;
  open_ended: boolean;
  status: "进行中" | "已过期";
  note: string | null;
  doctor_name: string | null;
};

export type PlanReview = {
  id: string;
  patient_id: string;
  disease: string;
  department: string;
  category: "需就诊" | "目标和方案" | "康复训练";
  summary: string;
  status: "审核中" | "已审核" | "已通过";
  submitted_at: string;
};

export type NurseTask = {
  id: string;
  patient_id: string;
  title: string;
  kind: TaskKind;
  due_text: string | null;
  status: TaskStatus;
  source_plan_id: string | null;
};

export type EducationItem = {
  id: string;
  title: string;
  category: string;
  duration: string;
  description: string | null;
};

export type PatientEducation = {
  id: string;
  patient_id: string;
  education_item_id: string;
  status: "未读" | "已读";
  pushed_at: string;
  read_at: string | null;
};

export type Referral = {
  id: string;
  patient_id: string;
  from_hospital: string;
  to_community: string;
  reason: string | null;
  status: ReferralStatus;
  doctor_name: string | null;
  direction: "上转" | "下转";
  created_at: string;
  received_at: string | null;
};

export type Followup = {
  id: string;
  patient_id: string;
  status: FollowupStatus;
  item: string;
  post_discharge_day: number | null;
  note: string | null;
};

export type Upload = {
  id: string;
  patient_id: string;
  status: "已上传" | "已接收";
  note: string | null;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  patient_id: string;
  sender_role: "patient" | "doctor" | "nurse" | "community";
  sender_name: string;
  content: string;
  created_at: string;
};

export type Checkin = {
  id: string;
  patient_id: string;
  recorded_on: string;
  diet_kcal: number | null;
  exercise_min: number | null;
  med_adherence: number | null;
  sleep_hours: number | null;
  bp_morning: string | null;
};

export type Med = {
  name: string;
  dose: string;
  freq: string;
  start: string;
  end: string;
  days: number;
  status: "进行中" | "已停用";
};

// 患者端演示身份：登录账号同时持有 patient 身份，这里固定指向档案中的某位患者。
export const DEMO_PATIENT_NAME = "王建国";

const PATIENT_FIELDS =
  "id, name, gender, age, phone, diagnosis, allergy, source, bed_number, id_no, vip, stroke_type, condition_category, hospital_stage, community_stage, abnormal, last_visit, refer_dept, refer_doctor, nihss, mrs, limb_power, bp, hr, ldl, glucose, vitals_flags, risk_tags, lifestyle_warnings, ad8, mmse, moca, scd_q9, adl, cognitive_risk, cognitive_diagnosis, next_reassess, caregiver, ai_plan, ai_plan_at, created_at";

async function pick<T>(query: { then: (r: (v: { data: T | null; error: unknown }) => void) => unknown }, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    query.then(({ data, error }) => {
      if (error) reject(new Error(`${label}: ${JSON.stringify(error)}`));
      else resolve(data as T);
    });
  });
}

/** 患者名单。scope=all 为医生端全量；hospital 为护士端在院；community 为社区端在管。 */
export function usePatients(scope: "all" | "hospital" | "community" = "all") {
  return useQuery({
    queryKey: ["patients", scope],
    queryFn: async () => {
      let q = supabase.from("patients").select(PATIENT_FIELDS).order("abnormal", { ascending: false }).order("name");
      if (scope === "hospital") q = q.not("hospital_stage", "is", null);
      if (scope === "community") q = q.not("community_stage", "is", null);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Patient[];
    },
  });
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: ["patient", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select(PATIENT_FIELDS).eq("id", id).single();
      if (error) throw error;
      return data as Patient;
    },
  });
}

export function usePatientByName(name: string) {
  return useQuery({
    queryKey: ["patient-by-name", name],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select(PATIENT_FIELDS).eq("name", name).maybeSingle();
      if (error) throw error;
      return (data ?? null) as Patient | null;
    },
  });
}

/** 患者端当前身份：演示账号固定对应档案中的一位患者。 */
export function useCurrentPatient() {
  return usePatientByName(DEMO_PATIENT_NAME);
}

/** 当前登录者的档案（姓名/科室），四端顶部问候都读这一条。 */
export function useMyProfile() {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, role, department, phone")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as { full_name: string | null; role: string | null; department: string | null; phone: string | null } | null;
    },
  });
}

/** 当前登录者持有的职务，用于判断能进哪一端。 */
export function useMyRoles() {
  return useQuery({
    queryKey: ["my-roles"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [] as string[];
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (error) throw error;
      return (data ?? []).map((r) => r.role as string);
    },
  });
}

export function useCarePlans(patientId?: string) {
  return useQuery({
    queryKey: ["care-plans", patientId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("care_plans").select("*").order("period_start", { ascending: false });
      if (patientId) q = q.eq("patient_id", patientId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as CarePlan[];
    },
  });
}

export function usePlanReviews() {
  return useQuery({
    queryKey: ["plan-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plan_reviews")
        .select("*, patients(name)")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as (PlanReview & { patients: { name: string } | null })[];
    },
  });
}

export function useNurseTasks() {
  return useQuery({
    queryKey: ["nurse-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nurse_tasks")
        .select("*, patients(name, bed_number, community_stage, hospital_stage)")
        .order("status")
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as (NurseTask & {
        patients: { name: string; bed_number: string | null; community_stage: CommunityStage | null; hospital_stage: HospitalStage | null } | null;
      })[];
    },
  });
}

export function useFollowups() {
  return useQuery({
    queryKey: ["followups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("followups")
        .select("*, patients(name, source, community_stage)")
        .order("post_discharge_day", { ascending: true });
      if (error) throw error;
      return (data ?? []) as (Followup & {
        patients: { name: string; source: Source; community_stage: CommunityStage | null } | null;
      })[];
    },
  });
}

export function useReferrals() {
  return useQuery({
    queryKey: ["referrals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select("*, patients(name, source, community_stage, abnormal)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as (Referral & {
        patients: { name: string; source: Source; community_stage: CommunityStage | null; abnormal: boolean } | null;
      })[];
    },
  });
}

export function useUploads() {
  return useQuery({
    queryKey: ["uploads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("uploads")
        .select("*, patients(name, source)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as (Upload & { patients: { name: string; source: Source } | null })[];
    },
  });
}

export function useEducationItems() {
  return useQuery({
    queryKey: ["education-items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("education_items").select("*").order("category");
      if (error) throw error;
      return (data ?? []) as EducationItem[];
    },
  });
}

export function usePatientEducation(patientId?: string) {
  return useQuery({
    queryKey: ["patient-education", patientId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("patient_education").select("*, education_items(title, category, duration, description)").order("pushed_at", { ascending: false });
      if (patientId) q = q.eq("patient_id", patientId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as (PatientEducation & {
        education_items: { title: string; category: string; duration: string; description: string | null } | null;
      })[];
    },
  });
}

export function useChatMessages(patientId?: string) {
  return useQuery({
    queryKey: ["chat-messages", patientId ?? "all"],
    enabled: !!patientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ChatMessage[];
    },
  });
}

export function useCheckin(patientId?: string) {
  return useQuery({
    queryKey: ["checkin", patientId ?? "none"],
    enabled: !!patientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_checkins")
        .select("*")
        .eq("patient_id", patientId)
        .order("recorded_on", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Checkin | null;
    },
  });
}

/** 用药清单：取自该患者最近一次处方的 medications。 */
export function useMeds(patientId?: string) {
  return useQuery({
    queryKey: ["meds", patientId ?? "none"],
    enabled: !!patientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prescriptions")
        .select("medications, notes, diagnosis")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return {
        meds: ((data?.medications ?? []) as Med[]),
        notes: (data?.notes ?? null) as string | null,
        diagnosis: (data?.diagnosis ?? null) as string | null,
      };
    },
  });
}

// —— 写入：流程动作必须落库，不能只弹提示 ——

export function useCreateReferral() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { patientId: string; reason: string; doctorName?: string; direction?: "上转" | "下转" }) => {
      const { data, error } = await supabase
        .from("referrals")
        .insert({ patient_id: input.patientId, reason: input.reason, doctor_name: input.doctorName ?? null, status: "待接收", direction: input.direction ?? "下转", ...(input.direction === "上转" ? { from_hospital: "小市社区", to_community: "南京市鼓楼医院" } : {}) })
        .select("*")
        .single();
      if (error) throw error;
      return data as Referral;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referrals"] });
      qc.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useReceiveReferral() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { referralId: string; patientId: string }) => {
      const { error: e1 } = await supabase
        .from("referrals")
        .update({ status: "已接收", received_at: new Date().toISOString() })
        .eq("id", input.referralId);
      if (e1) throw e1;
      const { error: e2 } = await supabase
        .from("patients")
        .update({ community_stage: "新接收", source: "南京市鼓楼医院", last_visit: "刚刚下转" })
        .eq("id", input.patientId);
      if (e2) throw e2;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referrals"] });
      qc.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

/** 单患者上传至鼓楼医院：写入 uploads，并把社区阶段推进为复诊待约。 */
export function useCreateUpload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { patientId: string; note?: string }) => {
      const { data, error } = await supabase
        .from("uploads")
        .insert({ patient_id: input.patientId, note: input.note ?? null, status: "已上传" })
        .select("*")
        .single();
      if (error) throw error;
      const { error: e2 } = await supabase
        .from("patients")
        .update({ community_stage: "待复评", last_visit: "刚刚上传鼓楼" })
        .eq("id", input.patientId);
      if (e2) throw e2;
      return data as Upload;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["uploads"] });
      qc.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase.from("nurse_tasks").update({ status: "已完成" }).eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nurse-tasks"] }),
  });
}

export function usePushEducation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { patientId: string; itemId: string }) => {
      const { error } = await supabase
        .from("patient_education")
        .upsert({ patient_id: input.patientId, education_item_id: input.itemId, status: "未读", pushed_at: new Date().toISOString() }, { onConflict: "patient_id,education_item_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patient-education"] });
      qc.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { patientId: string; senderRole: ChatMessage["sender_role"]; senderName: string; content: string }) => {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          patient_id: input.patientId,
          sender_role: input.senderRole,
          sender_name: input.senderName,
          content: input.content,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as ChatMessage;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["chat-messages", v.patientId] }),
  });
}

/** 来源渠道标签：所有患者列表都必须能看出人是从哪来的。 */
export function sourceLabel(source: Source) {
  return source === "南京市鼓楼医院" ? "鼓楼" : "小市社区";
}

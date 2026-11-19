import { createClient } from "npm:@supabase/supabase-js@2";
import { generateResponse, GatewayError } from "npm:@lovable.dev/ai-gateway";
import { TREATMENT_PROTOCOL } from "../_shared/treatment.ts";
import { latestSelfAssessments, latestDoctorAssessments } from "../_shared/selfAssessment.ts";
import { editablePlanSchema } from "../_shared/planValidation.ts";
import { draftPlanUpdate } from "../_shared/planRevision.ts";
import { z } from "npm:zod@3";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const cors = corsHeaders;
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });


const schema = {
  type: "object", additionalProperties: false,
  required: ["summary", "focus", "training", "followup", "caregiver_tips", "red_flags", "interventions"],
  properties: {
    summary: { type: "string" },
    focus: { type: "array", items: { type: "string" } },
    interventions: {
      type: "array", items: {
        type: "object", additionalProperties: false,
        required: ["category", "actions", "frequency", "duration"],
        properties: { category: { type: "string" }, actions: { type: "array", items: { type: "string" } }, frequency: { type: "string" }, duration: { type: "string" } },
      },
    },
    training: {
      type: "array",
      items: {
        type: "object", additionalProperties: false,
        required: ["domain", "activity", "frequency", "duration", "setting"],
        properties: {
          domain: { type: "string", enum: ["记忆", "注意力", "执行功能", "定向力", "视空间", "语言", "计算", "逻辑与问题解决"] },
          activity: { type: "string" }, frequency: { type: "string" }, duration: { type: "string" },
          setting: { type: "string", enum: ["站内小组", "站内个训", "家庭作业", "家庭病床", "上门康复"] },
        },
      },
    },
    followup: {
      type: "object", additionalProperties: false, required: ["cycle", "reassess", "items"],
      properties: { cycle: { type: "string" }, reassess: { type: "string" }, items: { type: "array", items: { type: "string" } } },
    },
    caregiver_tips: { type: "array", items: { type: "string" } },
    red_flags: { type: "array", items: { type: "string" } },
  },
};

const riskSchema = {
  type: "object", additionalProperties: false,
  required: ["risk", "summary", "basis", "impaired_domains", "refer", "next_step"],
  properties: {
    risk: { type: "string", enum: ["低风险", "中风险", "高风险"] },
    summary: { type: "string" },
    basis: { type: "array", items: { type: "string" } },
    impaired_domains: { type: "array", items: { type: "string" } },
    refer: { type: "boolean" },
    next_step: { type: "string" },
  },
};

const outText = (res: unknown) => (res as { output_text?: string }).output_text
  ?? (res as any).output?.flatMap((o: any) => o.content ?? []).find((c: any) => c.type === "output_text")?.text;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const auth = req.headers.get("Authorization");
  if (!auth) return json({ error: "请先登录" }, 401);
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !key) return json({ error: "服务配置不可用" }, 500);
  const sb = createClient(url, key, { global: { headers: { Authorization: auth } } });
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return json({ error: "请先登录" }, 401);

  let body: { patientId?: string; self?: Record<string, number>; careNeeds?: string; mode?: string; items?: Record<string, unknown> };
  try { body = await req.json(); } catch { return json({ error: "请求格式错误" }, 400); }
  const parsed = z.object({ patientId: z.string().uuid(), careNeeds: z.string().max(1000).default(""), mode: z.enum(["risk", "edit"]).optional(), items: z.record(z.unknown()).optional(), plan: z.unknown().optional(), baseAt: z.string().nullable().optional() }).safeParse(body);
  if (!parsed.success) return json({ error: "参数不完整或格式错误" }, 400);
  const { patientId, careNeeds } = parsed.data;

  if (parsed.data.mode === "edit") {
    const { data: roles } = await sb.from("user_roles").select("role").eq("user_id", u.user.id);
    if (!roles?.some(r => r.role === "doctor")) return json({ error: "仅医院医生可修改治疗方案" }, 403);
    const plan = editablePlanSchema.safeParse(parsed.data.plan);
    if (!plan.success) return json({ error: "请补全训练内容、频次、时长及治疗措施" }, 400);
    const { data: current } = await sb.from("patients").select("ai_plan,ai_plan_at,cognitive_risk").eq("id", patientId).single();
    if (!current?.ai_plan || current.ai_plan_at !== parsed.data.baseAt) return json({ error: "方案已更新，请重新打开最新方案再修改" }, 409);
    const now = new Date().toISOString();
    const updated = { ...(current.ai_plan as Record<string, unknown>), ...plan.data, edited_at: now, edited_by: "医院医生" };
    const { error: saveError } = await sb.from("patients").update(draftPlanUpdate(updated, now)).eq("id", patientId).eq("ai_plan_at", parsed.data.baseAt).select("id").single();
    if (saveError) return json({ error: "保存失败或方案已被修改，请重新打开" }, 409);
    const { error: historyError } = await sb.from("treatment_plans").insert({ patient_id: patientId, plan: updated, risk: current.cognitive_risk, created_at: now });
    if (historyError) return json({ error: "方案已保存，但历史记录保存失败，请联系管理员" }, 500);
    return json({ advice: updated });
  }

  const { data: p, error } = await sb.from("patients")
    .select("name,gender,age,cognitive_diagnosis,cognitive_risk,ad8,mmse,moca,scd_q9,adl,caregiver,risk_tags")
    .eq("id", patientId).maybeSingle();
  if (error || !p) return json({ error: "无权访问或未找到该老人档案" }, 404);

  if (body.mode === "risk") {
    const itemText = JSON.stringify(body.items ?? {}).slice(0, 4000);
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions: "你是老年认知评估专家，依据量表结果给出风险分层。分层标准（《老年认知训练站建设基本标准》）：低风险=认知正常或主观认知下降(SCD)；中风险=轻度认知障碍(MCI)或轻、中度痴呆；高风险=重度痴呆。" +
          "参考界值：MMSE 27-30 正常、21-26 轻度、10-20 中度、<10 重度（需结合文化程度）；MoCA <26 提示认知障碍；SCD-Q9 ≥5 提示主观认知下降；Barthel ADL <40 重度依赖。中、高风险需转诊上级指导中心确诊。用简洁中文，不做最终诊断。",
        input: [{ role: "user", content: `老人：${p.name}，${p.gender}，${p.age}岁；SCD-Q9 ${p.scd_q9 ?? "-"}，MMSE ${p.mmse ?? "-"}，MoCA ${p.moca ?? "-"}，ADL ${p.adl ?? "-"}，AD-8 ${p.ad8 ?? "-"}；危险因素：${(p.risk_tags ?? []).join("、") || "无"}。\n逐项得分：${itemText}\n请给出风险等级、依据（3-5条）、受损认知领域、是否需转诊及下一步。` }],
        text: { format: { type: "json_schema", name: "risk_analysis", strict: true, schema: riskSchema } },
      });
      const out = outText(res);
      if (!out) return json({ error: "模型未返回内容，请稍后重试" }, 502);
      const analysis = JSON.parse(out);
      await sb.from("patients").update({ ai_risk: analysis, ai_risk_at: new Date().toISOString() }).eq("id", patientId);
      return json({ analysis });
    } catch (e) {
      console.error(e);
      const st = e instanceof GatewayError ? e.httpStatus ?? 500 : 500;
      return json({ error: st === 402 ? "AI 额度不足，请联系管理员充值" : st === 429 ? "请求太频繁，请稍后再试" : "分析失败，请稍后重试" }, st);
    }
  }

  const { data: selfRecords, error: selfError } = await sb.from("scale_assessments").select("scale,items,total,created_at,assessed_by").eq("patient_id", patientId).order("created_at", { ascending: false });
  if (selfError) return json({ error: "自评记录读取失败" }, 500);
  const selfAssessments = latestSelfAssessments(selfRecords ?? []);
  const doctorRecords = latestDoctorAssessments(selfRecords ?? []);
  if (!doctorRecords.length) return json({ error: "请先由医生在量表库完成至少一份他评量表" }, 400);
  const missing = selfAssessments.filter(x => !x.record);
  if (missing.length) return json({ error: `请医生协助患者完成：${missing.map(x => x.questionnaire.name).join("、")}` }, 400);
  const selfText = selfAssessments.map(({ questionnaire: q, record }) => {
    if (!record) return "";
    const answers = record.items as Record<string, number>;
    return `${q.name}（简版，非正式诊断量表）：总分${record.total}，填写人${record.assessed_by}，日期${record.created_at}；` + q.questions.map(item => `${item.text}：${item.options.find(o => o.score === answers[item.id])?.label}（${answers[item.id]}分）`).join("；");
  }).join("\n");

  try {
    const res = await generateResponse({
      model: "openai/gpt-6-astra",
      instructions:
        "你是江苏省老年认知训练站的认知康复顾问，为训练站评估师/治疗管理师生成可执行建议。遵循《老年认知训练站建设基本标准》：" +
        "风险分层 低风险(认知正常/SCD)→宣教+每年复评；中风险(MCI/轻中度痴呆)→认知训练、家庭作业每周1-2次、危险因素管理、每6个月复评；高风险(重度痴呆)→长期照护/家庭病床/上门评估、每3个月复评；每月随访。" +
        `严格遵循服务参数：${JSON.stringify(TREATMENT_PROTOCOL)}。` +
        "interventions须逐项包含该风险档位的所有治疗类型，每项给出结合本人量表和照护需求的具体措施、频次、时长。中风险认知训练累计20-36小时/期、6-12人小组，家庭作业每周1-2次、每次20-30分钟，另含非药物干预、风险管理、睡眠、营养、心理。高风险以长期护理、家庭病床准入评估、家庭病床框架内上门评估康复和风险管理为主，不套用中风险小组训练；不得声称未经评估已符合家庭病床准入。必须同时依据医生他评逐题得分与患者自评逐题答案选择训练领域。training必须包含3-6个可执行项目，activity逐项写明具体活动名称、目标、材料、分步骤操作、每步次数或分钟、难度调整和停止条件，不可仅写记忆训练等泛化描述。高风险训练在家庭病床/上门康复框架下由人员协助实施。结合睡眠、营养、跌倒、心理自评个性化调整，具体到频次时长，不做诊断，待医生确认后执行。",
      input: [{
        role: "user",
        content: `老人：${p.name}，${p.gender}，${p.age}岁；诊断：${p.cognitive_diagnosis ?? "未确诊"}；风险：${p.cognitive_risk ?? "未分级"}；` +
          `AD-8 ${p.ad8 ?? "-"}，MMSE ${p.mmse ?? "-"}，MoCA ${p.moca ?? "-"}，SCD-Q9 ${p.scd_q9 ?? "-"}，ADL ${p.adl ?? "-"}；危险因素：${(p.risk_tags ?? []).join("、") || "无"}；照护者：${p.caregiver ?? "未登记"}。\n` +
          `医生他评量表（真实保存记录，未完成量表不得推断正常）：${JSON.stringify(doctorRecords)}。\n老年综合评估自评：${selfText}。\n照护需求：${careNeeds || "未填写"}。\n请生成 3-6 项具体训练和随访计划。`,
      }],
      text: { format: { type: "json_schema", name: "cognitive_advice", strict: true, schema } },
    });
    const out = (res as { output_text?: string }).output_text
      ?? (res as any).output?.flatMap((o: any) => o.content ?? []).find((c: any) => c.type === "output_text")?.text;
    if (!out) return json({ error: "模型未返回内容，请稍后重试" }, 502);
    const advice = JSON.parse(out);
    advice.self_assessments = selfAssessments.map(({ questionnaire: q, record }) => ({ name: q.name, total: record?.total, assessed_at: record?.created_at, assessed_by: record?.assessed_by }));
    advice.doctor_assessments = doctorRecords.map(r => ({ name: r.scale, total: r.total, assessed_at: r.created_at, assessed_by: r.assessed_by, items: r.items }));
    const now = new Date().toISOString();
    const { error: planError } = await sb.from("patients").update(draftPlanUpdate(advice, now)).eq("id", patientId);
    if (planError) return json({ error: "治疗方案保存失败" }, 500);
    const { error: historyError } = await sb.from("treatment_plans").insert({ patient_id: patientId, plan: advice, risk: p.cognitive_risk ?? null, created_at: now });
    if (historyError) return json({ error: "治疗方案历史保存失败" }, 500);
    return json({ advice });
  } catch (e) {
    if (e instanceof GatewayError) {
      console.error("gateway", e.code, e.httpStatus, e.ids);
      const msg = e.httpStatus === 402 ? "AI 额度不足，请联系管理员充值" : e.httpStatus === 429 ? "请求太频繁，请稍后再试" : "AI 服务暂时不可用，请稍后重试";
      return json({ error: msg }, e.httpStatus ?? 500);
    }
    console.error(e);
    return json({ error: "生成失败，请稍后重试" }, 500);
  }
});

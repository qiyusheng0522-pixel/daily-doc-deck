import { createClient } from "npm:@supabase/supabase-js@2";
import { generateResponse, GatewayError } from "npm:@lovable.dev/ai-gateway";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

const LEVELS = ["正常", "轻度问题", "中度问题", "重度问题"];

const schema = {
  type: "object", additionalProperties: false,
  required: ["summary", "focus", "training", "followup", "caregiver_tips", "red_flags"],
  properties: {
    summary: { type: "string" },
    focus: { type: "array", items: { type: "string" } },
    training: {
      type: "array",
      items: {
        type: "object", additionalProperties: false,
        required: ["domain", "activity", "frequency", "duration", "setting"],
        properties: {
          domain: { type: "string", enum: ["记忆", "注意力", "执行功能", "定向力", "视空间", "语言", "计算", "逻辑与问题解决"] },
          activity: { type: "string" }, frequency: { type: "string" }, duration: { type: "string" },
          setting: { type: "string", enum: ["站内小组", "站内个训", "家庭作业"] },
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const auth = req.headers.get("Authorization");
  if (!auth) return json({ error: "请先登录" }, 401);
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return json({ error: "请先登录" }, 401);

  let body: { patientId?: string; self?: Record<string, number>; careNeeds?: string };
  try { body = await req.json(); } catch { return json({ error: "请求格式错误" }, 400); }
  const { patientId, self = {}, careNeeds = "" } = body;
  if (!patientId || careNeeds.length > 1000) return json({ error: "参数不完整或照护需求过长" }, 400);

  const { data: p, error } = await sb.from("patients")
    .select("name,gender,age,cognitive_diagnosis,cognitive_risk,ad8,mmse,moca,scd_q9,adl,caregiver,risk_tags")
    .eq("id", patientId).maybeSingle();
  if (error || !p) return json({ error: "无权访问或未找到该老人档案" }, 404);

  const selfText = ["睡眠", "营养", "跌倒风险", "精神心理"]
    .map((k) => `${k}：${LEVELS[self[k] ?? 0] ?? "未填"}`).join("；");

  try {
    const res = await generateResponse({
      model: "openai/gpt-6-astra",
      instructions:
        "你是江苏省老年认知训练站的认知康复顾问，为训练站评估师/治疗管理师生成可执行建议。遵循《老年认知训练站建设基本标准》：" +
        "风险分层 低风险(认知正常/SCD)→宣教+每年复评；中风险(MCI/轻中度痴呆)→认知训练、家庭作业每周1-2次、危险因素管理、每6个月复评；高风险(重度痴呆)→长期照护/家庭病床/上门评估、每3个月复评；每月随访。" +
        "小组训练6-12人、每周1-3次、每次20-30分钟。训练覆盖八大领域。结合睡眠、营养、跌倒、心理自评与照护需求个性化调整，用简洁中文，具体到频次时长，不做诊断。",
      input: [{
        role: "user",
        content: `老人：${p.name}，${p.gender}，${p.age}岁；诊断：${p.cognitive_diagnosis ?? "未确诊"}；风险：${p.cognitive_risk ?? "未分级"}；` +
          `AD-8 ${p.ad8 ?? "-"}，MMSE ${p.mmse ?? "-"}，MoCA ${p.moca ?? "-"}，SCD-Q9 ${p.scd_q9 ?? "-"}，ADL ${p.adl ?? "-"}；危险因素：${(p.risk_tags ?? []).join("、") || "无"}；照护者：${p.caregiver ?? "未登记"}。\n` +
          `老年综合评估自评：${selfText}。\n照护需求：${careNeeds || "未填写"}。\n请生成 3-6 项训练和随访计划。`,
      }],
      text: { format: { type: "json_schema", name: "cognitive_advice", strict: true, schema } },
    });
    const out = (res as { output_text?: string }).output_text
      ?? (res as any).output?.flatMap((o: any) => o.content ?? []).find((c: any) => c.type === "output_text")?.text;
    if (!out) return json({ error: "模型未返回内容，请稍后重试" }, 502);
    return json({ advice: JSON.parse(out) });
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

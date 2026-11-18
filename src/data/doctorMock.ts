// 卒中医生端 mock 数据
export const doctor = {
  name: "李思远",
  initial: "李",
  department: "神经内科",
  title: "主治医师",
};

export type PatientStatus = "我发起" | "VIP" | "过期" | "在期";

export interface DoctorPatient {
  id: string;
  name: string;
  initial: string;
  gender: "男" | "女";
  age: number;
  idNo: string;
  phone: string;
  createdAt: string;
  status?: PatientStatus;
  strokeType: string;
  riskTags: string[];
  lifestyleWarnings: string[];
  vitals: {
    bp: string;
    hr: string;
    ldl: string;
    glucose: string;
    nihss: string;
    mrs: string;
    limbPower: string;
  };
  vitalsFlags: Record<string, "正常" | "偏高" | "偏低" | "异常">;
  meds: {
    name: string;
    dose: string;
    freq: string;
    start: string;
    end: string;
    days: number;
    status: "进行中" | "已停用";
  }[];
  checkins: {
    diet: number;
    exercise: number;
    medAdherence: number;
    sleep: number;
    bpMorning: string;
  };
}

export const doctorPatients: DoctorPatient[] = [
  {
    id: "p1", name: "王建国", initial: "王", gender: "男", age: 62,
    idNo: "320831196312040031", phone: "13801234567", createdAt: "2026-07-08 09:12",
    status: "我发起", strokeType: "缺血性卒中",
    riskTags: ["高血压", "房颤", "高血脂"],
    lifestyleWarnings: ["盐摄入超标", "运动不足", "服药不规律"],
    vitals: { bp: "162/98 mmHg", hr: "88 次/分", ldl: "3.8 mmol/L", glucose: "6.2 mmol/L", nihss: "4 分", mrs: "2 级", limbPower: "左上肢 4 级" },
    vitalsFlags: { bp: "偏高", hr: "正常", ldl: "偏高", glucose: "正常", nihss: "异常", mrs: "异常", limbPower: "异常" },
    meds: [
      { name: "阿司匹林肠溶片（拜阿）", dose: "100 mg", freq: "每天1次", start: "2026-06-16", end: "长期", days: 32, status: "进行中" },
      { name: "阿托伐他汀钙片（立普妥）", dose: "20 mg", freq: "每晚1次", start: "2026-06-16", end: "长期", days: 32, status: "进行中" },
      { name: "苯磺酸氨氯地平片（络活喜）", dose: "5 mg", freq: "每天1次", start: "2026-06-16", end: "长期", days: 32, status: "进行中" },
    ],
    checkins: { diet: 1850, exercise: 20, medAdherence: 78, sleep: 6.2, bpMorning: "158/95" },
  },
  {
    id: "p2", name: "陈慧敏", initial: "陈", gender: "女", age: 58,
    idNo: "310110196805121028", phone: "13902345678", createdAt: "2026-07-03 10:05",
    status: "VIP", strokeType: "短暂性脑缺血 (TIA)",
    riskTags: ["高血压", "糖尿病"], lifestyleWarnings: ["睡眠不足", "饮水不足"],
    vitals: { bp: "148/92 mmHg", hr: "76 次/分", ldl: "2.9 mmol/L", glucose: "7.8 mmol/L", nihss: "1 分", mrs: "1 级", limbPower: "5 级 正常" },
    vitalsFlags: { bp: "偏高", hr: "正常", ldl: "正常", glucose: "偏高", nihss: "正常", mrs: "正常", limbPower: "正常" },
    meds: [
      { name: "氯吡格雷片（波立维）", dose: "75 mg", freq: "每天1次", start: "2026-06-20", end: "长期", days: 28, status: "进行中" },
      { name: "瑞舒伐他汀钙片", dose: "10 mg", freq: "每晚1次", start: "2026-06-20", end: "长期", days: 28, status: "进行中" },
    ],
    checkins: { diet: 1650, exercise: 35, medAdherence: 96, sleep: 6.5, bpMorning: "142/88" },
  },
  {
    id: "p3", name: "张 伟", initial: "张", gender: "男", age: 55,
    idNo: "110105197104220015", phone: "13703456789", createdAt: "2026-07-02 14:22",
    status: "VIP", strokeType: "缺血性卒中（大动脉粥样硬化）",
    riskTags: ["高血脂", "吸烟", "颈动脉狭窄"], lifestyleWarnings: ["吸烟未戒", "高脂饮食"],
    vitals: { bp: "138/86 mmHg", hr: "82 次/分", ldl: "4.2 mmol/L", glucose: "5.6 mmol/L", nihss: "3 分", mrs: "2 级", limbPower: "右下肢 4 级" },
    vitalsFlags: { bp: "正常", hr: "正常", ldl: "偏高", glucose: "正常", nihss: "异常", mrs: "异常", limbPower: "异常" },
    meds: [
      { name: "阿司匹林肠溶片", dose: "100 mg", freq: "每天1次", start: "2026-06-25", end: "长期", days: 23, status: "进行中" },
      { name: "阿托伐他汀钙片", dose: "40 mg", freq: "每晚1次", start: "2026-06-25", end: "长期", days: 23, status: "进行中" },
    ],
    checkins: { diet: 2100, exercise: 15, medAdherence: 88, sleep: 7.0, bpMorning: "135/84" },
  },
  {
    id: "p4", name: "刘美琳", initial: "刘", gender: "女", age: 67,
    idNo: "440304195908170042", phone: "13604567890", createdAt: "2026-06-11 08:40",
    status: "过期", strokeType: "出血性卒中（基底节区）",
    riskTags: ["高血压", "既往脑出血"], lifestyleWarnings: ["情绪波动大", "运动不足"],
    vitals: { bp: "170/102 mmHg", hr: "72 次/分", ldl: "2.4 mmol/L", glucose: "5.9 mmol/L", nihss: "6 分", mrs: "3 级", limbPower: "右上肢 3 级" },
    vitalsFlags: { bp: "异常", hr: "正常", ldl: "正常", glucose: "正常", nihss: "异常", mrs: "异常", limbPower: "异常" },
    meds: [
      { name: "硝苯地平控释片（拜新同）", dose: "30 mg", freq: "每天1次", start: "2026-05-20", end: "长期", days: 58, status: "进行中" },
      { name: "厄贝沙坦片", dose: "150 mg", freq: "每天1次", start: "2026-05-20", end: "长期", days: 58, status: "进行中" },
    ],
    checkins: { diet: 1550, exercise: 10, medAdherence: 65, sleep: 5.5, bpMorning: "168/100" },
  },
  {
    id: "p5", name: "赵国强", initial: "赵", gender: "男", age: 71,
    idNo: "210102195502100033", phone: "13505678901", createdAt: "2026-06-28 16:15",
    status: "在期", strokeType: "缺血性卒中（心源性栓塞）",
    riskTags: ["房颤", "心衰"], lifestyleWarnings: ["抗凝依从性差"],
    vitals: { bp: "132/80 mmHg", hr: "94 次/分（房颤）", ldl: "2.1 mmol/L", glucose: "5.4 mmol/L", nihss: "2 分", mrs: "1 级", limbPower: "5 级 正常" },
    vitalsFlags: { bp: "正常", hr: "异常", ldl: "正常", glucose: "正常", nihss: "正常", mrs: "正常", limbPower: "正常" },
    meds: [
      { name: "利伐沙班片（拜瑞妥）", dose: "20 mg", freq: "每天1次", start: "2026-06-10", end: "长期", days: 38, status: "进行中" },
      { name: "美托洛尔缓释片", dose: "47.5 mg", freq: "每天1次", start: "2026-06-10", end: "长期", days: 38, status: "进行中" },
    ],
    checkins: { diet: 1750, exercise: 25, medAdherence: 82, sleep: 6.8, bpMorning: "130/78" },
  },
  {
    id: "p6", name: "孙丽华", initial: "孙", gender: "女", age: 64,
    idNo: "330106196207220048", phone: "13406789012", createdAt: "2026-07-10 11:32",
    status: "在期", strokeType: "短暂性脑缺血 (TIA)",
    riskTags: ["高血压", "肥胖"], lifestyleWarnings: ["久坐", "高盐饮食"],
    vitals: { bp: "144/90 mmHg", hr: "78 次/分", ldl: "3.1 mmol/L", glucose: "5.8 mmol/L", nihss: "0 分", mrs: "0 级", limbPower: "5 级 正常" },
    vitalsFlags: { bp: "偏高", hr: "正常", ldl: "偏高", glucose: "正常", nihss: "正常", mrs: "正常", limbPower: "正常" },
    meds: [
      { name: "阿司匹林肠溶片", dose: "100 mg", freq: "每天1次", start: "2026-07-01", end: "长期", days: 17, status: "进行中" },
    ],
    checkins: { diet: 1900, exercise: 18, medAdherence: 91, sleep: 7.2, bpMorning: "141/89" },
  },
];

export interface PlanReview {
  id: string;
  patientId: string;
  patientName: string;
  disease: string;
  department: string;
  submittedAt: string;
  status: "审核中" | "已审核" | "已通过";
  category: "需就诊" | "目标和方案" | "康复训练";
  summary: string;
}

export const planReviews: PlanReview[] = [
  { id: "r1", patientId: "p1", patientName: "王建国", disease: "缺血性卒中", department: "神经内科", submittedAt: "2026-07-14 09:40:40", status: "审核中", category: "需就诊", summary: "普通评估: 患者62岁男性，血压持续偏高（162/98），LDL 3.8偏高，服药依从性78%，建议门诊调整降压方案并加强他汀…" },
  { id: "r2", patientId: "p2", patientName: "陈慧敏", disease: "TIA", department: "神经内科", submittedAt: "2026-07-13 10:05:13", status: "已审核", category: "需就诊", summary: "普通评估: 该58岁女性 TIA 后二级预防依从性尚可（96%），但空腹血糖偏高，建议内分泌科联合会诊评估糖代谢…" },
  { id: "r3", patientId: "p3", patientName: "张 伟", disease: "缺血性卒中", department: "神经内科", submittedAt: "2026-07-12 18:09:12", status: "审核中", category: "目标和方案", summary: "根据 ESSEN 卒中复发风险评分，该55岁男性合并颈动脉狭窄与吸烟史，属于高复发风险，建议强化他汀并戒烟干预…" },
  { id: "r4", patientId: "p4", patientName: "刘美琳", disease: "出血性卒中", department: "神经内科", submittedAt: "2026-07-11 15:22:08", status: "审核中", category: "康复训练", summary: "mRS 3级、右上肢肌力3级，建议进入卒中康复II期，强化上肢作业疗法+步态训练，每周5次…" },
  { id: "r5", patientId: "p5", patientName: "赵国强", disease: "心源性栓塞", department: "神经内科", submittedAt: "2026-07-10 09:18:45", status: "已审核", category: "目标和方案", summary: "房颤合并卒中，CHA2DS2-VASc 5分，已启动利伐沙班20mg抗凝，需监测出血风险并每月复查肝肾功能…" },
  { id: "r6", patientId: "p6", patientName: "孙丽华", disease: "TIA", department: "神经内科", submittedAt: "2026-07-09 14:12:33", status: "已通过", category: "目标和方案", summary: "TIA后一级预防方案，阿司匹林100mg qd，目标血压<130/80，LDL<2.6，3个月后复查颈动脉超声…" },
  { id: "r7", patientId: "p1", patientName: "王建国", disease: "缺血性卒中", department: "神经内科", submittedAt: "2026-07-08 11:40:20", status: "审核中", category: "需就诊", summary: "近1周晨起血压均>160/95，建议尽快返院评估，排除继发性高血压…" },
  { id: "r8", patientId: "p3", patientName: "张 伟", disease: "缺血性卒中", department: "神经内科", submittedAt: "2026-07-07 08:55:11", status: "审核中", category: "康复训练", summary: "右下肢4级，建议加入平衡训练与踝背伸肌群强化，配合家用康复评估量表每2周复评…" },
];

export interface Todo {
  id: string;
  type: "审核" | "回复" | "会诊";
  title: string;
  patient: string;
  time: string;
}

export const todos: Todo[] = [
  { id: "t1", type: "审核", title: "王建国 · 降压方案调整审核", patient: "王建国", time: "10:30 截止" },
  { id: "t2", type: "回复", title: "陈慧敏 询问：他汀可以隔天吃吗？", patient: "陈慧敏", time: "刚刚" },
  { id: "t3", type: "会诊", title: "刘美琳 康复科联合会诊", patient: "刘美琳", time: "今日 14:00" },
  { id: "t5", type: "审核", title: "张 伟 强化他汀方案", patient: "张 伟", time: "今日" },
  { id: "t6", type: "回复", title: "王建国 上传晨起血压记录", patient: "王建国", time: "1小时前" },
];

export interface ChatItem {
  id: string;
  patientId: string;
  patientName: string;
  initial: string;
  vip?: boolean;
  createdAt: string;
  tags: string[];
  warnings: string[];
  unread: number;
  lastMessage: string;
}

export const chats: ChatItem[] = [
  { id: "c1", patientId: "p1", patientName: "王建国", initial: "王", vip: false, createdAt: "2026-07-14 09:12", tags: ["缺血性卒中", "高血压", "房颤"], warnings: ["建议加强晨起血压监测", "服药依从性偏低"], unread: 2, lastMessage: "医生，早上血压又到160了…" },
  { id: "c2", patientId: "p2", patientName: "陈慧敏", initial: "陈", vip: true, createdAt: "2026-07-13 10:05", tags: ["TIA", "糖尿病"], warnings: ["空腹血糖偏高", "睡眠不足"], unread: 0, lastMessage: "谢谢李医生，我记住了" },
  { id: "c3", patientId: "p3", patientName: "张 伟", initial: "张", vip: true, createdAt: "2026-07-12 18:09", tags: ["缺血性卒中", "颈动脉狭窄"], warnings: ["LDL偏高", "吸烟未戒"], unread: 1, lastMessage: "戒烟真的很难…" },
  { id: "c4", patientId: "p4", patientName: "刘美琳", initial: "刘", createdAt: "2026-06-11 08:40", tags: ["出血性卒中", "高血压"], warnings: ["血压严重偏高", "康复进展缓慢"], unread: 3, lastMessage: "康复训练我坚持不下来" },
  { id: "c5", patientId: "p5", patientName: "赵国强", initial: "赵", createdAt: "2026-06-28 16:15", tags: ["心源性栓塞", "房颤"], warnings: ["抗凝依从性差"], unread: 0, lastMessage: "利伐沙班早上吃对吗？" },
  { id: "c6", patientId: "p6", patientName: "孙丽华", initial: "孙", createdAt: "2026-07-10 11:32", tags: ["TIA", "肥胖"], warnings: ["高盐饮食", "久坐"], unread: 0, lastMessage: "我这周走了3天" },
];

export interface PlanRecord {
  id: string;
  disease: string;
  department: string;
  time: string;
  status: "进行中" | "已过期";
  note?: string;
}

// 所有方案均已医生审核通过；仅区分"进行中"与"已过期"
export const planRecordsByPatient: Record<string, PlanRecord[]> = {
  p1: [
    { id: "pr1", disease: "缺血性卒中 · 二级预防", department: "神经内科", time: "2026-03-26 → 2026-04-25", status: "已过期", note: "李思远：入院初评，启动双抗+他汀" },
    { id: "pr2", disease: "缺血性卒中 · 降压调整", department: "神经内科", time: "2026-04-26 → 2026-06-25", status: "已过期", note: "李思远：加用氨氯地平" },
    { id: "pr3", disease: "缺血性卒中 · 强化降压", department: "神经内科", time: "2026-06-26 → 长期", status: "进行中", note: "李思远：目标血压 <130/80" },
  ],
  p2: [
    { id: "pr21", disease: "TIA · 抗血小板", department: "神经内科", time: "2026-05-01 → 2026-06-30", status: "已过期" },
    { id: "pr22", disease: "TIA · 联合降糖", department: "神经内科 / 内分泌", time: "2026-07-01 → 长期", status: "进行中", note: "李思远：联合内分泌，控糖优先" },
  ],
  p3: [
    { id: "pr31", disease: "缺血性卒中 · 戒烟干预", department: "神经内科", time: "2026-06-25 → 长期", status: "进行中" },
  ],
  p4: [
    { id: "pr41", disease: "出血性卒中 · 急性期", department: "神经内科", time: "2026-05-20 → 2026-06-30", status: "已过期" },
    { id: "pr42", disease: "康复II期方案", department: "康复医学科", time: "2026-07-01 → 长期", status: "进行中", note: "刘康：上肢作业疗法+步态训练" },
  ],
  p5: [
    { id: "pr51", disease: "心源性栓塞 · 抗凝", department: "神经内科", time: "2026-06-10 → 长期", status: "进行中", note: "利伐沙班 20 mg qd" },
  ],
  p6: [
    { id: "pr61", disease: "TIA · 一级预防", department: "神经内科", time: "2026-07-01 → 长期", status: "进行中" },
  ],
};

export const monthlyRevenue = {
  total: 0,
  completed: 0,
  pending: 0,
  label: "7月收益",
};

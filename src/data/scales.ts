/** 医生端量表定义：每项给出可选分值，总分=各项之和 */
export type ScaleKey = "scd_q9" | "mmse" | "moca" | "adl";
export type ScaleItem = { label: string; options: number[]; hint?: string };
export type Scale = { key: ScaleKey; name: string; max: number; desc: string; items: ScaleItem[] };

const range = (n: number) => Array.from({ length: n + 1 }, (_, i) => i);
const yn = (label: string): ScaleItem => ({ label, options: [0, 1], hint: "否=0 是=1" });

export const SCALES: Scale[] = [
  { key: "scd_q9", name: "SCD-Q9", max: 9, desc: "主观认知下降问卷，询问老人本人", items: [
    yn("感觉自己记忆力比以前差了"), yn("记忆力比同龄人差"), yn("记忆下降让您担忧"),
    yn("常忘记最近发生的事情"), yn("常忘记约会或要做的事"), yn("说话时常想不起合适的词"),
    yn("在熟悉的地方偶尔迷路"), yn("处理钱财或账单比以前困难"), yn("家人或朋友注意到您记忆变差"),
  ] },
  { key: "mmse", name: "MMSE", max: 30, desc: "简易精神状态检查", items: [
    { label: "时间定向（年/季/月/日/星期）", options: range(5) },
    { label: "地点定向（省/市/区/地点/楼层）", options: range(5) },
    { label: "即刻记忆（复述 3 个词）", options: range(3) },
    { label: "注意力与计算（100 连减 7）", options: range(5) },
    { label: "延迟回忆（3 个词）", options: range(3) },
    { label: "命名（手表、铅笔）", options: range(2) },
    { label: "复述句子", options: range(1) },
    { label: "三步指令", options: range(3) },
    { label: "阅读并执行", options: range(1) },
    { label: "书写句子", options: range(1) },
    { label: "临摹图形", options: range(1) },
  ] },
  { key: "moca", name: "MoCA", max: 30, desc: "蒙特利尔认知评估；受教育≤12 年加 1 分", items: [
    { label: "视空间与执行（连线/立方体/画钟）", options: range(5) },
    { label: "命名（3 种动物）", options: range(3) },
    { label: "注意力（数字广度/敲击/连减 7）", options: range(6) },
    { label: "语言（复述/词语流畅性）", options: range(3) },
    { label: "抽象思维", options: range(2) },
    { label: "延迟回忆（5 个词）", options: range(5) },
    { label: "定向力", options: range(6) },
    { label: "受教育 ≤12 年加分", options: [0, 1] },
  ] },
  { key: "adl", name: "ADL（Barthel）", max: 100, desc: "日常生活能力", items: [
    { label: "进食", options: [0, 5, 10] }, { label: "洗澡", options: [0, 5] }, { label: "修饰", options: [0, 5] },
    { label: "穿衣", options: [0, 5, 10] }, { label: "控制大便", options: [0, 5, 10] }, { label: "控制小便", options: [0, 5, 10] },
    { label: "如厕", options: [0, 5, 10] }, { label: "床椅转移", options: [0, 5, 10, 15] },
    { label: "平地行走", options: [0, 5, 10, 15] }, { label: "上下楼梯", options: [0, 5, 10] },
  ] },
];

export function scaleTotal(scale: Scale, picks: Record<number, number>): number | null {
  if (scale.items.some((_, i) => picks[i] == null)) return null;
  return Math.min(scale.max, scale.items.reduce((s, _, i) => s + picks[i], 0));
}

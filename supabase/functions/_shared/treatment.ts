/** Shared clinical service limits used in generation and review. */
export const TREATMENT_PROTOCOL = {
  中风险: {
    training: { weekly: [1, 3], minutes: [20, 30], courseHours: [20, 36], groupSize: [6, 12] },
    homework: { weekly: [1, 2], minutes: [20, 30] },
    categories: ["认知训练", "其他非药物干预", "家庭作业", "风险因素管理", "睡眠", "营养", "心理"],
  },
  高风险: {
    categories: ["长期护理或家庭病床服务", "家庭病床准入评估", "上门评估与康复干预", "风险因素管理"],
    requiresAdmissionAssessment: true,
  },
} as const;
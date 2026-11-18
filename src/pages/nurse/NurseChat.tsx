import { useMemo } from "react";
import { useParams } from "react-router-dom";
import ChatScreen, { ChatMsg, ChatPeer } from "@/components/chat/ChatScreen";

const seedByDoctor: ChatMsg[] = [
  { id: 1, from: "them", text: "张伟本周 MoCA 复评结果出来了吗?", time: "09:12", type: "text" },
  { id: 2, from: "me", text: "王主任,刚刚复测随机血压 16.8 mmHg,仍偏高。", time: "09:13", type: "text" },
  { id: 3, from: "them", text: "请加测一次尿酮体,并预约今晚抗凝药物剂量调整。", time: "09:14", type: "text" },
  { id: 4, from: "me", text: "好的,10 分钟后采样并回报。", time: "09:14", type: "text" },
];

const seedByPatient: ChatMsg[] = [
  { id: 1, from: "them", text: "老师，我最近总忘记关煤气，要紧吗?", time: "09:30", type: "text" },
  { id: 2, from: "me", text: "您先吃 15g 糖块或半杯果汁,我马上过来测血压。", time: "09:31", type: "text" },
  { id: 3, from: "them", text: "好的谢谢。", time: "09:31", type: "text" },
];

const NurseChat = () => {
  const { type = "doctor" } = useParams();
  const isDoctor = type === "doctor";

  const peer: ChatPeer = useMemo(() => {
    if (isDoctor) return { name: "王主任", sub: "记忆门诊 · 主治医师", phone: "13800138001", isDoctor: true };
    return {
      name: "张伟",
      sub: "床位 0312 · 58岁 · 男",
      phone: "13800138888",
      isDoctor: false,
      abnormal: true,
      diagnosis: "轻度认知障碍 · 后遗症 · 过敏:青霉素",
      vitals: [
        { label: "随机血压", value: "16.8", abnormal: true },
        { label: "MMSE", value: "9.2%" },
        { label: "血压", value: "138/86" },
      ],
    };
  }, [isDoctor]);

  return (
    <ChatScreen
      peer={peer}
      initialMessages={isDoctor ? seedByDoctor : seedByPatient}
      gradientClass="bg-gradient-nurse"
    />
  );
};

export default NurseChat;

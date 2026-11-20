import { communityWorkQueues } from "@/data/communityWork";
import { usePatients, useReferrals, useNurseTasks, useFollowups, useTrainingRecords } from "@/data/patients";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useCommunityWork() {
  const qc = useQueryClient();
  useEffect(() => {
    const timer = window.setInterval(() => {
      for (const key of ["patients", "nurse-tasks", "followups", "training-records"]) qc.invalidateQueries({ queryKey: [key] });
    }, 15000);
    return () => window.clearInterval(timer);
  }, [qc]);
  const patients = usePatients("all");
  const referrals = useReferrals();
  const tasks = useNurseTasks();
  const followups = useFollowups();
  const trainings = useTrainingRecords();
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Shanghai" }).format(new Date());
  return {
    ...communityWorkQueues(patients.data ?? [], referrals.data ?? [], tasks.data ?? [], followups.data ?? [], trainings.data ?? [], today),
    referrals: referrals.data ?? [],
    isLoading: patients.isLoading || referrals.isLoading || tasks.isLoading || followups.isLoading || trainings.isLoading,
  };
}
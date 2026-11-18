import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DemoSession from "@/components/DemoSession";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import ProvinceScreen from "./pages/screen/ProvinceScreen.tsx";
import ScreeningCenter from "./pages/screening/ScreeningCenter.tsx";

import DoctorLayout from "./pages/doctor/DoctorLayout.tsx";
import DoctorHome from "./pages/doctor/DoctorHome.tsx";
import DoctorPatients from "./pages/doctor/DoctorPatients.tsx";
import DoctorPatientDetail from "./pages/doctor/DoctorPatientDetail.tsx";
import DoctorPlans from "./pages/doctor/DoctorPlans.tsx";
import DoctorPlanDetail from "./pages/doctor/DoctorPlanDetail.tsx";
import DoctorAssess from "./pages/doctor/DoctorAssess.tsx";
import DoctorStats from "./pages/doctor/DoctorStats.tsx";
import NurseLayout from "./pages/nurse/NurseLayout.tsx";
import NurseHome from "./pages/nurse/NurseHome.tsx";
import NursePatients from "./pages/nurse/NursePatients.tsx";
import NursePatientDetail from "./pages/nurse/NursePatientDetail.tsx";
import NurseHandover from "./pages/nurse/NurseHandover.tsx";
import NurseEducation from "./pages/nurse/NurseEducation.tsx";
import NurseChat from "./pages/nurse/NurseChat.tsx";
import NurseChatList from "./pages/nurse/NurseChatList.tsx";
import NurseProfile from "./pages/nurse/NurseProfile.tsx";
import NurseFollowup from "./pages/nurse/NurseFollowup.tsx";
import CommunityLayout from "./pages/community/CommunityLayout.tsx";
import CommunityHome from "./pages/community/CommunityHome.tsx";
import CommunityPatients from "./pages/community/CommunityPatients.tsx";
import CommunityEducation from "./pages/community/CommunityEducation.tsx";
import CommunityFollowup from "./pages/community/CommunityFollowup.tsx";
import CommunityPatientDetail from "./pages/community/CommunityPatientDetail.tsx";
import PatientLayout from "./pages/patient/PatientLayout.tsx";
import PatientHome from "./pages/patient/PatientHome.tsx";
import PatientAssessment from "./pages/patient/PatientAssessment.tsx";
import PatientAI from "./pages/patient/PatientAI.tsx";
import PatientPlan from "./pages/patient/PatientPlan.tsx";
import PatientRisk from "./pages/patient/PatientRisk.tsx";
import PatientProfile from "./pages/patient/PatientProfile.tsx";
import PatientTasks from "./pages/patient/PatientTasks.tsx";
import PatientArchive from "./pages/patient/PatientArchive.tsx";
import PatientDataEntry from "./pages/patient/PatientDataEntry.tsx";
import PatientDoctors from "./pages/patient/PatientDoctors.tsx";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DemoSession />
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/screen" element={<ProvinceScreen />} />
          <Route path="/screening" element={<ScreeningCenter />} />

          <Route path="/doctor" element={<DoctorLayout />}>
            <Route index element={<DoctorHome />} />
            <Route path="patients" element={<DoctorPatients />} />
            <Route path="patients/:id" element={<DoctorPatientDetail />} />
            <Route path="plans" element={<DoctorPlans />} />
            <Route path="plans/:id" element={<DoctorPlanDetail />} />
            <Route path="assess/:id" element={<DoctorAssess />} />
            <Route path="stats" element={<DoctorStats />} />
          </Route>

          <Route path="/nurse" element={<NurseLayout />}>
            <Route index element={<NurseHome />} />
            <Route path="patients" element={<NursePatients />} />
            <Route path="patients/:id" element={<NursePatientDetail />} />
            <Route path="handover" element={<NurseHandover />} />
            <Route path="education" element={<NurseEducation />} />
            <Route path="chat" element={<NurseChatList />} />
            <Route path="chat/:type/:id" element={<NurseChat />} />
            <Route path="followup" element={<NurseFollowup />} />
            <Route path="profile" element={<NurseProfile />} />
          </Route>
          <Route path="/community" element={<CommunityLayout />}>
            <Route index element={<CommunityHome />} />
            <Route path="patients" element={<CommunityPatients />} />
            <Route path="patients/:id" element={<CommunityPatientDetail />} />
            <Route path="education" element={<CommunityEducation />} />
            <Route path="followup" element={<CommunityFollowup />} />
          </Route>
          <Route path="/patient" element={<PatientLayout />}>
            <Route index element={<PatientHome />} />
            <Route path="assessment" element={<PatientAssessment />} />
            <Route path="ai" element={<PatientAI />} />
            <Route path="plan" element={<PatientPlan />} />
            <Route path="risk" element={<PatientRisk />} />
            <Route path="tasks" element={<PatientTasks />} />
            <Route path="archive" element={<PatientArchive />} />
            <Route path="data" element={<PatientDataEntry />} />
            <Route path="doctors" element={<PatientDoctors />} />
            <Route path="profile" element={<PatientProfile />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


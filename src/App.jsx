import { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import {
  startPresenceTracking,
} from "./services/firebase";
import ProtectedRoute from "./components/ProtectedRoute";
import { useLocation } from "react-router-dom";
// Auth
import Login from "./components/pages/Auth/Login";
import ResetPasswordByToken from "./components/pages/Auth/ResetPasswordByToken";

// ================= ANNOTATOR =================
import AnnotatorLayout from "./components/pages/Annotator/AnnotatorLayout";
import AnnotatorDashboard from "./components/pages/Annotator/AnnotatorDashboard";
import AnnotatorWorkspace from "./components/pages/Annotator/Workspace/AnnotatorWorkspace";
import CreditScorePage from "./components/pages/Annotator/Score/CreditScorePage";
import DisputeList from "./components/pages/Annotator/Dispute/DisputeList";
import DisputeDetail from "./components/pages/Annotator/Dispute/DisputeDetail";

// ================= ADMIN =================
import AdminGlobalLayout from "./components/pages/Admin/AdminGlobalLayout";
import AdminOverview from "./components/pages/Admin/AdminOverview";
import UserList from "./components/pages/Admin/UserList";
import ActivityLogs from "./components/pages/Admin/ActivityLogs";
import SystemConfig from "./components/pages/Admin/SystemConfig";
import AdminRules from './components/pages/Admin/AdminRules';

// ================= MANAGER =================
import ManagerGlobalLayout from "./components/pages/Manager/ManagerGlobalLayout";
import ProjectManagement from "./components/pages/Manager/ProjectManagement";
import DisputeResolution from "./components/pages/Manager/DisputeResolution";
import ExportData from "./components/pages/Manager/ExportData";
import QualityScore from "./components/pages/Manager/QualityScore";
import ManagerDashboard from "./components/pages/Manager/ManagerDashboard";
import LabelLibrary from "./components/pages/Manager/LabelLibrary";

// ================= REVIEWER =================
import ReviewerLayout from "./components/pages/Reviewer/ReviewerLayout";
import ReviewerDashboard from "./components/pages/Reviewer/ReviewerDashboard";
import ReviewerWorkspace from "./components/pages/Reviewer/Workspace/ReviewerWorkspace"; 
import ReviewerDisputeList from "./components/pages/Reviewer/Dispute/ReviewerDisputeList";
import ReviewerDisputeDetail from "./components/pages/Reviewer/Dispute/ReviewerDisputeDetail";
import ReviewerScorePage from "./components/pages/Reviewer/Workspace/ReviewerScorePage";

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const savedUserStr = localStorage.getItem("user");
    if (!savedUserStr) return;

    let user;
    try {
      user = JSON.parse(savedUserStr);
    } catch (e) {
      console.error("Lỗi parse user từ localStorage:", e);
      return;
    }

    if (!user?.id || !user?.role) return;
    console.log(`[Firebase] Bắt đầu tracking cho: ${user.id} (${user.role})`);
    const cleanupTracking = startPresenceTracking(user.id, user.role);
    return () => {
      if (typeof cleanupTracking === 'function') {
        cleanupTracking();
      }
    };
  }, [location.pathname]); 

  return null;
};

function App() {
  return (
    <>
      <AnalyticsTracker />
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-pass" element={<ResetPasswordByToken />} />
        <Route path="/" element={<Login />} />

        {/* ================= ADMIN PROTECTED ================= */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminGlobalLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<UserList />} />
            <Route path="logs" element={<ActivityLogs />} />
            <Route path="config" element={<SystemConfig />} />
            <Route path="rules" element={<AdminRules />} />
          </Route>
        </Route>

        {/* ================= MANAGER PROTECTED ================= */}
        <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
          <Route path="/manager" element={<ManagerGlobalLayout />}>
            <Route index element={<ProjectManagement />} />
            <Route path="labels" element={<LabelLibrary />} />
            <Route path="disputes" element={<DisputeResolution />} />
            <Route path="quality" element={<QualityScore />} />
            <Route path="export" element={<ExportData />} />
          </Route>
          <Route path="/manager/projects/:projectId" element={<ManagerDashboard />} />
        </Route>

        {/* ================= ANNOTATOR PROTECTED ================= */}
        <Route element={<ProtectedRoute allowedRoles={["annotator"]} />}>
          <Route path="/annotator" element={<AnnotatorLayout />}>
            <Route index element={<AnnotatorDashboard />} />
            {/* Chú ý: path này tương đương /annotator/workspace/:taskId do nằm trong layout */}
            <Route path="workspace/:taskId" element={<AnnotatorWorkspace />} />
            <Route path="score" element={<CreditScorePage />} />
            <Route path="disputes" element={<DisputeList />} />
            <Route path="disputes/:id" element={<DisputeDetail />} />
          </Route>
        </Route>

        {/* ================= REVIEWER PROTECTED ================= */}
        <Route element={<ProtectedRoute allowedRoles={["reviewer"]} />}>        
          <Route path="/reviewer" element={<ReviewerLayout />}>
          <Route index element={<ReviewerDashboard />} />
          <Route path="dashboard" element={<ReviewerDashboard />} />
          <Route path="/reviewer/workspace/:taskId" element={<ReviewerWorkspace />} />
          <Route path="disputes" element={<ReviewerDisputeList />} />
            <Route path="disputes/:id" element={<ReviewerDisputeDetail />} />
            <Route path="credit-score" element={<ReviewerScorePage />} />
          </Route>

        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;

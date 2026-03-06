import { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import {
  updateUserPresence,
  startPresenceTracking,
  stopPresenceTracking,
} from "./services/firebase";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth
import Login from "./components/pages/Auth/Login";

// ================= ANNOTATOR =================
import AnnotatorLayout from "./components/pages/Annotator/AnnotatorLayout";
import AnnotatorDashboard from "./components/pages/Annotator/AnnotatorDashboard";
import AnnotatorWorkspace from "./components/pages/Annotator/Workspace/AnnotatorWorkspace";
import CreditScorePage from "./components/pages/Annotator/Workspace/CreditScorePage";

// ================= ADMIN =================
import AdminGlobalLayout from "./components/pages/Admin/AdminGlobalLayout";
import AdminOverview from "./components/pages/Admin/AdminOverview";
import UserList from "./components/pages/Admin/UserList";
import ActivityLogs from "./components/pages/Admin/ActivityLogs";
import SystemConfig from "./components/pages/Admin/SystemConfig";

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
// THÊM DÒNG NÀY: Import ReviewerWorkspace
import ReviewerWorkspace from "./components/pages/Reviewer/Workspace/ReviewerWorkspace"; 

const AnalyticsTracker = () => {
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

    updateUserPresence(user.id, user.role, true);
    startPresenceTracking(user.id, user.role);

    console.log(`[Firebase] Tracking started: ${user.fullName || "User"} (${user.role})`);

    return () => {
      stopPresenceTracking(user.id, user.role);
    };
  }, []);

  return null;
};

function App() {
  return (
    <>
      <AnalyticsTracker />
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />

        {/* ================= ADMIN PROTECTED ================= */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminGlobalLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<UserList />} />
            <Route path="logs" element={<ActivityLogs />} />
            <Route path="config" element={<SystemConfig />} />
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
          </Route>
        </Route>

        {/* ================= REVIEWER PROTECTED ================= */}
        <Route element={<ProtectedRoute allowedRoles={["reviewer"]} />}>        
          {/* Những trang cần Sidebar Layout */}
          <Route path="/reviewer" element={<ReviewerLayout />}>
            <Route index element={<ReviewerDashboard />} />
            {/* Nếu bạn có trang điểm tín nhiệm cho Reviewer thì thêm ở đây */}
          </Route>
          {/* THÊM DÒNG NÀY: Trang Workspace Full màn hình (nằm ngoài Layout, nhưng vẫn trong ProtectedRoute) */}
          <Route path="/reviewer/workspace/:taskId" element={<ReviewerWorkspace />} />

        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
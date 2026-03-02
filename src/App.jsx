import { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom"; 
import { updateUserPresence } from "./services/firebase"; 
import ProtectedRoute from "./components/ProtectedRoute"; // Import cổng bảo vệ vừa tạo

// Auth
import Login from "./components/pages/Auth/Login";

// ================= ANNOTATOR =================
import AnnotatorDashboard from "./components/pages/Annotator/AnnotatorDashboard";
import AnnotatorWorkspace from "./components/pages/Annotator/Workspace/AnnotatorWorkspace";
import CreditScorePage from "./components/pages/Annotator/Workspace/CreditScorePage";

// ================= ADMIN =================
import AdminGlobalLayout from "./components/pages/Admin/AdminGlobalLayout";
import AdminOverview from "./components/pages/Admin/AdminOverview";
import UserList from "./components/pages/Admin/UserList";
import ActivityLogs from "./components/pages/Admin/ActivityLogs";
import SystemConfig from "./components/pages/Admin/SystemConfig";
import StorageMonitor from "./components/pages/Admin/StorageControl";

// ================= MANAGER =================
import ManagerGlobalLayout from "./components/pages/Manager/ManagerGlobalLayout";
import ProjectManagement from "./components/pages/Manager/ProjectManagement";
import DisputeResolution from "./components/pages/Manager/DisputeResolution";
import ExportData from "./components/pages/Manager/ExportData";
import QualityScore from "./components/pages/Manager/QualityScore";
import ManagerDashboard from "./components/pages/Manager/ManagerDashboard";

// ================= REVIEWER =================
import ReviewerDashboard from "./components/pages/Reviewer/ReviewerDashboard";

const AnalyticsTracker = () => {
  useEffect(() => {
    const savedUserStr = localStorage.getItem("user");
    if (savedUserStr) {
      try {
        const user = JSON.parse(savedUserStr);
        updateUserPresence(user.id, user.role, true);
        console.log(`[Firebase] Khôi phục trạng thái cho: ${user.fullName || 'User'}`);
      } catch (e) {
        console.error("Lỗi parse user từ localStorage:", e);
      }
    }

    const handleBeforeUnload = () => {
      const currentUserStr = localStorage.getItem("user"); 
      if (currentUserStr) {
        const user = JSON.parse(currentUserStr);
        updateUserPresence(user.id, user.role, false);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
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
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminGlobalLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<UserList />} />
            <Route path="logs" element={<ActivityLogs />} />
            <Route path="config" element={<SystemConfig />} />
            <Route path="storage" element={<StorageMonitor />} />
          </Route>
        </Route>

        {/* ================= MANAGER PROTECTED ================= */}
        <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
          <Route path="/manager" element={<ManagerGlobalLayout />}>
            <Route index element={<ProjectManagement />} />
            <Route path="disputes" element={<DisputeResolution />} />
            <Route path="quality" element={<QualityScore />} />
            <Route path="export" element={<ExportData />} />
          </Route>
          {/* Manager Full Screen Project Detail */}
          <Route
            path="/manager/projects/:projectId"
            element={<ManagerDashboard />}
          />
        </Route>

        {/* ================= ANNOTATOR PROTECTED ================= */}
        <Route element={<ProtectedRoute allowedRoles={['annotator']} />}>
          <Route path="/annotator" element={<AnnotatorDashboard />} />
          <Route
            path="/annotator/workspace/:taskId"
            element={<AnnotatorWorkspace />}
          />
          <Route path="/annotator/score" element={<CreditScorePage />} />
        </Route>

        {/* ================= REVIEWER PROTECTED ================= */}
        <Route element={<ProtectedRoute allowedRoles={['reviewer']} />}>
          <Route path="/reviewer" element={<ReviewerDashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
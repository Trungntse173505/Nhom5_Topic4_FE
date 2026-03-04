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
    if (!savedUserStr) return;

    let user;
    try {
      user = JSON.parse(savedUserStr);
    } catch (e) {
      console.error("Lỗi parse user từ localStorage:", e);
      return;
    }

    if (!user?.id || !user?.role) return;

    // Set online + bắt đầu heartbeat cho TẤT CẢ role
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
            <Route path="storage" element={<StorageMonitor />} />
          </Route>
        </Route>

        {/* ================= MANAGER PROTECTED ================= */}
        <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
          <Route path="/manager" element={<ManagerGlobalLayout />}>
            <Route index element={<ProjectManagement />} />
            <Route path="disputes" element={<DisputeResolution />} />
            <Route path="quality" element={<QualityScore />} />
            <Route path="export" element={<ExportData />} />
          </Route>
          <Route
            path="/manager/projects/:projectId"
            element={<ManagerDashboard />}
          />
        </Route>

        {/* ================= ANNOTATOR PROTECTED ================= */}
        <Route element={<ProtectedRoute allowedRoles={["annotator"]} />}>
          <Route path="/annotator" element={<AnnotatorDashboard />} />
          <Route
            path="/annotator/workspace/:taskId"
            element={<AnnotatorWorkspace />}
          />
          <Route path="/annotator/score" element={<CreditScorePage />} />
        </Route>

        {/* ================= REVIEWER PROTECTED ================= */}
        <Route element={<ProtectedRoute allowedRoles={["reviewer"]} />}>
          <Route path="/reviewer" element={<ReviewerDashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
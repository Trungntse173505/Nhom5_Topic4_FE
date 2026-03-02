import { Route, Routes } from "react-router-dom";

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

function App() {
  return (
    <Routes>
      {/* ================= AUTH ================= */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />

      {/* ================= ANNOTATOR ================= */}
      <Route path="/annotator" element={<AnnotatorDashboard />} />
      <Route
        path="/annotator/workspace/:taskId"
        element={<AnnotatorWorkspace />}
      />
      <Route path="/annotator/score" element={<CreditScorePage />} />

      {/* ================= ADMIN ================= */}
      <Route path="/admin" element={<AdminGlobalLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<UserList />} />
        <Route path="logs" element={<ActivityLogs />} />
        <Route path="config" element={<SystemConfig />} />
        <Route path="storage" element={<StorageMonitor />} />
      </Route>

      {/* ================= MANAGER ================= */}
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

      {/* ================= REVIEWER ================= */}
      <Route path="/reviewer" element={<ReviewerDashboard />} />
    </Routes>
  );
}

export default App;
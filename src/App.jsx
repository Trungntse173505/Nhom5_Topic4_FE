import { Route, Routes } from "react-router-dom";

import Login from "./components/pages/Auth/Login";
import ManagerGlobalLayout from "./components/pages/Manager/ManagerGlobalLayout";
import ProjectManagement from "./components/pages/Manager/ProjectManagement";
import DisputeResolution from "./components/pages/Manager/DisputeResolution";
import ExportData from "./components/pages/Manager/ExportData";
import QualityScore from "./components/pages/Manager/QualityScore";
import ManagerDashboard from "./components/pages/Manager/ManagerDashboard";

import AdminGlobalLayout from "./components/pages/Admin/AdminGlobalLayout";
import AdminOverview from "./components/pages/Admin/AdminOverview";
import UserList from "./components/pages/Admin/UserList";
import ActivityLogs from "./components/pages/Admin/ActivityLogs";
import SystemConfig from "./components/pages/Admin/SystemConfig";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />

      <Route path="/manager" element={<ManagerGlobalLayout />}>
        <Route index element={<ProjectManagement />} />
        <Route path="disputes" element={<DisputeResolution />} />
        <Route path="quality" element={<QualityScore />} />
        <Route path="export" element={<ExportData />} />
      </Route>

      <Route path="/manager/projects/:projectId" element={<ManagerDashboard />} />

      {/* Admin - same structure as Manager: global layout + nested routes */}
      <Route path="/admin" element={<AdminGlobalLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<UserList />} />
        <Route path="logs" element={<ActivityLogs />} />
        <Route path="config" element={<SystemConfig />} />
      </Route>
    </Routes>
  );
}

export default App;

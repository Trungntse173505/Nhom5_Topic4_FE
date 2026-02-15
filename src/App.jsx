import { Route, Routes } from "react-router-dom";

import Login from "./components/pages/Auth/Login";
import ManagerGlobalLayout from "./components/pages/Manager/ManagerGlobalLayout";
import ProjectManagement from "./components/pages/Manager/ProjectManagement";
import DisputeResolution from "./components/pages/Manager/DisputeResolution";
import ExportData from "./components/pages/Manager/ExportData";
import QualityScore from "./components/pages/Manager/QualityScore";
import ManagerDashboard from "./components/pages/Manager/ManagerDashboard";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />

      {/* Nhóm các Route có dùng Global Sidebar */}
      <Route path="/manager" element={<ManagerGlobalLayout />}>
        <Route index element={<ProjectManagement />} />{" "}
        {/* Đường dẫn mặc định /manager */}
        <Route path="disputes" element={<DisputeResolution />} />{" "}
        {/* Đường dẫn /manager/disputes */}
        <Route path="quality" element={<QualityScore />} />{" "}
        {/* Đường dẫn /manager/quality */}
        <Route path="export" element={<ExportData />} />{" "}
        {/* Đường dẫn /manager/export */}
      </Route>

      {/* Route CHI TIẾT DỰ ÁN (Manager Dashboard 4 tabs) nằm ngoài Sidebar, cho nó full màn hình */}
      <Route
        path="/manager/projects/:projectId"
        element={<ManagerDashboard />}
      />
    </Routes>
  );
}

export default App;

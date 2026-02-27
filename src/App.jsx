import { Route, Routes } from "react-router-dom";

import Login from "./components/pages/Auth/Login";


import AdminGlobalLayout from "./components/pages/Admin/AdminGlobalLayout";
import AdminOverview from "./components/pages/Admin/AdminOverview";
import UserList from "./components/pages/Admin/UserList";
import ActivityLogs from "./components/pages/Admin/ActivityLogs";
import SystemConfig from "./components/pages/Admin/SystemConfig";
import StorageMonitor from "./components/pages/Admin/StorageControl";


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />


      {/* Admin routes */}
      <Route path="/admin" element={<AdminGlobalLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<UserList />} />
        <Route path="logs" element={<ActivityLogs />} />
        <Route path="config" element={<SystemConfig />} />
        <Route path="storage" element={<StorageMonitor />} />
      </Route>

    </Routes>
  );
}

export default App;


import { Route, Routes } from 'react-router-dom'
import Login from './components/pages/Auth/Login'
import AdminDashboard from './components/pages/Admin/Dashboard'
import UserList from './components/pages/Admin/UserList'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<UserList />} />
    </Routes>
  )
}

export default App


import { Route, Routes } from 'react-router-dom'
import Login from './components/pages/Auth/Login'
import AdminDashboard from './components/pages/Admin/Dashboard'


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  )
}

export default App

import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  // 1. Nếu không có Token -> Đá văng về trang Login
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }
  const user = JSON.parse(userStr);
  const userRole = user.role?.toLowerCase(); 

  // 2. Nếu có Token nhưng sai quyền -> Cho về trang không có quyền (hoặc về Login)
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />; 
  }
  return <Outlet />;
};

export default ProtectedRoute;
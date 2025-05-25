import useAuth from '@/context/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { token } = useAuth();

  return token ? <Outlet /> : <Navigate to='/login' replace />;
};

export default ProtectedRoute;

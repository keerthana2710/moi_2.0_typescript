import React from 'react';
import useAuth from '@/context/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
  const { token } = useAuth();

  return token ? <Outlet /> : <Navigate to='/login' replace />;
};

export default ProtectedRoute;
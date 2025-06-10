import { useContext } from 'react';
import { toast } from 'react-toastify';
import AuthContext from './AuthContext';
import { AuthContextType } from '@/types/auth';

export default function useAuth(): AuthContextType {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    toast.error('useAuth must be used within an AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return authContext;
}
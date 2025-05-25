import { useContext } from 'react';
import { toast } from 'react-toastify';
import AuthContext from './AuthContext';

export default function useAuth() {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    toast.error('useAuth must be used within an AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return authContext;
}

import { useState, useEffect, ReactNode } from 'react';
import { getItem } from '../utils/LocalStorage';
import AuthContext from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => {
    return getItem('access-token');
  });
  const [isAdmin, setIsAdmin] = useState<boolean | null>(() => {
    return getItem('isAdmin');
  });

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        setToken(getItem('access-token'));
        setIsAdmin(getItem('isAdmin'));
      } catch (err) {
        console.error(err);
        setToken(null);
        setIsAdmin(null);
      }
    };

    getCurrentUser();
  }, [token, isAdmin]);

  return (
    <AuthContext.Provider value={{ token, setToken, isAdmin, setIsAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
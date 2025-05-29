// AuthProvider.jsx
import { useState, useEffect } from 'react';
import { getItem } from '../utils/LocalStorage';
import AuthContext from './AuthContext';

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return getItem('access-token');
  });
  const [isAdmin, setIsAdmin] = useState(() => {
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

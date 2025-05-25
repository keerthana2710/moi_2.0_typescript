// AuthProvider.jsx
import { useState, useEffect } from 'react';
import { getItem } from '../utils/LocalStorage';
import AuthContext from './AuthContext';

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return getItem('access-token');
  });

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        setToken(getItem('access-token'));
      } catch (err) {
        console.error(err);
        setToken(null);
      }
    };

    getCurrentUser();
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

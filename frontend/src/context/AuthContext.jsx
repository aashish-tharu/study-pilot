import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, loginUser, logoutUser, registerUser as registerNewUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    async function bootstrap() {
      try {
        const payload = await getCurrentUser();
        setUser(payload?.data?.user || payload?.data || null);
      } catch (error) {
        console.log('No valid session found:', error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, []);

  const login = async (credentials) => {
    const payload = await loginUser(credentials);
    const userData = payload?.data?.user || payload?.data || null;
    setUser(userData);
    return payload;
  };

  const register = async (payload) => {
    const response = await registerNewUser(payload);
    const userData = response?.data?.user || response?.data || null;
    setUser(userData);
    return response;
  };

  const signOut = async () => {
    await logoutUser();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      message,
      setMessage,
      login,
      register,
      signOut,
    }),
    [user, loading, message],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

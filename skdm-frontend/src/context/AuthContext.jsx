import { createContext, useContext, useState, useEffect } from 'react';
import { authApi, getToken, getUser, setUser, clearTokens } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setCurrentUser] = useState(() => getUser());
  const [token, setToken] = useState(() => getToken());
  const [loading, setLoading] = useState(true);

  // Sync state on mount and check profile if token exists
  useEffect(() => {
    async function initAuth() {
      const existingToken = getToken();
      if (existingToken) {
        try {
          const res = await authApi.getProfile();
          if (res?.data) {
            setCurrentUser(res.data);
            setUser(res.data);
          }
        } catch (err) {
          console.warn('Session verification failed, logging out:', err);
          clearTokens();
          setCurrentUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (usernameOrEmail, password, rememberMe = false) => {
    const res = await authApi.login(usernameOrEmail, password, rememberMe);
    if (res?.data?.accessToken) {
      setToken(res.data.accessToken);
      setCurrentUser(res.data.user);
    }
    return res;
  };

  const signup = async (data) => {
    return await authApi.signup(data);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore errors on logout
    } finally {
      clearTokens();
      setCurrentUser(null);
      setToken(null);
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await authApi.getProfile();
      if (res?.data) {
        setCurrentUser(res.data);
        setUser(res.data);
      }
      return res?.data;
    } catch (e) {
      console.error('Failed to refresh profile:', e);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    signup,
    logout,
    refreshProfile,
    authApi,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

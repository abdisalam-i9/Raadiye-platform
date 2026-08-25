import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  api,
  clearAuthStorage,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
  setUnauthorizedHandler,
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistAuth = useCallback((nextToken, nextUser) => {
    setAuthToken(nextToken);
    setUser(nextUser);
    setToken(nextToken);
    setStoredUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    clearAuthStorage();
  }, []);

  useEffect(() => {
    const savedToken = getToken();
    const savedUser = getStoredUser();

    if (savedToken && savedUser) {
      setAuthToken(savedToken);
      setUser(savedUser);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
  }, [logout]);

  const login = useCallback(async ({ email, password }) => {
    const data = await api.auth.login({ email, password });
    persistAuth(data.token, data.user);
    return data;
  }, [persistAuth]);

  const register = useCallback(async (payload) => {
    const data = await api.auth.register(payload);
    if (data.token && data.user) persistAuth(data.token, data.user);
    return data;
  }, [persistAuth]);

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser);
    setStoredUser(nextUser);
  }, []);

  const handleUnauthorized = useCallback(() => {
    logout();
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      handleUnauthorized,
      updateUser,
    }),
    [user, token, loading, login, register, logout, handleUnauthorized, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

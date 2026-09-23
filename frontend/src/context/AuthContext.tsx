import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi, LoginCredentials } from '../api/auth.api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isManager: boolean;
  canManageAssets: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('assetflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('assetflow_token');
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('assetflow_token');
      if (savedToken) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('assetflow_user', JSON.stringify(res.data));
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const res = await authApi.login(credentials);
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('assetflow_token', res.data.token);
      localStorage.setItem('assetflow_user', JSON.stringify(res.data.user));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('assetflow_token');
    localStorage.removeItem('assetflow_user');
  };

  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER';
  const canManageAssets = isAdmin || isManager;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAdmin,
        isManager,
        canManageAssets,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

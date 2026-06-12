import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setToken, clearToken, getToken } from './apiClient';

export type UserRole = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'OPERATOR';

export interface AuthUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role_id: number | null;
  company_id: number | null;
  site_id: number | null;
  token: string;
  permission?: Record<string, any> | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapRole(roleId: number | null): UserRole {
  switch (roleId) {
    case 1: return 'SUPER_ADMIN';
    case 2: return 'COMPANY_ADMIN';
    default: return 'OPERATOR';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    const userData = await api.post<AuthUser>(
      '/authenticate',
      { email, password },
      { skipAuth: true },
    );
    if (!userData.token) throw new Error('No token returned from server');
    await setToken(userData.token);
    setUser(userData);
  };

  const logout = async () => {
    await clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      role: user ? mapRole(user.role_id) : null,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
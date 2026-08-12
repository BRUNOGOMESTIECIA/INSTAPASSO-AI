import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiGet, apiPost } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  roleId: string | null;
  department: string | null;
  ssoProvider: string;
  role?: {
    id: string;
    name: string;
    permissions: Array<{ code: string; module: string }>;
  };
}

interface AuthContextValue {
  user: User | null;
  permissions: Set<string>;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (code: string) => boolean;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const me = await apiGet<User>('/auth/me');
      setUser(me);
      const perms = me.role?.permissions?.map((p) => p.code) ?? [];
      setPermissions(new Set(perms));
    } catch {
      setUser(null);
      setPermissions(new Set());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    await apiPost('/auth/login', { email, password });
    await fetchUser();
  };

  const logout = async () => {
    await apiPost('/auth/logout');
    setUser(null);
    setPermissions(new Set());
    window.location.href = '/cliente';
  };

  const hasPermission = (code: string) => permissions.has(code);

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
        refetchUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

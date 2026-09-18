'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from './types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'STUDENT',
  isLoading: true,
  login: async () => false,
  logout: () => {},
  switchRole: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load: check localStorage
  useEffect(() => {
    try {
      const savedUserId = localStorage.getItem('lua_campus_user_id');
      fetch('/api/auth/me' + (savedUserId ? `?userId=${savedUserId}` : ''))
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
          }
        })
        .catch((err) => console.error('Error fetching auth:', err))
        .finally(() => setIsLoading(false));
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        localStorage.setItem('lua_campus_user_id', data.user.id);
        document.cookie = `campus_user_id=${data.user.id}; path=/; max-age=604800`;
        return true;
      }
      return false;
    } catch (e) {
      console.error('Login error:', e);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lua_campus_user_id');
    document.cookie = 'campus_user_id=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/login';
  };

  const switchRole = async (newRole: UserRole) => {
    try {
      const res = await fetch(`/api/auth/switch?role=${newRole}`);
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('lua_campus_user_id', data.user.id);
        document.cookie = `campus_user_id=${data.user.id}; path=/; max-age=604800`;
      }
    } catch (e) {
      console.error('Error switching role:', e);
    }
  };

  const role: UserRole = user?.role || 'STUDENT';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

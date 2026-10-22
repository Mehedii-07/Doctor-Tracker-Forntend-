'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi } from '../lib/api';

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  role: 'visitor',
  isAdmin: false,
  isManager: false,
  isViewer: true,
  isVisitor: true,
  canCreate: false,
  canEdit: false,
  canDelete: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('doctor_tracker_token');
        const storedUser = localStorage.getItem('doctor_tracker_user');

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          // Validate token with backend
          try {
            const res = await authApi.getMe();
            if (res.success && res.user) {
              setUser(res.user);
              localStorage.setItem('doctor_tracker_user', JSON.stringify(res.user));
            }
          } catch (err) {
            console.warn('Session expired or invalid token:', err.message);
            localStorage.removeItem('doctor_tracker_token');
            localStorage.removeItem('doctor_tracker_user');
            setUser(null);
            setToken(null);
          }
        }
      } catch (e) {
        console.error('Error restoring session:', e);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Route protection effect
  useEffect(() => {
    if (!loading) {
      const isAuthPage = pathname === '/login' || pathname === '/register';
      if (!token && !isAuthPage) {
        router.push('/login');
      } else if (token && isAuthPage) {
        router.push('/');
      }
    }
  }, [token, loading, pathname, router]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('doctor_tracker_token', res.token);
      localStorage.setItem('doctor_tracker_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      router.push('/');
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (name, email, password, role = 'admin') => {
    const res = await authApi.register({ name, email, password, role });
    if (res.success && res.token) {
      localStorage.setItem('doctor_tracker_token', res.token);
      localStorage.setItem('doctor_tracker_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      router.push('/');
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('doctor_tracker_token');
    localStorage.removeItem('doctor_tracker_user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const userRole = (user?.role || 'visitor').toLowerCase();
  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'manager';
  const isViewer = userRole === 'viewer' || userRole === 'visitor';
  const isVisitor = userRole === 'visitor' || userRole === 'viewer';
  const canCreate = ['admin', 'manager'].includes(userRole);
  const canEdit = ['admin', 'manager'].includes(userRole);
  const canDelete = userRole === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        role: userRole,
        isAdmin,
        isManager,
        isViewer,
        isVisitor,
        canCreate,
        canEdit,
        canDelete,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

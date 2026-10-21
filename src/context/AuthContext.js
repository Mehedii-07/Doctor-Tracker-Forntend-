'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi } from '../lib/api';

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
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
      const isAuthPage = pathname === '/login';
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

  const logout = () => {
    localStorage.removeItem('doctor_tracker_token');
    localStorage.removeItem('doctor_tracker_user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

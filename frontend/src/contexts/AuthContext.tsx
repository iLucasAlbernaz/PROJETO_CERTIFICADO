import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../services/api';
import type { User } from '../types';

type LoginPayload = {
  email: string;
  password: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('certificados.token'));
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('certificados.user');
    return stored ? (JSON.parse(stored) as User) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const { data } = await api.get<User>('/auth/me');
        setUser(data);
        localStorage.setItem('certificados.user', JSON.stringify(data));
      } catch {
        localStorage.removeItem('certificados.token');
        localStorage.removeItem('certificados.user');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, [token]);

  const login = async (payload: LoginPayload) => {
    const { data } = await api.post<{ token: string; user: User }>('/auth/login', payload);
    localStorage.setItem('certificados.token', data.token);
    localStorage.setItem('certificados.user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('certificados.token');
    localStorage.removeItem('certificados.user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      logout
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

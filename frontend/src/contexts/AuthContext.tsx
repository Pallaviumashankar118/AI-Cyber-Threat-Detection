import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@aegissoc.com', role: 'Admin', status: true, created_at: new Date().toISOString() },
  { id: '2', name: 'Alex Chen', email: 'analyst@aegissoc.com', role: 'Analyst', status: true, created_at: new Date().toISOString() },
  { id: '3', name: 'Sarah Mitchell', email: 'manager@aegissoc.com', role: 'Manager', status: true, created_at: new Date().toISOString() },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(() => {
    try {
      const stored = localStorage.getItem('aegissoc_auth');
      if (stored) return JSON.parse(stored);
    } catch {}
    return { user: null, token: null, isAuthenticated: false };
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Demo login — any password works, just match email
    const user = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    // Also allow any email/password for demo
    const effectiveUser = user || { id: '99', name: email.split('@')[0], email, role: 'Analyst' as const, status: true, created_at: new Date().toISOString() };
    
    if (password.length >= 6) {
      const token = `demo_jwt_${Date.now()}`;
      const newState = { user: effectiveUser, token, isAuthenticated: true };
      setState(newState);
      localStorage.setItem('aegissoc_auth', JSON.stringify(newState));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, token: null, isAuthenticated: false });
    localStorage.removeItem('aegissoc_auth');
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

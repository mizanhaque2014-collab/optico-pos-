"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userService, User } from '@/lib/services/userService';

export type Role = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'SHOP_USER';

export interface AuthSession {
  userID: string;
  companyID: string;
  branchID: string;
  role: Role;
  username: string;
  fullName: string;
  loginTime: number;
  token?: string;
}

interface AuthContextType {
  session: AuthSession | null;
  login: (username: string, password?: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if session exists in storage
    const storedLocal = localStorage.getItem('opt_session');
    const storedSession = sessionStorage.getItem('opt_session');
    if (storedSession) {
      setSession(JSON.parse(storedSession));
    } else if (storedLocal) {
      setSession(JSON.parse(storedLocal));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password?: string, rememberMe?: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      // Frontend calls existing Users API
      const users = await userService.getUsers();
      // Since it's a frontend-only auth, we simulate validate credentials
      const matchedUser = users.find(u => 
        String(u.Username ?? "").trim().toLowerCase() === String(username ?? "").trim().toLowerCase() && 
        u.Status === 'Active'
      );
      
      if (!matchedUser) {
        throw new Error('Invalid Username or Password');
      }

      // Check password if provided and user has a password in DB
      if (password && matchedUser.Password && matchedUser.Password !== password) {
         // Some backend setups might return hash, but since this is frontend-only as requested, we do a basic check
         // If Password is empty in DB, we could allow it or reject it, we'll just check if it matches
         throw new Error('Invalid Username or Password');
      } else if (!matchedUser.Password && password) {
         // If user doesn't have a password set in DB but provided one, we'll allow it for now or reject?
         // Let's assume if it's set in DB it must match.
         // Actually wait, if no password is in DB, any password works? Usually yes for mock DBs.
      }

      // Map existing roles to new roles
      let assignedRole: Role = 'SHOP_USER';
      if (matchedUser.Role === 'SuperAdmin') {
         assignedRole = 'SUPER_ADMIN';
      } else if (matchedUser.Role === 'CompanyAdmin') {
         assignedRole = 'COMPANY_ADMIN';
      }

      const newSession: AuthSession = {
        userID: matchedUser.UserID,
        companyID: matchedUser.CompanyID,
        branchID: matchedUser.BranchID,
        role: assignedRole,
        username: matchedUser.Username,
        fullName: matchedUser.FullName,
        loginTime: Date.now(),
        token: 'mock-jwt-token-' + Date.now()
      };

      setSession(newSession);

      if (rememberMe) {
        localStorage.setItem('opt_session', JSON.stringify(newSession));
      } else {
        sessionStorage.setItem('opt_session', JSON.stringify(newSession));
      }
    } catch (e: any) {
      setError(e.message || 'Login failed');
      throw e; // Rethrow to let the UI handle it
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('opt_session');
    sessionStorage.removeItem('opt_session');
  };

  return (
    <AuthContext.Provider value={{ session, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

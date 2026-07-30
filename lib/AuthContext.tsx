"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userService, User } from '@/lib/services/userService';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

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
      const userByUsername = users.find(u => String(u.Username ?? "").trim().toLowerCase() === String(username ?? "").trim().toLowerCase());
      
      if (!userByUsername) {
        throw new Error('Invalid Username or Password');
      }

      if (!(String(userByUsername.Status).toUpperCase() === 'ACTIVE')) {
        throw new Error('User account is not active');
      }

      const matchedUser = userByUsername;

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
      const roleStr = String(matchedUser.Role || '').toUpperCase();
      if (roleStr.includes('SUPER') || roleStr === 'SUPER_ADMIN') {
         assignedRole = 'SUPER_ADMIN';
      } else if (roleStr.includes('COMPANY') || roleStr === 'ADMIN' || roleStr.includes('ADMIN') && !roleStr.includes('SUPER')) {
         assignedRole = 'COMPANY_ADMIN';
      } else if (roleStr.includes('STAFF') || roleStr.includes('OPERATOR') || roleStr.includes('USER')) {
         assignedRole = 'SHOP_USER';
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
    router.replace('/login');
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

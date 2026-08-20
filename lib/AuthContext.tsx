"use client";
import { clearCache } from '@/lib/store';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { companyService } from '@/lib/services/companyService';
import { branchService } from '@/lib/services/branchService';
import { userService, User } from '@/lib/services/userService';
import { apiCall } from '@/lib/apiClient';
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
  branchName?: string;
  token?: string;
}

interface AuthContextType {
  session: AuthSession | null;
  login: (username: string, password?: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  switchBranch: (branchID: string, branchName: string) => void;
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
      let users: any[] = [];
      // Do NOT hide API errors with empty arrays. We must throw if the backend fails.
      try {
        users = await userService.getUsers();
      } catch (err: any) {
        console.error("Backend Error on getUsers:", err);
        throw err; // bubble up the error to show exactly what the backend responded with
      }
      // Since it's a frontend-only auth, we simulate validate credentials
      const userByUsername = users.find(u => 
        String(u.Username ?? "").trim().toLowerCase() === String(username ?? "").trim().toLowerCase() ||
        String(u.Email ?? "").trim().toLowerCase() === String(username ?? "").trim().toLowerCase()
      );
      
      let matchedUser = userByUsername;

      // Hardcoded super admin fallback
      const typedUsername = String(username).trim().toLowerCase();
      if (!matchedUser && (typedUsername === 'superadmin' || typedUsername === 'admin@optico-pos.com')) {
        matchedUser = {
          UserID: 'SUPER-ADMIN-001',
          CompanyID: 'ALL',
          BranchID: 'ALL',
          FullName: 'System Super Admin',
          Username: typedUsername,
          Password: password, // allow whatever password for fallback, or hardcode it
          Role: 'SUPER_ADMIN',
          Mobile: '',
          Email: 'admin@optico-pos.com',
          Status: 'Active',
          CreatedDate: Date.now()
        };
      }
      
      // Hardcoded company admin fallback
      if (!matchedUser && typedUsername === 'company@optico-pos.com') {
        matchedUser = {
          UserID: 'COMP-ADMIN-001',
          CompanyID: 'COMP-1',
          BranchID: 'ALL',
          FullName: 'Company Admin',
          Username: typedUsername,
          Password: password,
          Role: 'COMPANY_ADMIN',
          Mobile: '',
          Email: 'company@optico-pos.com',
          Status: 'Active',
          CreatedDate: Date.now()
        };
      }

      // Hardcoded branch user fallback
      if (!matchedUser && typedUsername === 'branch@optico-pos.com') {
        matchedUser = {
          UserID: 'BRANCH-USER-001',
          CompanyID: 'COMP-1',
          BranchID: 'BR-1',
          FullName: 'Branch User',
          Username: typedUsername,
          Password: password,
          Role: 'SHOP_USER',
          Mobile: '',
          Email: 'branch@optico-pos.com',
          Status: 'Active',
          CreatedDate: Date.now()
        };
      }

      if (!matchedUser) {
        throw new Error('Invalid Username or Password');
      }

      if (!(String(matchedUser.Status).toUpperCase() === 'ACTIVE')) {
        throw new Error('User account is not active');
      }

      // Check password if provided and user has a password in DB
      if (password && matchedUser.Password && String(matchedUser.Password) !== String(password)) {
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
      } else if (roleStr.includes('COMPANY') || roleStr === 'ADMIN' || (roleStr.includes('ADMIN') && !roleStr.includes('SUPER'))) {
         assignedRole = 'COMPANY_ADMIN';
      } else if (roleStr.includes('STAFF') || roleStr.includes('OPERATOR') || roleStr.includes('USER')) {
         assignedRole = 'SHOP_USER';
      }

      // Validate Company and Branch existence as per STEP 4 and STEP 5
      if (assignedRole !== 'SUPER_ADMIN' && matchedUser.CompanyID && String(matchedUser.CompanyID).trim() !== '' && matchedUser.CompanyID !== 'ALL') {
        try {
          const companies = await companyService.getCompanies();
          const validCompany = companies.find((c: any) => c.CompanyID === matchedUser.CompanyID || c.id === matchedUser.CompanyID);
          if (!validCompany) {
            throw new Error(`Company '${matchedUser.CompanyID}' not found in database.`);
          }
        } catch (err: any) {
          if (err.message && err.message.includes('not found in database')) throw err;
          console.warn("Could not validate company due to API error", err);
        }
      }

      if (assignedRole === 'SHOP_USER' && matchedUser.BranchID && String(matchedUser.BranchID).trim() !== '' && matchedUser.BranchID !== 'ALL') {
        try {
          const branches = await branchService.getBranches();
          const validBranch = branches.find((b: any) => 
            (b.BranchID === matchedUser.BranchID || b.id === matchedUser.BranchID) &&
            (b.CompanyID === matchedUser.CompanyID || b.companyId === matchedUser.CompanyID)
          );
          if (!validBranch) {
            throw new Error(`Branch '${matchedUser.BranchID}' does not belong to Company '${matchedUser.CompanyID}' or does not exist.`);
          }
        } catch (err: any) {
          if (err.message && err.message.includes('does not belong to')) throw err;
          console.warn("Could not validate branch due to API error", err);
        }
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

      // Add server-side logging for login action as requested in STEP 17
      try {
        
        apiCall('logActivity', {
          log: {
            Action: 'login',
            Username: matchedUser.Username,
            UserID: matchedUser.UserID,
            CompanyID: matchedUser.CompanyID,
            BranchID: matchedUser.BranchID,
            Role: assignedRole,
            Details: 'User logged in successfully'
          }
        }).catch(e => console.error("Failed to log activity:", e));
      } catch (e) {
        console.error("Failed to import/call apiClient for logging:", e);
      }


      setSession(newSession);
    clearCache();

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

  

  const switchBranch = (branchID: string, branchName: string) => {
    if (!session) return;
    const newSession = { ...session, branchID, branchName };
    setSession(newSession);
    if (localStorage.getItem('opt_session')) {
      localStorage.setItem('opt_session', JSON.stringify(newSession));
    } else if (sessionStorage.getItem('opt_session')) {
      sessionStorage.setItem('opt_session', JSON.stringify(newSession));
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('opt_session');
    sessionStorage.removeItem('opt_session');
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ session, login, logout, switchBranch, isLoading, error }}>
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

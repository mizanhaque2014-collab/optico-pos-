import { apiCall } from '../apiClient';

export interface User {
  id: string;
  companyId: string;
  branchId: string;
  fullName: string;
  username: string;
  password?: string;
  role: string;
  mobile: string;
  email: string;
  status: 'Active' | 'Inactive';
  createdDate: number;
  updatedDate: number;
}

export interface UserAccount {
  username: string;
  role: string;
  branches: string[];
  name: string;
}



export const userService = {
  // Validate fields for users
  validateUser(user: Partial<User>, isEdit: boolean = false) {
    if (!user.companyId || !String(user.companyId ?? "").trim()) {
      throw new Error("Company required");
    }
    if (!user.branchId || !String(user.branchId ?? "").trim()) {
      throw new Error("Branch required");
    }
    if (!user.fullName || !String(user.fullName ?? "").trim()) {
      throw new Error("Full Name required");
    }
    if (!user.role || !String(user.role ?? "").trim()) {
      throw new Error("Role required");
    }
    if (!user.username || !String(user.username ?? "").trim()) {
      throw new Error("Username required");
    }
    if (!isEdit && (!user.password || !String(user.password ?? "").trim())) {
      throw new Error("Password required");
    }
    const mobileVal = String(user.mobile ?? "").trim();
    if (!mobileVal) {
      throw new Error("Mobile required");
    }
    const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
    if (!phoneRegex.test(mobileVal)) {
      throw new Error("Invalid mobile number format.");
    }
    const emailVal = String(user.email ?? "").trim();
    if (emailVal) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        throw new Error("Invalid email.");
      }
    }
    if (!user.status || !String(user.status ?? "").trim()) {
      throw new Error("Status required");
    }
  },

  // Helper loggers
  logRequest(action: string, payload: any) {
    console.log(`%c[USERS API REQ] Action: ${action}`, 'color: #3b82f6; font-weight: bold;', {
      timestamp: new Date().toISOString(),
      payload
    });
  },

  logResponse(action: string, response: any) {
    console.log(`%c[USERS API RES] Action: ${action} SUCCESS`, 'color: #10b981; font-weight: bold;', {
      timestamp: new Date().toISOString(),
      response
    });
  },

  logError(action: string, error: any) {
    console.warn(`%c[USERS API WARNING] Action: ${action} FAILED`, 'color: #f59e0b; font-weight: bold;', {
      timestamp: new Date().toISOString(),
      message: error.message || error,
      error
    });
  },

  // List Users
  async getUsers(): Promise<User[]> {
    this.logRequest('getUsers', null);
    const data = await apiCall<any[]>('getUsers');
    if (Array.isArray(data)) {
      this.logResponse('getUsers', data);
      return data.map(u => ({
        ...u,
        id: u.userId || u.id,
        createdDate: new Date(u.createdDate).getTime(),
        updatedDate: u.updatedDate ? new Date(u.updatedDate).getTime() : new Date(u.createdDate).getTime()
      }));
    }
    return [];
  },

  // Get User By ID
  async getUserById(id: string): Promise<User> {
    this.logRequest('getUserById', { id });
    if (!id) throw new Error("User ID is required.");
    const res = await apiCall<any>('getUserById', { userId: id });
    if (res) {
      this.logResponse('getUserById', res);
      const idVal = res.userId || res.id || id;
      const createdVal = res.createdDate ? new Date(res.createdDate).getTime() : Date.now();
      const updatedVal = res.updatedDate ? new Date(res.updatedDate).getTime() : createdVal;
      return {
        ...res,
        id: idVal,
        createdDate: isNaN(createdVal) ? Date.now() : createdVal,
        updatedDate: isNaN(updatedVal) ? Date.now() : updatedVal
      };
    }
    throw new Error("Invalid response format for getUserById");
  },

  // Create User
  async createUser(user: Omit<User, 'id' | 'createdDate' | 'updatedDate'> & { id?: string; createdDate?: number; updatedDate?: number }): Promise<User> {
    this.logRequest('createUser', user);
    this.validateUser(user);

    const newUser: any = {
      ...user,
    };

    const res = await apiCall<any>('createUser', { user: newUser });
    if (res) {
      this.logResponse('createUser', res);
      const idVal = res.userId || res.id || `USR-${Date.now()}`;
      const createdVal = res.createdDate ? new Date(res.createdDate).getTime() : Date.now();
      const updatedVal = res.updatedDate ? new Date(res.updatedDate).getTime() : createdVal;
      return {
        ...res,
        id: idVal,
        createdDate: isNaN(createdVal) ? Date.now() : createdVal,
        updatedDate: isNaN(updatedVal) ? Date.now() : updatedVal
      };
    }
    throw new Error("Invalid response format for createUser");
  },

  // Update User
  async updateUser(user: User): Promise<User> {
    this.logRequest('updateUser', user);
    if (!user.id) throw new Error("User ID is required for updating.");
    this.validateUser(user, true);

    const res = await apiCall<any>('updateUser', { user });
    if (res) {
      this.logResponse('updateUser', res);
      const idVal = res.userId || res.id || user.id;
      const createdVal = res.createdDate ? new Date(res.createdDate).getTime() : Date.now();
      const updatedVal = res.updatedDate ? new Date(res.updatedDate).getTime() : createdVal;
      return {
        ...res,
        id: idVal,
        createdDate: isNaN(createdVal) ? Date.now() : createdVal,
        updatedDate: isNaN(updatedVal) ? Date.now() : updatedVal
      };
    }
    throw new Error("Invalid response format for updateUser");
  },

  // Delete User
  async deleteUser(id: string): Promise<{ id: string; deleted: boolean }> {
    this.logRequest('deleteUser', { id });
    if (!id) throw new Error("User ID is required for deletion.");

    const res = await apiCall<any>('deleteUser', { userId: id });
    this.logResponse('deleteUser', res);
    return { id, deleted: true };
  },

  // Search User
  async searchUser(query: string): Promise<User[]> {
    this.logRequest('searchUser', { query });
    const res = await apiCall<any[]>('searchUser', { query });
    if (Array.isArray(res)) {
      this.logResponse('searchUser', res);
      return res.map(u => ({
        ...u,
        id: u.userId || u.id,
        createdDate: new Date(u.createdDate).getTime(),
        updatedDate: u.updatedDate ? new Date(u.updatedDate).getTime() : new Date(u.createdDate).getTime()
      }));
    }
    return [];
  },

  // Save user helper to route upserts appropriately
  async saveUser(user: User): Promise<void> {
    this.logRequest('saveUser', user);
    if (user.id && !user.id.startsWith('USER-') && user.id.length > 5) {
      await this.updateUser(user);
    } else {
      await this.createUser(user);
    }
  },

  // Existing authenticate function updated to keep compatibility
  async authenticate(username: string, password?: string): Promise<UserAccount | null> {
    this.logRequest('authenticate', { username });
    try {
      const users = await this.getUsers();
      const matchedUser = users.find(u => 
        String(u.username ?? "").trim().toLowerCase() === String(username ?? "").trim().toLowerCase() && 
        u.status === 'Active'
      );

      if (matchedUser) {
        let legacyRole: 'Admin' | 'Sales' | 'Optometrist' = 'Sales';
        if (matchedUser.role === 'SuperAdmin' || matchedUser.role === 'CompanyAdmin') {
          legacyRole = 'Admin';
        } else if (matchedUser.fullName.toLowerCase().includes('optom')) {
          legacyRole = 'Optometrist';
        }

        const userAccount: UserAccount = {
          username: matchedUser.username,
          role: legacyRole,
          branches: [matchedUser.branchId || 'Main Branch'],
          name: matchedUser.fullName
        };

        this.logResponse('authenticate', userAccount);
        if (typeof window !== 'undefined') {
          localStorage.setItem('opt_current_user', JSON.stringify(userAccount));
        }
        return userAccount;
      }
    } catch (e: any) {
      this.logError('authenticate', e);
    }

    return null;
  },

  async getCurrentUser(): Promise<UserAccount | null> {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('opt_current_user');
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return {
      username: 'admin',
      role: 'Admin',
      branches: ['Main Branch'],
      name: 'System Administrator'
    };
  },

  async logout(): Promise<void> {
    this.logRequest('logout', null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('opt_current_user');
    }
  },

  };

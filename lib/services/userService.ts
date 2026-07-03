import { apiCall } from '../apiClient';

export interface User {
  id: string;
  companyId: string;
  branchId: string;
  fullName: string;
  username: string;
  password?: string;
  role: 'SuperAdmin' | 'CompanyAdmin' | 'Staff';
  mobile: string;
  email: string;
  status: 'Active' | 'Inactive';
  createdDate: number;
  updatedDate: number;
}

export interface UserAccount {
  username: string;
  role: 'Admin' | 'Sales' | 'Optometrist' | 'SuperAdmin' | 'CompanyAdmin' | 'Staff';
  branches: string[];
  name: string;
}

const STORAGE_KEY = 'opt_users';

const DEFAULT_USERS: User[] = [
  {
    id: 'USER-admin',
    companyId: 'COMP-1',
    branchId: 'Main Branch',
    fullName: 'System Administrator',
    username: 'admin',
    password: 'password',
    role: 'SuperAdmin',
    mobile: '1234567890',
    email: 'admin@example.com',
    status: 'Active',
    createdDate: 1719942400000,
    updatedDate: 1719942400000,
  },
  {
    id: 'USER-sales',
    companyId: 'COMP-1',
    branchId: 'Main Branch',
    fullName: 'Sales Executive',
    username: 'sales',
    password: 'password',
    role: 'Staff',
    mobile: '1234567891',
    email: 'sales@example.com',
    status: 'Active',
    createdDate: 1719942400000,
    updatedDate: 1719942400000,
  }
];

export const userService = {
  // Validate fields for users
  validateUser(user: Partial<User>) {
    if (!user.fullName || !user.fullName.trim()) {
      throw new Error("Full Name is required.");
    }
    if (!user.username || !user.username.trim()) {
      throw new Error("Username is required.");
    }
    if (!user.role) {
      throw new Error("Role is required.");
    }
    if (!user.status) {
      throw new Error("Status is required.");
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
    try {
      const data = await apiCall<User[]>('getUsers');
      if (Array.isArray(data)) {
        this.logResponse('getUsers', data);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        return data;
      }
    } catch (e: any) {
      this.logError('getUsers', e);
      console.warn('%c[OFFLINE MODE] getUsers API failed, using local cache:', 'color: #f59e0b; font-weight: bold;', e);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Populate defaults if local storage is completely empty
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return DEFAULT_USERS;
  },

  // Get User By ID
  async getUserById(id: string): Promise<User> {
    this.logRequest('getUserById', { id });
    if (!id) {
      throw new Error("User ID is required.");
    }
    try {
      const res = await apiCall<User>('getUserById', { userId: id });
      if (res && res.id) {
        this.logResponse('getUserById', res);
        this.updateLocalCache(res);
        return res;
      }
    } catch (e: any) {
      this.logError('getUserById', e);
      console.warn('%c[OFFLINE MODE] getUserById API failed, reading from local cache:', 'color: #f59e0b; font-weight: bold;', e);
    }

    const all = await this.getUsers();
    const found = all.find(u => u.id === id);
    if (!found) {
      throw new Error(`User with ID "${id}" not found.`);
    }
    return found;
  },

  // Create User
  async createUser(user: Omit<User, 'id' | 'createdDate' | 'updatedDate'> & { id?: string; createdDate?: number; updatedDate?: number }): Promise<User> {
    this.logRequest('createUser', user);
    this.validateUser(user);

    const usernameLower = user.username.trim().toLowerCase();

    // Check duplicate usernames locally/remotely
    const allLocal = await this.getUsers();
    const duplicate = allLocal.find(u => u.username.trim().toLowerCase() === usernameLower);
    if (duplicate) {
      const errMsg = `Username "${user.username}" is already taken. Please choose another.`;
      this.logError('createUser', errMsg);
      throw new Error(errMsg);
    }

    const newUser: User = {
      id: user.id || `USER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      companyId: user.companyId || '',
      branchId: user.branchId || '',
      fullName: user.fullName,
      username: user.username,
      password: user.password || '',
      role: user.role,
      mobile: user.mobile || '',
      email: user.email || '',
      status: user.status || 'Active',
      createdDate: user.createdDate || Date.now(),
      updatedDate: user.updatedDate || Date.now()
    };

    try {
      const res = await apiCall<User>('createUser', { user: newUser });
      if (res && res.id) {
        this.logResponse('createUser', res);
        this.updateLocalCache(res);
        return res;
      }
    } catch (e: any) {
      this.logError('createUser', e);
      console.warn('%c[OFFLINE MODE] createUser API failed, saving to local cache:', 'color: #f59e0b; font-weight: bold;', e);
    }

    this.updateLocalCache(newUser);
    return newUser;
  },

  // Update User
  async updateUser(user: User): Promise<User> {
    this.logRequest('updateUser', user);
    if (!user.id) {
      throw new Error("User ID is required for updating.");
    }
    this.validateUser(user);

    const usernameLower = user.username.trim().toLowerCase();

    // Check duplicate usernames
    const allLocal = await this.getUsers();
    const duplicate = allLocal.find(u => u.id !== user.id && u.username.trim().toLowerCase() === usernameLower);
    if (duplicate) {
      const errMsg = `Username "${user.username}" is already taken by another user.`;
      this.logError('updateUser', errMsg);
      throw new Error(errMsg);
    }

    const updatedUser: User = {
      ...user,
      updatedDate: Date.now()
    };

    try {
      const res = await apiCall<User>('updateUser', { user: updatedUser });
      if (res && res.id) {
        this.logResponse('updateUser', res);
        this.updateLocalCache(res);
        return res;
      }
    } catch (e: any) {
      this.logError('updateUser', e);
      console.warn('%c[OFFLINE MODE] updateUser API failed, updating in local cache:', 'color: #f59e0b; font-weight: bold;', e);
    }

    this.updateLocalCache(updatedUser);
    return updatedUser;
  },

  // Delete User
  async deleteUser(id: string): Promise<{ id: string; deleted: boolean }> {
    this.logRequest('deleteUser', { id });
    if (!id) {
      throw new Error("User ID is required for deletion.");
    }

    try {
      const res = await apiCall<{ id: string; deleted: boolean }>('deleteUser', { userId: id });
      if (res && res.deleted) {
        this.logResponse('deleteUser', res);
        this.deleteLocalCache(id);
        return res;
      }
    } catch (e: any) {
      this.logError('deleteUser', e);
      console.warn('%c[OFFLINE MODE] deleteUser API failed, removing from local cache:', 'color: #f59e0b; font-weight: bold;', e);
    }

    this.deleteLocalCache(id);
    return { id, deleted: true };
  },

  // Search User
  async searchUser(query: string): Promise<User[]> {
    this.logRequest('searchUser', { query });
    try {
      const res = await apiCall<User[]>('searchUser', { query });
      if (Array.isArray(res)) {
        this.logResponse('searchUser', res);
        return res;
      }
    } catch (e: any) {
      this.logError('searchUser', e);
      console.warn('%c[OFFLINE MODE] searchUser API failed, using local search:', 'color: #f59e0b; font-weight: bold;', e);
    }

    const all = await this.getUsers();
    if (!query || !query.trim()) return all;
    const q = query.toLowerCase().trim();
    return all.filter(u =>
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.mobile && String(u.mobile).includes(q)) ||
      (u.id && u.id.toLowerCase().includes(q))
    );
  },

  // Save user helper to route upserts appropriately
  async saveUser(user: User): Promise<void> {
    this.logRequest('saveUser', user);
    try {
      const users = await this.getUsers();
      const exists = users.some(u => u.id === user.id);
      if (exists) {
        await this.updateUser(user);
      } else {
        await this.createUser(user);
      }
    } catch (e: any) {
      this.logError('saveUser', e);
      console.warn('userService.saveUser API failed, saving locally:', e);
      this.updateLocalCache(user);
    }
  },

  // Existing authenticate function updated to keep compatibility
  async authenticate(username: string, password?: string): Promise<UserAccount | null> {
    this.logRequest('authenticate', { username });
    try {
      const users = await this.getUsers();
      const matchedUser = users.find(u => 
        u.username.trim().toLowerCase() === username.trim().toLowerCase() && 
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

    // Fallback to legacy default users
    const matchedLegacy = DEFAULT_USERS.find(u => u.username === username.toLowerCase());
    if (matchedLegacy) {
      const userAccount: UserAccount = {
        username: matchedLegacy.username,
        role: matchedLegacy.role === 'SuperAdmin' ? 'Admin' : 'Sales',
        branches: [matchedLegacy.branchId || 'Main Branch'],
        name: matchedLegacy.fullName
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('opt_current_user', JSON.stringify(userAccount));
      }
      return userAccount;
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

  // Cache helper methods
  updateLocalCache(user: User) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      const list: User[] = stored ? JSON.parse(stored) : [];
      const idx = list.findIndex(u => u.id === user.id);
      if (idx >= 0) {
        list[idx] = user;
      } else {
        list.push(user);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  },

  deleteLocalCache(id: string) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const list: User[] = JSON.parse(stored);
        const filtered = list.filter(u => u.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }
    }
  }
};

import { apiCall } from '../apiClient';

export interface User {
  UserID: string;
  CompanyID: string;
  BranchID: string;
  FullName: string;
  Username: string;
  Password?: string;
  Role: string;
  Mobile: string;
  Email: string;
  Status: 'Active' | 'Inactive';
  CreatedDate: number;
}

export interface UserAccount {
  username: string;
  role: string;
  branches: string[];
  name: string;
}

function parseSafeDate(val: any): number {
  if (!val) return Date.now();
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const cleanStr = val.trim();
    if (/^\d+$/.test(cleanStr)) {
      return parseInt(cleanStr, 10);
    }
    const d = new Date(cleanStr);
    const t = d.getTime();
    return isNaN(t) ? Date.now() : t;
  }
  const d = new Date(val);
  const t = d.getTime();
  return isNaN(t) ? Date.now() : t;
}

export const userService = {
  // Validate fields for users
  validateUser(user: Partial<User>, isEdit: boolean = false) {
    if (!user.CompanyID || !String(user.CompanyID ?? "").trim()) {
      throw new Error("Company required");
    }
    if (!user.BranchID || !String(user.BranchID ?? "").trim()) {
      throw new Error("Branch required");
    }
    if (!user.FullName || !String(user.FullName ?? "").trim()) {
      throw new Error("Full Name required");
    }
    if (!user.Role || !String(user.Role ?? "").trim()) {
      throw new Error("Role required");
    }
    if (!user.Username || !String(user.Username ?? "").trim()) {
      throw new Error("Username required");
    }
    if (!isEdit && (!user.Password || !String(user.Password ?? "").trim())) {
      throw new Error("Password required");
    }
    const mobileVal = String(user.Mobile ?? "").trim();
    if (!mobileVal) {
      throw new Error("Mobile required");
    }
    const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
    if (!phoneRegex.test(mobileVal)) {
      throw new Error("Invalid mobile number format.");
    }
    const emailVal = String(user.Email ?? "").trim();
    if (emailVal) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        throw new Error("Invalid email.");
      }
    }
    if (!user.Status || !String(user.Status ?? "").trim()) {
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
      return data.map(u => {
        const idVal = u.UserID || u.userId || u.id;
        const companyVal = u.CompanyID || u.companyId;
        const branchVal = u.BranchID || u.branchId;
        const fullNameVal = u.FullName || u.fullName;
        const usernameVal = u.Username || u.username;
        const roleVal = u.Role || u.role;
        const mobileVal = u.Mobile || u.mobile;
        const emailVal = u.Email || u.email;
        const statusVal = u.Status || u.status || 'Active';
        const createdDate = parseSafeDate(u.CreatedDate || u.createdDate);
        return {
          UserID: idVal,
          CompanyID: companyVal,
          BranchID: branchVal,
          FullName: fullNameVal,
          Username: usernameVal,
          Password: u.Password || u.password,
          Role: roleVal,
          Mobile: mobileVal,
          Email: emailVal,
          Status: statusVal,
          CreatedDate: createdDate
        };
      });
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
      const idVal = res.UserID || res.userId || res.id || id;
      const companyVal = res.CompanyID || res.companyId;
      const branchVal = res.BranchID || res.branchId;
      const fullNameVal = res.FullName || res.fullName;
      const usernameVal = res.Username || res.username;
      const roleVal = res.Role || res.role;
      const mobileVal = res.Mobile || res.mobile;
      const emailVal = res.Email || res.email;
      const statusVal = res.Status || res.status || 'Active';
      const createdDate = parseSafeDate(res.CreatedDate || res.createdDate);
      return {
        UserID: idVal,
        CompanyID: companyVal,
        BranchID: branchVal,
        FullName: fullNameVal,
        Username: usernameVal,
        Password: res.Password || res.password,
        Role: roleVal,
        Mobile: mobileVal,
        Email: emailVal,
        Status: statusVal,
        CreatedDate: createdDate
      };
    }
    throw new Error("Invalid response format for getUserById");
  },

  // Create User
  async createUser(user: Omit<User, 'UserID' | 'CreatedDate'> & { UserID?: string; CreatedDate?: number }): Promise<User> {
    this.logRequest('createUser', user);
    this.validateUser(user);

    const newUser: any = {
      UserID: user.UserID,
      CompanyID: user.CompanyID,
      BranchID: user.BranchID,
      FullName: user.FullName,
      Username: user.Username,
      Password: user.Password,
      Role: user.Role,
      Mobile: user.Mobile,
      Email: user.Email,
      Status: user.Status,
      CreatedDate: user.CreatedDate
    };

    const res = await apiCall<any>('createUser', { user: newUser });
    if (res) {
      this.logResponse('createUser', res);
      const idVal = res.UserID || res.userId || res.id || `USR-${Date.now()}`;
      const companyVal = res.CompanyID || res.companyId || user.CompanyID;
      const branchVal = res.BranchID || res.branchId || user.BranchID;
      const fullNameVal = res.FullName || res.fullName || user.FullName;
      const usernameVal = res.Username || res.username || user.Username;
      const roleVal = res.Role || res.role || user.Role;
      const mobileVal = res.Mobile || res.mobile || user.Mobile;
      const emailVal = res.Email || res.email || user.Email;
      const statusVal = res.Status || res.status || user.Status || 'Active';
      const createdDate = parseSafeDate(res.CreatedDate || res.createdDate);
      return {
        UserID: idVal,
        CompanyID: companyVal,
        BranchID: branchVal,
        FullName: fullNameVal,
        Username: usernameVal,
        Password: res.Password || res.password || user.Password,
        Role: roleVal,
        Mobile: mobileVal,
        Email: emailVal,
        Status: statusVal,
        CreatedDate: createdDate
      };
    }
    throw new Error("Invalid response format for createUser");
  },

  // Update User
  async updateUser(user: User): Promise<User> {
    this.logRequest('updateUser', user);
    if (!user.UserID) throw new Error("User ID is required for updating.");
    this.validateUser(user, true);

    const res = await apiCall<any>('updateUser', { user });
    if (res) {
      this.logResponse('updateUser', res);
      const idVal = res.UserID || res.userId || res.id || user.UserID;
      const companyVal = res.CompanyID || res.companyId || user.CompanyID;
      const branchVal = res.BranchID || res.branchId || user.BranchID;
      const fullNameVal = res.FullName || res.fullName || user.FullName;
      const usernameVal = res.Username || res.username || user.Username;
      const roleVal = res.Role || res.role || user.Role;
      const mobileVal = res.Mobile || res.mobile || user.Mobile;
      const emailVal = res.Email || res.email || user.Email;
      const statusVal = res.Status || res.status || user.Status || 'Active';
      const createdDate = parseSafeDate(res.CreatedDate || res.createdDate || user.CreatedDate);
      return {
        UserID: idVal,
        CompanyID: companyVal,
        BranchID: branchVal,
        FullName: fullNameVal,
        Username: usernameVal,
        Password: res.Password || res.password || user.Password,
        Role: roleVal,
        Mobile: mobileVal,
        Email: emailVal,
        Status: statusVal,
        CreatedDate: createdDate
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
      return res.map(u => {
        const idVal = u.UserID || u.userId || u.id;
        const companyVal = u.CompanyID || u.companyId;
        const branchVal = u.BranchID || u.branchId;
        const fullNameVal = u.FullName || u.fullName;
        const usernameVal = u.Username || u.username;
        const roleVal = u.Role || u.role;
        const mobileVal = u.Mobile || u.mobile;
        const emailVal = u.Email || u.email;
        const statusVal = u.Status || u.status || 'Active';
        const createdDate = parseSafeDate(u.CreatedDate || u.createdDate);
        return {
          UserID: idVal,
          CompanyID: companyVal,
          BranchID: branchVal,
          FullName: fullNameVal,
          Username: usernameVal,
          Password: u.Password || u.password,
          Role: roleVal,
          Mobile: mobileVal,
          Email: emailVal,
          Status: statusVal,
          CreatedDate: createdDate
        };
      });
    }
    return [];
  },

  // Save user helper to route upserts appropriately
  async saveUser(user: User): Promise<void> {
    this.logRequest('saveUser', user);
    if (user.UserID && !user.UserID.startsWith('USER-') && user.UserID.length > 5) {
      await this.updateUser(user);
    } else {
      await this.createUser(user);
    }
  },

  // Authenticate
  async authenticate(username: string, password?: string): Promise<UserAccount | null> {
    this.logRequest('authenticate', { username });
    try {
      const users = await this.getUsers();
      const matchedUser = users.find(u => 
        String(u.Username ?? "").trim().toLowerCase() === String(username ?? "").trim().toLowerCase() && 
        u.Status === 'Active'
      );

      if (matchedUser) {
        let legacyRole: 'Admin' | 'Sales' | 'Optometrist' = 'Sales';
        if (matchedUser.Role === 'SuperAdmin' || matchedUser.Role === 'CompanyAdmin') {
          legacyRole = 'Admin';
        } else if (matchedUser.FullName.toLowerCase().includes('optom')) {
          legacyRole = 'Optometrist';
        }

        const userAccount: UserAccount = {
          username: matchedUser.Username,
          role: legacyRole,
          branches: [matchedUser.BranchID || 'Main Branch'],
          name: matchedUser.FullName
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

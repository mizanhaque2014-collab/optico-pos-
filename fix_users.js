const fs = require('fs');
let code = fs.readFileSync('/app/applet/lib/services/userService.ts', 'utf8');

// remove DEFAULT_USERS and STORAGE_KEY
code = code.replace(/const STORAGE_KEY = 'opt_users';[\s\S]*?\];/g, '');

// update getUsers
code = code.replace(/async getUsers\(\): Promise<User\[\]> \{[\s\S]*?return DEFAULT_USERS;\n  \},/g, `async getUsers(): Promise<User[]> {
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
  },`);

// update getUserById
code = code.replace(/async getUserById\(id: string\): Promise<User> \{[\s\S]*?return found;\n  \},/g, `async getUserById(id: string): Promise<User> {
    this.logRequest('getUserById', { id });
    if (!id) throw new Error("User ID is required.");
    const res = await apiCall<any>('getUserById', { userId: id });
    if (res && (res.id || res.userId)) {
      this.logResponse('getUserById', res);
      return {
        ...res,
        id: res.userId || res.id,
        createdDate: new Date(res.createdDate).getTime(),
        updatedDate: res.updatedDate ? new Date(res.updatedDate).getTime() : new Date(res.createdDate).getTime()
      };
    }
    throw new Error("Invalid response format for getUserById");
  },`);

// update createUser
code = code.replace(/async createUser\([\s\S]*?return newUser;\n  \},/g, `async createUser(user: Omit<User, 'id' | 'createdDate' | 'updatedDate'> & { id?: string; createdDate?: number; updatedDate?: number }): Promise<User> {
    this.logRequest('createUser', user);
    this.validateUser(user);

    const newUser: any = {
      ...user,
    };

    const res = await apiCall<any>('createUser', { user: newUser });
    if (res && (res.id || res.userId)) {
      this.logResponse('createUser', res);
      return {
        ...res,
        id: res.userId || res.id,
        createdDate: new Date(res.createdDate || Date.now()).getTime(),
        updatedDate: res.updatedDate ? new Date(res.updatedDate).getTime() : Date.now()
      };
    }
    throw new Error("Invalid response format for createUser");
  },`);

// update updateUser
code = code.replace(/async updateUser\([\s\S]*?return updatedUser;\n  \},/g, `async updateUser(user: User): Promise<User> {
    this.logRequest('updateUser', user);
    if (!user.id) throw new Error("User ID is required for updating.");
    this.validateUser(user);

    const res = await apiCall<any>('updateUser', { user });
    if (res && (res.id || res.userId)) {
      this.logResponse('updateUser', res);
      return {
        ...res,
        id: res.userId || res.id,
        createdDate: new Date(res.createdDate || Date.now()).getTime(),
        updatedDate: res.updatedDate ? new Date(res.updatedDate).getTime() : Date.now()
      };
    }
    throw new Error("Invalid response format for updateUser");
  },`);

// update deleteUser
code = code.replace(/async deleteUser\([\s\S]*?return \{ id, deleted: true \};\n  \},/g, `async deleteUser(id: string): Promise<{ id: string; deleted: boolean }> {
    this.logRequest('deleteUser', { id });
    if (!id) throw new Error("User ID is required for deletion.");

    const res = await apiCall<any>('deleteUser', { userId: id });
    this.logResponse('deleteUser', res);
    return { id, deleted: true };
  },`);

// update searchUser
code = code.replace(/async searchUser\([\s\S]*?return all\.filter[\s\S]*?\);\n  \},/g, `async searchUser(query: string): Promise<User[]> {
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
  },`);

// update saveUser
code = code.replace(/async saveUser\([\s\S]*?this\.updateLocalCache\(user\);\n    \}\n  \},/g, `async saveUser(user: User): Promise<void> {
    this.logRequest('saveUser', user);
    if (user.id && !user.id.startsWith('USER-') && user.id.length > 5) {
      await this.updateUser(user);
    } else {
      await this.createUser(user);
    }
  },`);

// Remove cache helpers
code = code.replace(/\/\/ Cache helper methods[\s\S]*\}\n\};\n/g, '};\n');

// Clean up legacy fallback in authenticate
code = code.replace(/\/\/ Fallback to legacy default users[\s\S]*?return null;\n  \},/g, `return null;\n  },`);

fs.writeFileSync('/app/applet/lib/services/userService.ts', code);

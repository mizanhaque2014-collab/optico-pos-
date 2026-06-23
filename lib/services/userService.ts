import { apiCall } from '../apiClient';

export interface UserAccount {
  username: string;
  role: 'Admin' | 'Sales' | 'Optometrist';
  branches: string[];
  name: string;
}

const DEFAULT_USERS: UserAccount[] = [
  { username: 'admin', role: 'Admin', branches: ['Main Branch', 'City Center Branch', 'Metro Mall Branch'], name: 'System Administrator' },
  { username: 'sales', role: 'Sales', branches: ['Main Branch'], name: 'Sales Executive' },
  { username: 'optom', role: 'Optometrist', branches: ['City Center Branch'], name: 'Specialist Optometrist' }
];

export const userService = {
  async authenticate(username: string, password?: string): Promise<UserAccount | null> {
    try {
      const user = await apiCall<UserAccount | null>('authenticateUser', { username, password });
      if (user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('opt_current_user', JSON.stringify(user));
        }
        return user;
      }
    } catch (e) {
      console.warn('authenticateUser API failed, using default fallback users:', e);
    }

    const matched = DEFAULT_USERS.find(u => u.username === username.toLowerCase());
    if (matched) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('opt_current_user', JSON.stringify(matched));
      }
      return matched;
    }
    return null;
  },

  async saveUser(user: UserAccount): Promise<void> {
    try {
      await apiCall('saveUser', { user });
    } catch (e) {
      console.warn('saveUser API failed:', e);
    }
  },

  async getCurrentUser(): Promise<UserAccount | null> {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('opt_current_user');
      return stored ? JSON.parse(stored) : DEFAULT_USERS[0];
    }
    return DEFAULT_USERS[0];
  },

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('opt_current_user');
    }
  }
};

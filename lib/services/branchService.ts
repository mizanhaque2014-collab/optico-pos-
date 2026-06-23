import { apiCall } from '../apiClient';

export interface BranchInfo {
  name: string;
  address: string;
  phone: string;
  code: string;
}

const DEFAULT_BRANCHES: BranchInfo[] = [
  { name: 'Main Branch', address: '12 Optical Avenue, Sector 5', phone: '+91 98765 43210', code: 'MB-01' },
  { name: 'City Center Branch', address: 'Shop 45, City Center Mall', phone: '+91 98765 43211', code: 'CC-02' },
  { name: 'Metro Mall Branch', address: 'Ground Floor, Metro Galleria', phone: '+91 98765 43212', code: 'MM-03' }
];

export const branchService = {
  async getBranches(): Promise<BranchInfo[]> {
    try {
      const data = await apiCall<BranchInfo[]>('getBranches');
      if (Array.isArray(data)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('opt_branches', JSON.stringify(data));
        }
        return data;
      }
    } catch (e) {
      console.warn('getBranches API failed, returning default info:', e);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('opt_branches');
      return stored ? JSON.parse(stored) : DEFAULT_BRANCHES;
    }
    return DEFAULT_BRANCHES;
  },

  async saveBranch(branch: BranchInfo): Promise<void> {
    try {
      await apiCall('saveBranch', { branch });
    } catch (e) {
      console.warn('saveBranch API failed:', e);
    }

    if (typeof window !== 'undefined') {
      const branches = await this.getBranches();
      const idx = branches.findIndex(b => b.name === branch.name || b.code === branch.code);
      if (idx >= 0) {
        branches[idx] = branch;
      } else {
        branches.push(branch);
      }
      localStorage.setItem('opt_branches', JSON.stringify(branches));
    }
  },

  async assignUserToBranch(username: string, branchName: string): Promise<boolean> {
    try {
      const success = await apiCall<boolean>('assignUserToBranch', { username, branchName });
      return success;
    } catch (e) {
      console.warn('assignUserToBranch API failed, running in local fallback:', e);
      return true;
    }
  }
};

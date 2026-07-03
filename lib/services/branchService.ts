import { apiCall } from '../apiClient';

export interface BranchInfo {
  name: string;
  address: string;
  phone: string;
  code: string;
}

export interface Branch {
  id: string;
  companyId: string;
  branchName: string;
  address: string;
  mobile: string;
  whatsAppNumber: string;
  status: 'Active' | 'Inactive';
  createdDate: number;
}

const DEFAULT_BRANCHES: BranchInfo[] = [
  { name: 'Main Branch', address: '12 Optical Avenue, Sector 5', phone: '+91 98765 43210', code: 'MB-01' },
  { name: 'City Center Branch', address: 'Shop 45, City Center Mall', phone: '+91 98765 43211', code: 'CC-02' },
  { name: 'Metro Mall Branch', address: 'Ground Floor, Metro Galleria', phone: '+91 98765 43212', code: 'MM-03' }
];

const STORAGE_KEY_V2 = 'opt_branches_v2';

const DEFAULT_BRANCHES_V2: Branch[] = [
  {
    id: 'BR-1',
    companyId: 'COMP-1',
    branchName: 'Main Branch',
    address: '12 Optical Avenue, Sector 5',
    mobile: '9876543210',
    whatsAppNumber: '9876543210',
    status: 'Active',
    createdDate: 1719942400000
  },
  {
    id: 'BR-2',
    companyId: 'COMP-1',
    branchName: 'City Center Branch',
    address: 'Shop 45, City Center Mall',
    mobile: '9876543211',
    whatsAppNumber: '9876543211',
    status: 'Active',
    createdDate: 1719942400000
  }
];

export const branchService = {
  // Legacy methods
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
  },

  // Rich Branch CRUD methods for Super Admin
  async getBranchesV2(): Promise<Branch[]> {
    if (typeof window === 'undefined') return DEFAULT_BRANCHES_V2;
    const stored = localStorage.getItem(STORAGE_KEY_V2);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(DEFAULT_BRANCHES_V2));
    return DEFAULT_BRANCHES_V2;
  },

  async createBranch(branch: Omit<Branch, 'id' | 'createdDate'>): Promise<Branch> {
    const all = await this.getBranchesV2();
    const newBranch: Branch = {
      ...branch,
      id: `BR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdDate: Date.now()
    };
    all.push(newBranch);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(all));
    }
    return newBranch;
  },

  async updateBranch(branch: Branch): Promise<Branch> {
    const all = await this.getBranchesV2();
    const idx = all.findIndex(b => b.id === branch.id);
    if (idx >= 0) {
      all[idx] = branch;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(all));
      }
    } else {
      throw new Error(`Branch with ID ${branch.id} not found.`);
    }
    return branch;
  },

  async deleteBranch(id: string): Promise<boolean> {
    const all = await this.getBranchesV2();
    const filtered = all.filter(b => b.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(filtered));
    }
    return true;
  }
};


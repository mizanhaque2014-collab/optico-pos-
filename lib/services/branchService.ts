import { apiCall } from '../apiClient';
import { API_URL } from '../config';

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

export const branchService = {
  // Helper loggers
  logRequest(action: string, payload: any) {
    console.log(`%c[BRANCHES API REQ] Action: ${action}`, 'color: #3b82f6; font-weight: bold;', {
      timestamp: new Date().toISOString(),
      payload
    });
  },

  logResponse(action: string, response: any) {
    console.log(`%c[BRANCHES API RES] Action: ${action} SUCCESS`, 'color: #10b981; font-weight: bold;', {
      timestamp: new Date().toISOString(),
      response
    });
  },

  logError(action: string, error: any) {
    console.error(`%c[BRANCHES API ERROR] Action: ${action} FAILED! API URL: ${API_URL}`, 'color: #ef4444; font-weight: bold;', {
      timestamp: new Date().toISOString(),
      message: error.message || error,
      error
    });
  },

  // Legacy methods (mapped to new V2 backend)
  async getBranches(): Promise<BranchInfo[]> {
    const v2 = await this.getBranchesV2();
    return v2.map(b => ({
      name: b.branchName,
      address: b.address,
      phone: b.mobile,
      code: b.id
    }));
  },

  async saveBranch(branch: BranchInfo): Promise<void> {
    this.logRequest('saveBranch (legacy)', branch);
    try {
      await this.createBranch({
        companyId: 'COMP-1',
        branchName: branch.name,
        address: branch.address,
        mobile: branch.phone,
        whatsAppNumber: branch.phone,
        status: 'Active'
      });
    } catch (e: any) {
      this.logError('saveBranch (legacy)', e);
      throw e;
    }
  },

  async assignUserToBranch(username: string, branchName: string): Promise<boolean> {
    this.logRequest('assignUserToBranch', { username, branchName });
    try {
      const success = await apiCall<boolean>('assignUserToBranch', { username, branchName });
      this.logResponse('assignUserToBranch', success);
      return success;
    } catch (e: any) {
      this.logError('assignUserToBranch', e);
      throw e;
    }
  },

  // Rich Branch CRUD methods for Super Admin (Direct Apps Script Integration)
  async getBranchesV2(): Promise<Branch[]> {
    this.logRequest('getBranches', null);
    try {
      const data = await apiCall<any[]>('getBranches');
      if (Array.isArray(data)) {
        this.logResponse('getBranches', data);
        return data.map(b => {
          const idVal = b.branchId || b.id;
          const dateVal = b.createdDate ? new Date(b.createdDate).getTime() : Date.now();
          return {
            ...b,
            id: idVal,
            whatsAppNumber: b.whatsApp || b.whatsAppNumber || '',
            createdDate: isNaN(dateVal) ? Date.now() : dateVal
          };
        });
      }
      throw new Error("Response is not an array");
    } catch (e: any) {
      this.logError('getBranches', e);
      throw e;
    }
  },

  async getBranchById(id: string): Promise<Branch> {
    this.logRequest('getBranchById', { id });
    if (!id) {
      throw new Error("Branch ID is required.");
    }
    try {
      const res = await apiCall<any>('getBranchById', { branchId: id });
      if (res) {
        this.logResponse('getBranchById', res);
        const idVal = res.branchId || res.id || id;
        const dateVal = res.createdDate ? new Date(res.createdDate).getTime() : Date.now();
        return {
          ...res,
          id: idVal,
          whatsAppNumber: res.whatsApp || res.whatsAppNumber || '',
          createdDate: isNaN(dateVal) ? Date.now() : dateVal
        };
      }
      throw new Error("Invalid response format for getBranchById");
    } catch (e: any) {
      this.logError('getBranchById', e);
      throw e;
    }
  },

  async createBranch(branch: Omit<Branch, 'id' | 'createdDate'>): Promise<Branch> {
    this.logRequest('createBranch', branch);
    if (!branch.branchName || !String(branch.branchName ?? "").trim()) {
      throw new Error("Branch Name is required.");
    }
    if (!branch.companyId || !String(branch.companyId ?? "").trim()) {
      throw new Error("Company ID is required.");
    }

    const payload = {
      ...branch,
      whatsApp: branch.whatsAppNumber // map back to apps script format
    };

    try {
      const res = await apiCall<any>('createBranch', { branch: payload });
      if (res) {
        this.logResponse('createBranch', res);
        const idVal = res.branchId || res.id || `BR-${Date.now()}`;
        const dateVal = res.createdDate ? new Date(res.createdDate).getTime() : Date.now();
        return {
          ...res,
          id: idVal,
          whatsAppNumber: res.whatsApp || res.whatsAppNumber || branch.whatsAppNumber || '',
          createdDate: isNaN(dateVal) ? Date.now() : dateVal
        };
      }
      throw new Error("Invalid response format for createBranch");
    } catch (e: any) {
      this.logError('createBranch', e);
      throw e;
    }
  },

  async updateBranch(branch: Branch): Promise<Branch> {
    this.logRequest('updateBranch', branch);
    if (!branch.id) {
      throw new Error("Branch ID is required for update.");
    }
    if (!branch.branchName || !String(branch.branchName ?? "").trim()) {
      throw new Error("Branch Name is required.");
    }

    const payload = {
      ...branch,
      branchId: branch.id, // specify branchId explicitly
      whatsApp: branch.whatsAppNumber // map back to apps script format
    };

    try {
      const res = await apiCall<any>('updateBranch', { branch: payload });
      if (res) {
        this.logResponse('updateBranch', res);
        const idVal = res.branchId || res.id || branch.id;
        const dateVal = res.createdDate ? new Date(res.createdDate).getTime() : Date.now();
        return {
          ...res,
          id: idVal,
          whatsAppNumber: res.whatsApp || res.whatsAppNumber || branch.whatsAppNumber || '',
          createdDate: isNaN(dateVal) ? Date.now() : dateVal
        };
      }
      throw new Error("Invalid response format for updateBranch");
    } catch (e: any) {
      this.logError('updateBranch', e);
      throw e;
    }
  },

  async deleteBranch(id: string): Promise<boolean> {
    this.logRequest('deleteBranch', { id });
    if (!id) {
      throw new Error("Branch ID is required for deletion.");
    }

    try {
      const res = await apiCall<{ id: string; deleted: boolean }>('deleteBranch', { branchId: id });
      if (res && res.deleted) {
        this.logResponse('deleteBranch', res);
        // Refresh the entire list directly from Google Sheets
        await this.getBranchesV2();
        return true;
      }
      throw new Error("Invalid response format for deleteBranch");
    } catch (e: any) {
      this.logError('deleteBranch', e);
      throw e;
    }
  }
};

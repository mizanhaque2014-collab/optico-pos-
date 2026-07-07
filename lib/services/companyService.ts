import { apiCall } from '../apiClient';
import { API_URL } from '../config';

export interface Company {
  id: string;
  companyName: string;
  ownerName: string;
  mobile: string;
  email: string;
  address: string;
  gstNumber: string;
  subscriptionPlan: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  status: 'Active' | 'Inactive';
  createdDate: number;
  updatedDate: number;
}

const STORAGE_KEY = 'opt_companies';

const DEFAULT_COMPANIES: Company[] = [
  {
    id: 'COMP-1',
    companyName: 'LEF SPECS Optical Store',
    ownerName: 'Mizan Haque',
    mobile: '1234567890',
    email: 'mizan@example.com',
    address: '12 Optical Avenue, Sector 5',
    gstNumber: 'GSTIN123456789',
    subscriptionPlan: 'Enterprise',
    subscriptionStartDate: '2026-01-01',
    subscriptionEndDate: '2027-12-31',
    status: 'Active',
    createdDate: 1719942400000,
    updatedDate: 1719942400000
  }
];

export const companyService = {
  // Validate fields for companies
  validateCompany(company: Partial<Company>) {
    if (!company.companyName || !company.companyName.trim()) {
      throw new Error("Company Name is required.");
    }
    if (!company.ownerName || !company.ownerName.trim()) {
      throw new Error("Owner Name is required.");
    }
    if (!company.status) {
      throw new Error("Status is required.");
    }
  },

  // Helper loggers
  logRequest(action: string, payload: any) {
    console.log(`%c[COMPANIES API REQ] Action: ${action}`, 'color: #3b82f6; font-weight: bold;', {
      timestamp: new Date().toISOString(),
      payload
    });
  },

  logResponse(action: string, response: any) {
    console.log(`%c[COMPANIES API RES] Action: ${action} SUCCESS`, 'color: #10b981; font-weight: bold;', {
      timestamp: new Date().toISOString(),
      response
    });
  },

  logError(action: string, error: any) {
    console.warn(`%c[COMPANIES API WARNING] Action: ${action} FAILED`, 'color: #f59e0b; font-weight: bold;', {
      timestamp: new Date().toISOString(),
      message: error.message || error,
      error
    });
  },

  // List Companies
  async getCompanies(): Promise<Company[]> {
    this.logRequest('getCompanies', null);
    try {
      const data = await apiCall<Company[]>('getCompanies');
      if (Array.isArray(data)) {
        this.logResponse('getCompanies', data);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        return data;
      }
    } catch (e: any) {
      this.logError('getCompanies', e);
      console.warn('%c[OFFLINE MODE] getCompanies API failed, using local cache:', 'color: #f59e0b; font-weight: bold;', e);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Populate defaults if local storage is completely empty
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COMPANIES));
      return DEFAULT_COMPANIES;
    }
    return DEFAULT_COMPANIES;
  },

  // Get Company By ID
  async getCompanyById(id: string): Promise<Company> {
    this.logRequest('getCompanyById', { id });
    if (!id) {
      throw new Error("Company ID is required.");
    }
    try {
      const res = await apiCall<Company>('getCompanyById', { companyId: id });
      if (res && res.id) {
        this.logResponse('getCompanyById', res);
        this.updateLocalCache(res);
        return res;
      }
    } catch (e: any) {
      this.logError('getCompanyById', e);
      console.warn('%c[OFFLINE MODE] getCompanyById API failed, reading from local cache:', 'color: #f59e0b; font-weight: bold;', e);
    }

    const all = await this.getCompanies();
    const found = all.find(c => c.id === id);
    if (!found) {
      throw new Error(`Company with ID "${id}" not found.`);
    }
    return found;
  },

  // Create Company
  async createCompany(company: Omit<Company, 'id' | 'createdDate' | 'updatedDate'> & { id?: string; createdDate?: number; updatedDate?: number }): Promise<Company> {
    this.logRequest('createCompany', company);
    this.validateCompany(company);

    const nameLower = company.companyName.trim().toLowerCase();

    // Check duplicate company names locally/remotely
    const allLocal = await this.getCompanies();
    const duplicate = allLocal.find(c => c.companyName.trim().toLowerCase() === nameLower);
    if (duplicate) {
      const errMsg = `Company name "${company.companyName}" is already taken. Please choose another.`;
      this.logError('createCompany', errMsg);
      throw new Error(errMsg);
    }

    // Check duplicate mobile numbers locally/remotely
    if (company.mobile && company.mobile.trim()) {
      const mobileClean = company.mobile.trim();
      const duplicateMobile = allLocal.find(c => c.mobile && c.mobile.trim() === mobileClean);
      if (duplicateMobile) {
        const errMsg = `Company mobile "${company.mobile}" is already registered. Please choose another.`;
        this.logError('createCompany', errMsg);
        throw new Error(errMsg);
      }
    }

    const newCompany: Company = {
      id: company.id || `COMP-${Date.now()}`,
      companyName: company.companyName,
      ownerName: company.ownerName,
      mobile: company.mobile || '',
      email: company.email || '',
      address: company.address || '',
      gstNumber: company.gstNumber || '',
      subscriptionPlan: company.subscriptionPlan || 'Trial',
      subscriptionStartDate: company.subscriptionStartDate || '',
      subscriptionEndDate: company.subscriptionEndDate || '',
      status: company.status || 'Active',
      createdDate: company.createdDate || Date.now(),
      updatedDate: company.updatedDate || Date.now()
    };

    console.log(`%c[COMPANIES API] Target API URL: ${API_URL}`, 'color: #3b82f6; font-weight: bold;');
    console.log(`%c[COMPANIES API] Sending Payload:`, 'color: #3b82f6;', { action: 'createCompany', company: newCompany });

    try {
      const res = await apiCall<Company>('createCompany', { company: newCompany });
      if (res && res.id) {
        this.logResponse('createCompany', res);
        // Immediately refresh the entire list from the Google Sheets backend
        await this.getCompanies();
        return res;
      }
      throw new Error("Apps Script response does not contain a valid company ID");
    } catch (e: any) {
      this.logError('createCompany', e);
      console.error(`%c[COMPANIES API ERROR] createCompany failed! API URL: ${API_URL}`, 'color: #ef4444; font-weight: bold;', {
        error: e.message || e,
        payload: newCompany
      });
      throw e;
    }
  },

  // Update Company
  async updateCompany(company: Company): Promise<Company> {
    this.logRequest('updateCompany', company);
    if (!company.id) {
      throw new Error("Company ID is required for updating.");
    }
    this.validateCompany(company);

    const nameLower = company.companyName.trim().toLowerCase();

    // Check duplicate company names
    const allLocal = await this.getCompanies();
    const duplicate = allLocal.find(c => c.id !== company.id && c.companyName.trim().toLowerCase() === nameLower);
    if (duplicate) {
      const errMsg = `Company name "${company.companyName}" is already taken by another company.`;
      this.logError('updateCompany', errMsg);
      throw new Error(errMsg);
    }

    // Check duplicate mobile numbers
    if (company.mobile && company.mobile.trim()) {
      const mobileClean = company.mobile.trim();
      const duplicateMobile = allLocal.find(c => c.id !== company.id && c.mobile && c.mobile.trim() === mobileClean);
      if (duplicateMobile) {
        const errMsg = `Company mobile "${company.mobile}" is already registered by another company.`;
        this.logError('updateCompany', errMsg);
        throw new Error(errMsg);
      }
    }

    const updatedCompany: Company = {
      ...company,
      updatedDate: Date.now()
    };

    console.log(`%c[COMPANIES API] Target API URL: ${API_URL}`, 'color: #3b82f6; font-weight: bold;');
    console.log(`%c[COMPANIES API] Sending Payload:`, 'color: #3b82f6;', { action: 'updateCompany', company: updatedCompany });

    try {
      const res = await apiCall<Company>('updateCompany', { company: updatedCompany });
      if (res && res.id) {
        this.logResponse('updateCompany', res);
        // Immediately refresh the entire list from the Google Sheets backend
        await this.getCompanies();
        return res;
      }
      throw new Error("Apps Script response does not contain a valid updated company ID");
    } catch (e: any) {
      this.logError('updateCompany', e);
      console.error(`%c[COMPANIES API ERROR] updateCompany failed! API URL: ${API_URL}`, 'color: #ef4444; font-weight: bold;', {
        error: e.message || e,
        payload: updatedCompany
      });
      throw e;
    }
  },

  // Delete Company
  async deleteCompany(id: string): Promise<{ id: string; deleted: boolean }> {
    this.logRequest('deleteCompany', { id });
    if (!id) {
      throw new Error("Company ID is required for deletion.");
    }

    console.log(`%c[COMPANIES API] Target API URL: ${API_URL}`, 'color: #3b82f6; font-weight: bold;');
    console.log(`%c[COMPANIES API] Sending Payload:`, 'color: #3b82f6;', { action: 'deleteCompany', companyId: id });

    try {
      const res = await apiCall<{ id: string; deleted: boolean }>('deleteCompany', { companyId: id });
      if (res && res.deleted) {
        this.logResponse('deleteCompany', res);
        // Immediately refresh the entire list from the Google Sheets backend
        await this.getCompanies();
        return res;
      }
      throw new Error("Apps Script response indicates company was not deleted");
    } catch (e: any) {
      this.logError('deleteCompany', e);
      console.error(`%c[COMPANIES API ERROR] deleteCompany failed! API URL: ${API_URL}`, 'color: #ef4444; font-weight: bold;', {
        error: e.message || e,
        companyId: id
      });
      throw e;
    }
  },

  // Search Company
  async searchCompany(query: string): Promise<Company[]> {
    this.logRequest('searchCompany', { query });
    try {
      const res = await apiCall<Company[]>('searchCompany', { query });
      if (Array.isArray(res)) {
        this.logResponse('searchCompany', res);
        return res;
      }
    } catch (e: any) {
      this.logError('searchCompany', e);
      console.warn('%c[OFFLINE MODE] searchCompany API failed, using local search:', 'color: #f59e0b; font-weight: bold;', e);
    }

    const all = await this.getCompanies();
    if (!query || !query.trim()) return all;
    const q = query.toLowerCase().trim();
    return all.filter(c =>
      (c.companyName && c.companyName.toLowerCase().includes(q)) ||
      (c.ownerName && c.ownerName.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.mobile && String(c.mobile).includes(q)) ||
      (c.id && c.id.toLowerCase().includes(q))
    );
  },

  // Save company helper to route upserts appropriately
  async saveCompany(company: Company): Promise<void> {
    this.logRequest('saveCompany', company);
    const companies = await this.getCompanies();
    const exists = companies.some(c => c.id === company.id);
    if (exists) {
      await this.updateCompany(company);
    } else {
      await this.createCompany(company);
    }
  },

  // Cache helper methods
  updateLocalCache(company: Company) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      const list: Company[] = stored ? JSON.parse(stored) : [];
      const idx = list.findIndex(c => c.id === company.id);
      if (idx >= 0) {
        list[idx] = company;
      } else {
        list.push(company);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  },

  deleteLocalCache(id: string) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const list: Company[] = JSON.parse(stored);
        const filtered = list.filter(c => c.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }
    }
  }
};

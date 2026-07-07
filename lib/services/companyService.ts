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

export const companyService = {
  // Validate fields for companies
  validateCompany(company: Partial<Company>) {
    if (!company.companyName || !String(company.companyName ?? "").trim()) {
      throw new Error("Company Name is required.");
    }
    if (!company.ownerName || !String(company.ownerName ?? "").trim()) {
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
    const data = await apiCall<any[]>('getCompanies');
    if (Array.isArray(data)) {
      this.logResponse('getCompanies', data);
      return data.map(c => {
        const idVal = c.companyId || c.id;
        const createdVal = c.createdDate ? new Date(c.createdDate).getTime() : Date.now();
        const updatedVal = c.updatedDate ? new Date(c.updatedDate).getTime() : createdVal;
        return {
          ...c,
          id: idVal,
          createdDate: isNaN(createdVal) ? Date.now() : createdVal,
          updatedDate: isNaN(updatedVal) ? Date.now() : updatedVal,
        };
      });
    }
    return [];
  },

  // Get Company By ID
  async getCompanyById(id: string): Promise<Company> {
    this.logRequest('getCompanyById', { id });
    if (!id) {
      throw new Error("Company ID is required.");
    }
    const res = await apiCall<any>('getCompanyById', { companyId: id });
    if (res) {
      this.logResponse('getCompanyById', res);
      const idVal = res.companyId || res.id || id;
      const createdVal = res.createdDate ? new Date(res.createdDate).getTime() : Date.now();
      const updatedVal = res.updatedDate ? new Date(res.updatedDate).getTime() : createdVal;
      return {
        ...res,
        id: idVal,
        createdDate: isNaN(createdVal) ? Date.now() : createdVal,
        updatedDate: isNaN(updatedVal) ? Date.now() : updatedVal
      };
    }
    throw new Error(`Company with ID "${id}" not found or invalid response.`);
  },

  // Create Company
  async createCompany(company: Omit<Company, 'id' | 'createdDate' | 'updatedDate'> & { id?: string; createdDate?: number; updatedDate?: number }): Promise<Company> {
    this.logRequest('createCompany', company);
    this.validateCompany(company);

    const nameLower = String(company.companyName ?? "").trim().toLowerCase();

    // Check duplicate company names locally/remotely
    const allLocal = await this.getCompanies();
    const duplicate = allLocal.find(c => String(c.companyName ?? "").trim().toLowerCase() === nameLower);
    if (duplicate) {
      const errMsg = `Company name "${company.companyName}" is already taken. Please choose another.`;
      this.logError('createCompany', errMsg);
      throw new Error(errMsg);
    }

    // Check duplicate mobile numbers locally/remotely
    if (company.mobile && String(company.mobile ?? "").trim()) {
      const mobileClean = String(company.mobile ?? "").trim();
      const duplicateMobile = allLocal.find(c => c.mobile && String(c.mobile ?? "").trim() === mobileClean);
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
      const res = await apiCall<any>('createCompany', { company: newCompany });
      if (res) {
        this.logResponse('createCompany', res);
        const idVal = res.companyId || res.id || newCompany.id;
        const createdVal = res.createdDate ? new Date(res.createdDate).getTime() : Date.now();
        const updatedVal = res.updatedDate ? new Date(res.updatedDate).getTime() : createdVal;
        return {
          ...res,
          id: idVal,
          createdDate: isNaN(createdVal) ? Date.now() : createdVal,
          updatedVal: isNaN(updatedVal) ? Date.now() : updatedVal
        };
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

    const nameLower = String(company.companyName ?? "").trim().toLowerCase();

    // Check duplicate company names
    const allLocal = await this.getCompanies();
    const duplicate = allLocal.find(c => c.id !== company.id && String(c.companyName ?? "").trim().toLowerCase() === nameLower);
    if (duplicate) {
      const errMsg = `Company name "${company.companyName}" is already taken by another company.`;
      this.logError('updateCompany', errMsg);
      throw new Error(errMsg);
    }

    // Check duplicate mobile numbers
    if (company.mobile && String(company.mobile ?? "").trim()) {
      const mobileClean = String(company.mobile ?? "").trim();
      const duplicateMobile = allLocal.find(c => c.id !== company.id && c.mobile && String(c.mobile ?? "").trim() === mobileClean);
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
      const res = await apiCall<any>('updateCompany', { company: updatedCompany });
      if (res) {
        this.logResponse('updateCompany', res);
        const idVal = res.companyId || res.id || updatedCompany.id;
        const createdVal = res.createdDate ? new Date(res.createdDate).getTime() : Date.now();
        const updatedVal = res.updatedDate ? new Date(res.updatedDate).getTime() : createdVal;
        return {
          ...res,
          id: idVal,
          createdDate: isNaN(createdVal) ? Date.now() : createdVal,
          updatedDate: isNaN(updatedVal) ? Date.now() : updatedVal
        };
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
      const res = await apiCall<any>('deleteCompany', { companyId: id });
      this.logResponse('deleteCompany', res);
      return { id, deleted: true };
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
    const res = await apiCall<any[]>('searchCompany', { query });
    if (Array.isArray(res)) {
      this.logResponse('searchCompany', res);
      return res.map(c => ({
        ...c,
        id: c.companyId || c.id,
        createdDate: new Date(c.createdDate).getTime(),
        updatedDate: c.updatedDate ? new Date(c.updatedDate).getTime() : new Date(c.createdDate).getTime()
      }));
    }
    return [];
  },

  // Save company helper to route upserts appropriately
  async saveCompany(company: Company): Promise<void> {
    this.logRequest('saveCompany', company);
    if (company.id && !company.id.startsWith('COMP-') && company.id.length > 5) {
        await this.updateCompany(company);
    } else {
        await this.createCompany(company);
    }
  }
};

import { apiCall } from '../apiClient';
import { Customer } from '../types';
import { normalizeCustomer, normalizePrescription, normalizeEyeTest, normalizeInvoice } from '../dataMapping';

const STORAGE_KEY = 'opt_customers';



export const sanitizeCustomer = normalizeCustomer;

export const customerService = {
  // New Endpoint: Create customer
  async createCustomer(customer: Omit<Customer, 'id' | 'createdAt'> & { id?: string; createdAt?: number }): Promise<Customer> {
    if (!customer.id || customer.id.includes('local') || customer.id.includes('temp')) {
      customer.id = 'CUST-' + Date.now() + Math.floor(Math.random() * 1000);
      (customer as any).CustomerID = customer.id;
    }
    try {
      const res = await apiCall<any>('createCustomer', { customer });
      
      if (res && (res.id || res.CustomerID || res.customerid)) {
        const sanitized = sanitizeCustomer(res);
        this.updateLocalCache(sanitized);
        return sanitized;
      }
    } catch (e) {
      console.warn('%c[OFFLINE MODE] createCustomer API failed, falling back to local cache:', 'color: #f59e0b; font-weight: bold;', e);
    }
    
    const localCustomer: Customer = sanitizeCustomer({
      ...customer,
      id: customer.id || `CUST-local-${Date.now()}`,
      createdAt: customer.createdAt || Date.now()
    });
    this.updateLocalCache(localCustomer);
    return localCustomer;
  },

  // New Endpoint: Update customer
  async updateCustomer(customer: Customer): Promise<Customer> {
    try {
      const res = await apiCall<any>('updateCustomer', { customer });
      if (res && (res.id || res.CustomerID || res.customerid)) {
        const sanitized = sanitizeCustomer(res);
        this.updateLocalCache(sanitized);
        return sanitized;
      }
    } catch (e) {
      console.warn('%c[OFFLINE MODE] updateCustomer API failed, falling back to local cache:', 'color: #f59e0b; font-weight: bold;', e);
    }
    const sanitized = sanitizeCustomer(customer);
    this.updateLocalCache(sanitized);
    return sanitized;
  },

  // New Endpoint: Search customer by mobile
  async searchCustomerByMobile(mobile: string): Promise<Customer[]> {
    try {
      const res = await apiCall<any[]>('searchCustomerByMobile', { mobile });
      if (Array.isArray(res)) {
        return res.map(sanitizeCustomer);
      }
    } catch (e) {
      console.warn('searchCustomerByMobile API failed, using local search:', e);
    }
    
    const all = await this.getCustomers();
    return all.filter(c => c.mobile && String(c.mobile).includes(mobile));
  },

  // New Endpoint: Search customer by name
  async searchCustomerByName(name: string): Promise<Customer[]> {
    try {
      const res = await apiCall<any[]>('searchCustomerByName', { name });
      if (Array.isArray(res)) {
        return res.map(sanitizeCustomer);
      }
    } catch (e) {
      console.warn('searchCustomerByName API failed, using local search:', e);
    }
    
    const all = await this.getCustomers();
    const q = String(name ?? "").trim().toLowerCase();
    return all.filter(c => c.name && c.name.toLowerCase().includes(q));
  },

  // New Endpoint: Get customer by id
  async getCustomerById(id: string): Promise<Customer> {
    try {
      const res = await apiCall<any>('getCustomerById', { customerId: id });
      if (res && (res.id || res.CustomerID || res.customerid)) {
        const sanitized = sanitizeCustomer(res);
        this.updateLocalCache(sanitized);
        return sanitized;
      }
    } catch (e) {
      console.warn('getCustomerById API failed, using local cache:', e);
    }
    
    const all = await this.getCustomers();
    const found = all.find(c => c.id === id);
    if (!found) {
      throw new Error(`Customer with ID ${id} not found.`);
    }
    return found;
  },

  // Existing saveCustomer method updated to use new endpoints
  async saveCustomer(customer: Customer): Promise<Customer> {
    console.log("CUSTOMER SAVE START", customer);
    try {
      if (!customer.id || customer.id.includes('local') || customer.id.includes('temp')) {
        return await this.createCustomer(customer);
      } else {
        return await this.updateCustomer(customer);
      }
    } catch (e) {
      console.warn('customerService.saveCustomer api failed, storing locally:', e);
      const localCustomer: Customer = sanitizeCustomer({
        ...customer,
        id: customer.id || `CUST-local-${Date.now()}`,
        createdAt: customer.createdAt || Date.now()
      });
      this.updateLocalCache(localCustomer);
      return localCustomer;
    }
  },

  // Existing getCustomers method
  async getCustomers(): Promise<Customer[]> {
    try {
      const data = await apiCall<any[]>('getCustomers');
      if (Array.isArray(data)) {
        const sanitizedList = data.map(sanitizeCustomer);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedList));
        }
        return sanitizedList;
      }
    } catch (e) {
      console.warn('customerService.getCustomers api failed, using local cache:', e);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored).map(sanitizeCustomer) : [];
    }
    return [];
  },

  // Existing searchCustomers method
  async searchCustomers(query: string): Promise<Customer[]> {
    const all = await this.getCustomers();
    const q = String(query ?? "").trim().toLowerCase();
    if (!q) return all;
    return all.filter(c => 
      c.name.toLowerCase().includes(q) || 
      (c.mobile && String(c.mobile).includes(q)) || 
      (c.id && c.id.toLowerCase().includes(q))
    );
  },

  // Helper method to keep cache updated
  updateLocalCache(customer: Customer) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      const list: Customer[] = stored ? JSON.parse(stored).map(sanitizeCustomer) : [];
      const sanitized = sanitizeCustomer(customer);
      const idx = list.findIndex(c => c.id === sanitized.id);
      if (idx >= 0) {
        list[idx] = sanitized;
      } else {
        list.push(sanitized);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  },

  // Existing loadCustomerHistory method
  async loadCustomerHistory(customerId: string): Promise<{
    customer: Customer | null;
    prescriptions: any[];
    eyeTests: any[];
    invoices: any[];
    payments: any[];
  }> {
    
    // Function to safely merge
    const mergeData = (remote: any[], local: any[], idKey = 'id') => {
       const merged = [...remote];
       local.forEach(lItem => {
         if (!merged.find(rItem => (rItem.id === lItem.id) || (rItem.PrescriptionID === lItem.id) || (rItem.EyeTestID === lItem.id))) {
           merged.push(lItem);
         }
       });
       return merged;
    };

    try {
      const res = await apiCall<any>('loadCustomerHistory', { customerId });
      if (res && res.customer) {
        let localEyeTests: any[] = [];
        if (typeof window !== 'undefined') {
           try {
             const stored = localStorage.getItem('opt_eyetests');
             if (stored) {
               localEyeTests = JSON.parse(stored).filter((e: any) => e.customerId === customerId);
             }
           } catch(e) {}
        }
        
        let localPrescriptions: any[] = [];
        const customers = await this.getCustomers();
        const localCust = customers.find(c => c.id === customerId);
        if (localCust && localCust.prescriptions) {
           localPrescriptions = localCust.prescriptions;
        }
        
        const backendEyeTests = Array.isArray(res.eyeTests) ? res.eyeTests.map(normalizeEyeTest) : [];
        const backendPrescriptions = Array.isArray(res.prescriptions) ? res.prescriptions.map(normalizePrescription) : [];
        
        let localInvoices: any[] = [];
        if (typeof window !== 'undefined') {
          const storedInv = localStorage.getItem('opt_invoices');
          localInvoices = storedInv ? JSON.parse(storedInv).filter((i: any) => i.customerId === customerId) : [];
        }
        const backendInvoices = Array.isArray(res.invoices) ? res.invoices.map(normalizeInvoice) : [];

        return {
          customer: sanitizeCustomer(res.customer),
          prescriptions: mergeData(backendPrescriptions, localPrescriptions).sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0)),
          eyeTests: mergeData(backendEyeTests, localEyeTests).sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0)),
          invoices: mergeData(backendInvoices, localInvoices),
          payments: Array.isArray(res.payments) ? res.payments : [],
        };
      }
    } catch (e) {
      console.warn('loadCustomerHistory API failed, resolving via parallel fallbacks:', e);
    }

    // Fallback: load customer from local memory or sheets
    const customers = await this.getCustomers();
    const customer = customers.find(c => c.id === customerId) || null;

    // Fallback: load prescriptions
    let prescriptions: any[] = [];
    try {
      const res = await apiCall<any>('getPrescriptionsByCustomer', { customerId });
      const data = res?.data || res;
      if (Array.isArray(data)) {
        prescriptions = data;
      }
    } catch (e) {
      console.warn('loadCustomerHistory fallback: getPrescriptionsByCustomer failed:', e);
    }
    if (prescriptions.length === 0) {
      prescriptions = customer?.prescriptions || [];
    }

    // Fallback: load eye tests
    let eyeTests: any[] = [];
    try {
      const res = await apiCall<any[]>('loadEyeTests', { customerId });
      if (Array.isArray(res)) {
        eyeTests = res;
      }
    } catch (e) {
      console.warn('loadCustomerHistory fallback: loadEyeTests failed:', e);
    }
    if (eyeTests.length === 0 && typeof window !== 'undefined') {
      try {
        const storedEt = localStorage.getItem('opt_eyetests');
        const localEt = storedEt ? JSON.parse(storedEt) : [];
        eyeTests = localEt.filter((et: any) => et.customerId === customerId);
      } catch (err) {
        console.error('Error loading local eye tests:', err);
      }
    }
    
    // Map prescriptions to eye tests if no explicit eye test records exist
    if (eyeTests.length === 0 && prescriptions.length > 0) {
      eyeTests = prescriptions
        .filter((p: any) => p.eyeTestDetails || p.Remarks || p.DoctorName)
        .map((p: any) => {
          if (p.PrescriptionID) {
            // It's a PascalCase prescription
            return {
              id: `et-p-${p.PrescriptionID}`,
              customerId: customerId,
              eyeTestDate: p.ExamDate || new Date(Number(p.CreatedDate || Date.now())).toISOString().split('T')[0],
              optometristName: p.DoctorName || 'Optometrist',
              sphOd: p.OD_Distance_SPH || '',
              cylOd: p.OD_Distance_CYL || '',
              axisOd: p.OD_Distance_AXIS || '',
              sphOs: p.OS_Distance_SPH || '',
              cylOs: p.OS_Distance_CYL || '',
              axisOs: p.OS_Distance_AXIS || '',
              addPower: p.AddPower || '',
              pdDistance: p.PD_Distance || '',
              pdNear: p.PD_Near || '',
              remarks: p.Remarks || '',
              lensRecommendation: p.Advice || '',
              createdAt: Number(p.CreatedDate || Date.now())
            };
          } else {
            // It's a Standard format prescription
            return {
              id: `et-p-${p.id}`,
              customerId: customerId,
              eyeTestDate: p.eyeTestDate || new Date(Number(p.createdAt || Date.now())).toISOString().split('T')[0],
              optometristName: p.optometristName || 'Optometrist',
              sphOd: p.sphOd || '',
              cylOd: p.cylOd || '',
              axisOd: p.axisOd || '',
              sphOs: p.sphOs || '',
              cylOs: p.cylOs || '',
              axisOs: p.axisOs || '',
              addPower: p.addPower || '',
              pdDistance: p.pdDistance || '',
              pdNear: p.pdNear || '',
              remarks: p.remarks || '',
              lensRecommendation: p.advice || '',
              createdAt: Number(p.createdAt || Date.now())
            };
          }
        });
    }

    // Fallback: load invoices
    let localInvoices: any[] = [];
    if (typeof window !== 'undefined') {
      const storedInv = localStorage.getItem('opt_invoices');
      localInvoices = storedInv ? JSON.parse(storedInv) : [];
    }
    const customerInvoices = localInvoices.filter((inv: any) => inv.customerId === customerId);

    // Fallback: load payments
    const payments = customerInvoices.map((inv: any) => ({
      id: `pay-${inv.id}`,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      amount: inv.advanceAmount,
      date: inv.createdAt,
      mode: inv.paymentMode,
      detail: inv.paymentDetail,
    })).filter((p: any) => p.amount > 0);

    return {
      customer,
      prescriptions,
      eyeTests: eyeTests.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
      invoices: customerInvoices,
      payments,
    };
  }
};

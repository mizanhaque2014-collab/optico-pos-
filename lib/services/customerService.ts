import { apiCall } from '../apiClient';
import { Customer } from '../types';

const STORAGE_KEY = 'opt_customers';

export const customerService = {
  // New Endpoint: Create customer
  async createCustomer(customer: Omit<Customer, 'id' | 'createdAt'> & { id?: string; createdAt?: number }): Promise<Customer> {
    try {
      const res = await apiCall<Customer>('createCustomer', { customer });
      
      if (res && res.id) {
        this.updateLocalCache(res);
        return res;
      }
    } catch (e) {
      console.warn('%c[OFFLINE MODE] createCustomer API failed, falling back to local cache:', 'color: #f59e0b; font-weight: bold;', e);
    }
    
    const localCustomer: Customer = {
      ...customer,
      id: customer.id || `CUST-local-${Date.now()}`,
      createdAt: customer.createdAt || Date.now()
    };
    this.updateLocalCache(localCustomer);
    return localCustomer;
  },

  // New Endpoint: Update customer
  async updateCustomer(customer: Customer): Promise<Customer> {
    try {
      const res = await apiCall<Customer>('updateCustomer', { customer });
      if (res && res.id) {
        this.updateLocalCache(res);
        return res;
      }
    } catch (e) {
      console.warn('%c[OFFLINE MODE] updateCustomer API failed, falling back to local cache:', 'color: #f59e0b; font-weight: bold;', e);
    }
    this.updateLocalCache(customer);
    return customer;
  },

  // New Endpoint: Search customer by mobile
  async searchCustomerByMobile(mobile: string): Promise<Customer[]> {
    try {
      const res = await apiCall<Customer[]>('searchCustomerByMobile', { mobile });
      if (Array.isArray(res)) {
        return res;
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
      const res = await apiCall<Customer[]>('searchCustomerByName', { name });
      if (Array.isArray(res)) {
        return res;
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
      const res = await apiCall<Customer>('getCustomerById', { customerId: id });
      if (res && res.id) {
        this.updateLocalCache(res);
        return res;
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
  async saveCustomer(customer: Customer): Promise<void> {
    console.log("CUSTOMER SAVE START", customer);
    try {
      const customers = await this.getCustomers();
      const exists = customers.some(c => c.id === customer.id);
      if (exists) {
        await this.updateCustomer(customer);
      } else {
        await this.createCustomer(customer);
      }
    } catch (e) {
      console.warn('customerService.saveCustomer api failed, storing locally:', e);
      this.updateLocalCache(customer);
    }
  },

  // Existing getCustomers method
  async getCustomers(): Promise<Customer[]> {
    try {
      const data = await apiCall<Customer[]>('getCustomers');
      if (Array.isArray(data)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        return data;
      }
    } catch (e) {
      console.warn('customerService.getCustomers api failed, using local cache:', e);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
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
      const list: Customer[] = stored ? JSON.parse(stored) : [];
      const idx = list.findIndex(c => c.id === customer.id);
      if (idx >= 0) {
        list[idx] = customer;
      } else {
        list.push(customer);
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
    try {
      const res = await apiCall<any>('loadCustomerHistory', { customerId });
      if (res && res.customer) {
        return res;
      }
    } catch (e) {
      console.warn('loadCustomerHistory API failed, resolving from customer store:', e);
    }

    // Fallback to customer prescriptions
    const customers = await this.getCustomers();
    const customer = customers.find(c => c.id === customerId) || null;
    
    let localInvoices: any[] = [];
    if (typeof window !== 'undefined') {
      const storedInv = localStorage.getItem('opt_invoices');
      localInvoices = storedInv ? JSON.parse(storedInv) : [];
    }
    const customerInvoices = localInvoices.filter((inv: any) => inv.customerId === customerId);

    const payments = customerInvoices.map((inv: any) => ({
      id: `pay-${inv.id}`,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      amount: inv.advanceAmount,
      date: inv.createdAt,
      mode: inv.paymentMode,
      detail: inv.paymentDetail,
    })).filter((p: any) => p.amount > 0);

    const prescriptions = customer?.prescriptions || [];
    const eyeTests = prescriptions
      .filter((p: any) => p.eyeTestDetails)
      .map((p: any) => ({
        prescriptionId: p.id,
        ...p.eyeTestDetails,
        date: p.createdAt,
      }));

    return {
      customer,
      prescriptions,
      eyeTests,
      invoices: customerInvoices,
      payments,
    };
  }
};

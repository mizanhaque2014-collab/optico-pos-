import { apiCall } from '../apiClient';
import { Customer } from '../types';

const STORAGE_KEY = 'opt_customers';

export function sanitizeCustomer(c: any): Customer {
  if (!c) {
    return {
      id: '',
      name: '',
      mobile: '',
      dob: '',
      address: '',
      status: 'Buyer',
      prescriptions: [],
      createdAt: Date.now()
    };
  }

  // 1. Resolve ID
  const id = String(c.id || c.CustomerID || c.customerid || c.customerId || '');

  // 2. Resolve Name
  const name = String(c.name || c.CustomerName || c.customername || c.customerName || '');

  // 3. Resolve Mobile
  const mobile = String(c.mobile || c.Mobile || c.mobilenumber || c.mobileNumber || '');

  // 4. Resolve DOB
  const dob = c.dob || c.DOB || c.dateofbirth || c.dateOfBirth || '';

  // 5. Resolve Address
  const address = c.address || c.Address || '';

  // 6. Resolve Status
  const status = c.status || c.Status || 'Buyer';

  // 7. Resolve Prescriptions
  let prescriptions: any[] = [];
  const rawPrescriptions = c.prescriptions || c.Prescriptions;
  if (rawPrescriptions) {
    if (typeof rawPrescriptions === 'string') {
      try {
        prescriptions = JSON.parse(rawPrescriptions);
      } catch (e) {
        console.warn("Failed to parse prescriptions JSON in customer:", id, e);
      }
    } else if (Array.isArray(rawPrescriptions)) {
      prescriptions = rawPrescriptions;
    }
  }

  // 8. Resolve CreatedAt
  let createdAt = Date.now();
  const rawCreatedAt = c.createdAt || c.createdat || c.createdate || c.CreatedDate || c.createddate || c.createdAtDate;
  if (rawCreatedAt) {
    const parsedDate = new Date(rawCreatedAt);
    if (!isNaN(parsedDate.getTime())) {
      createdAt = parsedDate.getTime();
    } else if (typeof rawCreatedAt === 'number' && rawCreatedAt > 0) {
      createdAt = rawCreatedAt;
    }
  }

  return {
    id,
    name,
    mobile,
    dob,
    address,
    status,
    prescriptions,
    createdAt
  };
}

export const customerService = {
  // New Endpoint: Create customer
  async createCustomer(customer: Omit<Customer, 'id' | 'createdAt'> & { id?: string; createdAt?: number }): Promise<Customer> {
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
      if (!customer.id) {
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
    try {
      const res = await apiCall<any>('loadCustomerHistory', { customerId });
      if (res && res.customer) {
        return {
          customer: sanitizeCustomer(res.customer),
          prescriptions: Array.isArray(res.prescriptions) ? res.prescriptions : [],
          eyeTests: Array.isArray(res.eyeTests) ? res.eyeTests : [],
          invoices: Array.isArray(res.invoices) ? res.invoices : [],
          payments: Array.isArray(res.payments) ? res.payments : [],
        };
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

import { apiCall } from '../apiClient';
import { Customer } from '../types';

const STORAGE_KEY = 'opt_customers';

export const customerService = {
  async saveCustomer(customer: Customer): Promise<void> {
    try {
      await apiCall('saveCustomer', { customer });
    } catch (e) {
      console.warn('customerService.saveCustomer api failed, storing locally:', e);
    }
    
    // Save to LocalStorage cache
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

  async searchCustomers(query: string): Promise<Customer[]> {
    const all = await this.getCustomers();
    const q = query.toLowerCase().trim();
    if (!q) return all;
    return all.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.mobile.includes(q) || 
      c.id.toLowerCase().includes(q)
    );
  },

  async updateCustomer(customer: Customer): Promise<void> {
    return this.saveCustomer(customer);
  },

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

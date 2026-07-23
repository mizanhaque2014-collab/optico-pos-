import { apiCall } from '../apiClient';
import { Invoice } from '../types';

export const invoiceService = {
  async createInvoice(invoice: Invoice): Promise<Invoice> {
    const data = await apiCall<Invoice>('createInvoice', { invoice });
    return data || invoice;
  },

  async updateInvoice(invoice: Invoice): Promise<Invoice> {
    const data = await apiCall<Invoice>('updateInvoice', { invoice });
    return data || invoice;
  },

  async deleteInvoice(invoiceId: string): Promise<void> {
    await apiCall('deleteInvoice', { invoiceId });
  },

  async getInvoices(): Promise<Invoice[]> {
    try {
      const data = await apiCall<Invoice[]>('getInvoices');
      if (Array.isArray(data)) {
        return data;
      }
    } catch (e) {
      console.warn('getInvoices API failed, loading from local cache:', e);
    }
    return [];
  },

  async getInvoiceById(invoiceId: string): Promise<Invoice | null> {
    try {
      const data = await apiCall<Invoice>('getInvoiceById', { invoiceId });
      return data;
    } catch (e) {
      console.warn('getInvoiceById API failed:', e);
      const list = await this.getInvoices();
      return list.find(i => i.id === invoiceId) || null;
    }
  },

  async getInvoicesByCustomer(customerId: string): Promise<Invoice[]> {
    try {
      const data = await apiCall<Invoice[]>('getInvoicesByCustomer', { customerId });
      if (Array.isArray(data)) {
        return data;
      }
    } catch (e) {
      console.warn('getInvoicesByCustomer API failed:', e);
    }
    const list = await this.getInvoices();
    return list.filter(i => i.customerId === customerId);
  },

  async searchInvoices(keyword: string): Promise<Invoice[]> {
    try {
      const data = await apiCall<Invoice[]>('searchInvoices', { keyword });
      if (Array.isArray(data)) {
        return data;
      }
    } catch (e) {
      console.warn('searchInvoices API failed:', e);
    }
    const list = await this.getInvoices();
    const q = String(keyword ?? "").trim().toLowerCase();
    if (!q) return list;
    return list.filter(inv => 
      inv.invoiceNumber.toLowerCase().includes(q) || 
      inv.id.toLowerCase().includes(q) ||
      inv.customerId.toLowerCase().includes(q)
    );
  },

  // Retain legacy methods for backward compatibility if needed by other parts of the app
  async saveInvoice(invoice: Invoice): Promise<void> {
    try {
      await this.updateInvoice(invoice);
    } catch {
      await this.createInvoice(invoice);
    }
  },

  async saveDirectSaleInvoice(invoice: Invoice): Promise<void> {
    invoice.type = 'Direct Sale';
    return this.saveInvoice(invoice);
  },

  async saveSalesOrderInvoice(invoice: Invoice): Promise<void> {
    invoice.type = 'Sales Order';
    return this.saveInvoice(invoice);
  },

  async saveDeliveryCollectionInvoice(invoice: Invoice): Promise<void> {
    return this.saveInvoice(invoice);
  },

  async searchInvoice(query: string): Promise<Invoice[]> {
    return this.searchInvoices(query);
  }
};

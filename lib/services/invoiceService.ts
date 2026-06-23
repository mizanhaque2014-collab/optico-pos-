import { apiCall } from '../apiClient';
import { Invoice } from '../types';

const STORAGE_KEY = 'opt_invoices';

export const invoiceService = {
  async saveInvoice(invoice: Invoice): Promise<void> {
    try {
      await apiCall('saveInvoice', { invoice });
    } catch (e) {
      console.warn('saveInvoice API failed, fall back to local:', e);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      const invoices: Invoice[] = stored ? JSON.parse(stored) : [];
      const idx = invoices.findIndex(i => i.id === invoice.id);
      if (idx >= 0) {
        invoices[idx] = invoice;
      } else {
        invoices.push(invoice);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
    }
  },

  async getInvoices(): Promise<Invoice[]> {
    try {
      const data = await apiCall<Invoice[]>('getInvoices');
      if (Array.isArray(data)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        return data;
      }
    } catch (e) {
      console.warn('getInvoices API failed, loading from local cache:', e);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
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
    const list = await this.getInvoices();
    const q = query.toLowerCase().trim();
    if (!q) return list;
    return list.filter(inv => 
      inv.invoiceNumber.toLowerCase().includes(q) || 
      inv.id.toLowerCase().includes(q) ||
      inv.customerId.toLowerCase().includes(q)
    );
  }
};

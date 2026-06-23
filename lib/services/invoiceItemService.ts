import { apiCall } from '../apiClient';
import { OrderItem } from '../types';
import { invoiceService } from './invoiceService';

export const invoiceItemService = {
  async saveInvoiceItems(invoiceId: string, items: OrderItem[]): Promise<void> {
    try {
      await apiCall('saveInvoiceItem', { invoiceId, items });
    } catch (e) {
      console.warn('saveInvoiceItem API failed:', e);
    }
  },

  async loadInvoiceItems(invoiceId: string): Promise<OrderItem[]> {
    try {
      const items = await apiCall<OrderItem[]>('loadInvoiceItems', { invoiceId });
      if (Array.isArray(items)) return items;
    } catch (e) {
      console.warn('loadInvoiceItems API failed, scanning local invoices:', e);
    }

    const invoices = await invoiceService.getInvoices();
    const matched = invoices.find(inv => inv.id === invoiceId);
    return matched ? matched.items : [];
  }
};

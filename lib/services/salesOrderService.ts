import { apiCall } from '../apiClient';
import { Invoice } from '../types';
import { invoiceService } from './invoiceService';

export const salesOrderService = {
  async getInvoicesByStatus(statusList: string[]): Promise<Invoice[]> {
    const invoices = await invoiceService.getInvoices();
    return invoices.filter(inv => inv.type === 'Sales Order' && statusList.includes(inv.status));
  },

  async getPendingOrders(): Promise<Invoice[]> {
    return this.getInvoicesByStatus(['Ordered', 'In Lab']);
  },

  async getReadyOrders(): Promise<Invoice[]> {
    return this.getInvoicesByStatus(['Ready']);
  },

  async getDeliveredOrders(): Promise<Invoice[]> {
    return this.getInvoicesByStatus(['Delivered']);
  },

  async updateOrderStatus(invoiceId: string, status: any): Promise<void> {
    const invoices = await invoiceService.getInvoices();
    const matched = invoices.find(inv => inv.id === invoiceId);
    if (matched) {
      matched.status = status;
      matched.updatedAt = Date.now();
      try {
        await apiCall('saveSalesOrder', { salesOrder: matched });
      } catch (e) {
        console.warn('saveSalesOrder API failed:', e);
      }
      await invoiceService.saveInvoice(matched);
    }
  }
};

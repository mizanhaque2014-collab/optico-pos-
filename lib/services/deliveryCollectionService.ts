import { apiCall } from '../apiClient';
import { Invoice, PaymentMode, PaymentDetail } from '../types';
import { invoiceService } from './invoiceService';

export const deliveryCollectionService = {
  async collectBalance(
    invoiceId: string, 
    collectedAmount: number, 
    mode: PaymentMode, 
    detail: PaymentDetail
  ): Promise<void> {
    const invoices = await invoiceService.getInvoices();
    const idx = invoices.findIndex(inv => inv.id === invoiceId);
    if (idx >= 0) {
      const inv = invoices[idx];
      inv.balanceAmount = Math.max(0, inv.balanceAmount - collectedAmount);
      inv.finalCollectionPaymentMode = mode;
      inv.finalCollectionPaymentDetail = detail;
      
      if (inv.balanceAmount === 0) {
        inv.status = 'Delivered';
      }
      inv.updatedAt = Date.now();
      
      try {
        await apiCall('saveDeliveryCollection', { 
          invoiceId, 
          collectedAmount, 
          paymentMode: mode, 
          paymentDetail: detail,
          invoice: inv 
        });
      } catch (e) {
        console.warn('saveDeliveryCollection API failed:', e);
      }
      
      await invoiceService.saveInvoice(inv);
    }
  },

  async settleInvoice(invoiceId: string): Promise<void> {
    const invoices = await invoiceService.getInvoices();
    const idx = invoices.findIndex(inv => inv.id === invoiceId);
    if (idx >= 0) {
      const inv = invoices[idx];
      inv.balanceAmount = 0;
      inv.status = 'Delivered';
      inv.updatedAt = Date.now();
      
      try {
        await apiCall('saveDeliveryCollection', { invoiceId, actionType: 'settle', invoice: inv });
      } catch (e) {
        console.warn('saveDeliveryCollection settle API failed:', e);
      }
      
      await invoiceService.saveInvoice(inv);
    }
  }
};

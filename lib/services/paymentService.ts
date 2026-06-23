import { apiCall } from '../apiClient';
import { invoiceService } from './invoiceService';

const STORAGE_KEY = 'opt_payments_history';

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  amount: number;
  date: number;
  mode: string;
  remarks?: string;
}

export const paymentService = {
  async savePayment(payment: PaymentRecord): Promise<void> {
    try {
      await apiCall('savePayment', { payment });
    } catch (e) {
      console.warn('savePayment API failed:', e);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      const list: PaymentRecord[] = stored ? JSON.parse(stored) : [];
      const idx = list.findIndex(p => p.id === payment.id);
      if (idx >= 0) {
        list[idx] = payment;
      } else {
        list.push(payment);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  },

  async loadPaymentHistory(customerId?: string): Promise<PaymentRecord[]> {
    try {
      const data = await apiCall<PaymentRecord[]>('getPayments', { customerId });
      if (Array.isArray(data)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        return data;
      }
    } catch (e) {
      console.warn('getPayments API failed, executing fallback:', e);
    }

    let localHistory: PaymentRecord[] = [];
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        localHistory = JSON.parse(stored);
      } else {
        const invoices = await invoiceService.getInvoices();
        invoices.forEach(inv => {
          if (inv.advanceAmount > 0) {
            localHistory.push({
              id: `pay-adv-${inv.id}`,
              invoiceId: inv.id,
              invoiceNumber: inv.invoiceNumber,
              customerId: inv.customerId,
              amount: inv.advanceAmount,
              date: inv.createdAt,
              mode: inv.paymentMode,
              remarks: 'Advance Payment'
            });
          }
          if (inv.grandTotal - inv.advanceAmount - inv.balanceAmount > 0) {
            localHistory.push({
              id: `pay-coll-${inv.id}`,
              invoiceId: inv.id,
              invoiceNumber: inv.invoiceNumber,
              customerId: inv.customerId,
              amount: inv.grandTotal - inv.advanceAmount - inv.balanceAmount,
              date: inv.updatedAt || inv.createdAt,
              mode: inv.finalCollectionPaymentMode || inv.paymentMode,
              remarks: 'Balance Collection'
            });
          }
        });
      }
    }

    if (customerId) {
      return localHistory.filter(p => p.customerId === customerId);
    }
    return localHistory;
  },

  async getBalanceTracking(customerId: string): Promise<{
    totalBilled: number;
    totalPaid: number;
    totalOutstanding: number;
  }> {
    const invoices = await invoiceService.getInvoices();
    const customerInvoices = invoices.filter(inv => inv.customerId === customerId);
    
    let totalBilled = 0;
    let totalOutstanding = 0;
    
    customerInvoices.forEach(inv => {
      totalBilled += inv.grandTotal;
      totalOutstanding += inv.balanceAmount;
    });

    const totalPaid = totalBilled - totalOutstanding;

    return {
      totalBilled,
      totalPaid,
      totalOutstanding
    };
  }
};

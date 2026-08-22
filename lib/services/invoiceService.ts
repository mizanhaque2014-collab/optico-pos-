import { apiCall } from '../apiClient';
import { Invoice } from '../types';
import { normalizeInvoice } from '../dataMapping';

function mapInvoiceToPascalCase(invoice: any) {
  return {
    InvoiceID: invoice.id || invoice.InvoiceID,
    InvoiceNumber: invoice.invoiceNumber || invoice.InvoiceNumber,
    InvoiceType: invoice.type || invoice.InvoiceType,
    CustomerID: invoice.customerId || invoice.CustomerID,
    CompanyID: invoice.companyId || invoice.CompanyID || 'COMP-default',
    BranchID: invoice.branchId || invoice.BranchID || 'BR-default',
    PrescriptionID: invoice.prescriptionId || invoice.PrescriptionID || '',
    InvoiceDate: invoice.invoiceDate || (invoice.createdAt ? new Date(invoice.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
    GrandTotal: invoice.grandTotal ?? invoice.GrandTotal ?? 0,
    Discount: invoice.totalDiscount ?? invoice.discount ?? invoice.Discount ?? 0,
    FinalAmount: invoice.grandTotal ?? invoice.finalAmount ?? invoice.FinalAmount ?? 0,
    Advance: invoice.advanceAmount ?? invoice.advance ?? invoice.Advance ?? 0,
    Balance: invoice.balanceAmount ?? invoice.balance ?? invoice.Balance ?? 0,
    PaymentMode: invoice.paymentMode || invoice.PaymentMode || 'Cash',
    CashAmount: invoice.paymentDetail?.cash ?? invoice.cashAmount ?? invoice.CashAmount ?? 0,
    CardAmount: invoice.paymentDetail?.card ?? invoice.cardAmount ?? invoice.CardAmount ?? 0,
    UPIAmount: invoice.paymentDetail?.upi ?? invoice.upiAmount ?? invoice.UPIAmount ?? 0,
    CardReference: invoice.paymentDetail?.cardLast4 ?? invoice.cardReference ?? invoice.CardReference ?? '',
    UPIReference: invoice.paymentDetail?.upiTransactionId ?? invoice.upiReference ?? invoice.UPIReference ?? '',
    BillingRemarks: invoice.paymentDetail?.remarks ?? invoice.billingRemarks ?? invoice.BillingRemarks ?? '',
    Status: invoice.status || invoice.Status || 'Delivered',
    Items: typeof invoice.items === 'string' ? invoice.items : JSON.stringify(invoice.items || invoice.Items || [])
  };
}

export const invoiceService = {
  async createInvoice(invoice: Invoice): Promise<Invoice> {
    const pascal = mapInvoiceToPascalCase(invoice);
    const payload = { ...invoice, ...pascal };

    if (typeof window !== 'undefined' && invoice.items && invoice.items.length > 0) {
       try {const cached = JSON.parse(window.localStorage.getItem('opt_invoices_items') || '{}');
         cached[invoice.id || pascal.InvoiceID] = invoice.items;
         window.localStorage.setItem('opt_invoices_items', JSON.stringify(cached));
       } catch (e) {}
    }

    try {const data = await apiCall<any>('saveInvoice', payload);
      return data && data.id ? normalizeInvoice(data) : invoice;
    } catch (e: any) {
      if (e.message && e.message.includes('Unsupported action')) {
        if (invoice.type === 'Sales Order' || (invoice.type as any) === 'SalesOrder') {
           const fallbackData = await apiCall<any>('saveSalesOrder', { salesOrder: payload });
           return fallbackData && fallbackData.id ? normalizeInvoice(fallbackData) : invoice;
        } else {
           const fallbackData = await apiCall<any>('saveDeliveryCollection', { invoice: payload });
           return fallbackData && fallbackData.id ? normalizeInvoice(fallbackData) : invoice;
        }
      }
      throw e;
    }
  },

  async updateInvoice(invoice: Invoice): Promise<Invoice> {
    const pascal = mapInvoiceToPascalCase(invoice);
    const payload = { ...invoice, ...pascal };

    if (typeof window !== 'undefined' && invoice.items && invoice.items.length > 0) {
       try {const cached = JSON.parse(window.localStorage.getItem('opt_invoices_items') || '{}');
         cached[invoice.id || pascal.InvoiceID] = invoice.items;
         window.localStorage.setItem('opt_invoices_items', JSON.stringify(cached));
       } catch (e) {}
    }

    try {const data = await apiCall<any>('saveInvoice', payload);
      return data && data.id ? normalizeInvoice(data) : invoice;
    } catch (e: any) {
      if (e.message && e.message.includes('Unsupported action')) {
        if (invoice.type === 'Sales Order' || (invoice.type as any) === 'SalesOrder') {
           const fallbackData = await apiCall<any>('saveSalesOrder', { salesOrder: payload });
           return fallbackData && fallbackData.id ? normalizeInvoice(fallbackData) : invoice;
        } else {
           const fallbackData = await apiCall<any>('saveDeliveryCollection', { invoice: payload });
           return fallbackData && fallbackData.id ? normalizeInvoice(fallbackData) : invoice;
        }
      }
      throw e;
    }
  },

  async deleteInvoice(invoiceId: string): Promise<void> {
    await apiCall('deleteInvoice', { invoiceId });
  },

  
  
  async saveDSRRecord(dsrData: any): Promise<boolean> {
    try {
      await apiCall<any>('saveDSRRecord', { dsr: dsrData });
      return true;
    } catch (e) {
      console.warn('saveDSRRecord failed:', e);
      return false;
    }
  },

  async getDailySalesReport(companyId: string, branchId: string, startDate: string, endDate: string): Promise<Invoice[]> {
    try {
      const data = await apiCall<any>('getDailySalesReport', { companyId, branchId, startDate, endDate });
      if (data && Array.isArray(data.invoices)) {
        return data.invoices.map(normalizeInvoice);
      }
    } catch (e) {
      console.warn('getDailySalesReport API failed:', e);
    }
    // Fallback: If API fails, fetch all invoices and filter locally to prevent breaking
    const list = await this.getInvoices();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return list.filter(inv => {
      // Company check
      if (companyId && companyId !== 'ALL') {
        const invComp = (inv as any).companyId || (inv as any).CompanyID;
        if (invComp && invComp !== companyId) return false;
      }
      // Branch check
      if (branchId && branchId !== 'ALL') {
        const invBranch = (inv as any).branchId || (inv as any).BranchID;
        if (invBranch && invBranch !== branchId) return false;
      }
      // Date check
      const t = new Date(inv.createdAt).getTime();
      return t >= start && t <= end;
    });
  },

  async getInvoices(): Promise<Invoice[]> {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('opt_invoices');
      if (stored) {
         try {
           const parsed = JSON.parse(stored);
           // Background update
           apiCall<any[]>('getInvoices').then(data => {
             if (Array.isArray(data)) {
               localStorage.setItem('opt_invoices', JSON.stringify(data.map(mapInvoiceToPascalCase)));
             }
           }).catch(() => {});
           return parsed.map(normalizeInvoice);
         } catch(e) {}
      }
    }
    try {
      const data = await apiCall<any[]>('getInvoices');
      if (Array.isArray(data)) {
        if (typeof window !== 'undefined') localStorage.setItem('opt_invoices', JSON.stringify(data.map(mapInvoiceToPascalCase)));
        return data.map(normalizeInvoice);
      }
    } catch (e) {
      console.warn('getInvoices API failed, loading from local cache:', e);
    }
    return [];
  },

  async getInvoiceById(invoiceId: string): Promise<Invoice | null> {
    try {const data = await apiCall<any>('getInvoiceById', { invoiceId });
      return data ? normalizeInvoice(data) : null;
    } catch (e) {
      console.warn('getInvoiceById API failed:', e);
      const list = await this.getInvoices();
      return list.find(i => i.id === invoiceId) || null;
    }
  },

  async getInvoicesByCustomer(customerId: string): Promise<Invoice[]> {
    try {const data = await apiCall<any[]>('getInvoicesByCustomer', { customerId });
      if (Array.isArray(data) && data.length > 0) {
        return data.map(normalizeInvoice);
      }
    } catch (e) {
      console.warn('getInvoicesByCustomer API failed:', e);
    }
    // Fallback: If empty or unsupported, fetch all and filter locally
    const list = await this.getInvoices();
    return list.filter(i => i.customerId === customerId || (i as any).CustomerId === customerId || (i as any).CustomerID === customerId);
  },

  async searchInvoices(keyword: string): Promise<Invoice[]> {
    try {const data = await apiCall<any[]>('searchInvoices', { keyword });
      if (Array.isArray(data)) {
        return data.map(normalizeInvoice);
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
    try {await this.updateInvoice(invoice);
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

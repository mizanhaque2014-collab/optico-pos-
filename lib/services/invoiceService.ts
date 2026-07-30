import { apiCall } from '../apiClient';
import { Invoice } from '../types';


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

function mapPascalCaseToInvoice(data: any): Invoice {
  // Try parsing items
  let parsedItems = [];
  try {
    parsedItems = typeof data.Items === 'string' ? JSON.parse(data.Items) : data.Items;
  } catch (e) {
    parsedItems = [];
  }
  
  return {
    id: data.InvoiceID || data.id,
    invoiceNumber: data.InvoiceNumber || data.InvoiceID || data.invoiceNumber,
    type: data.InvoiceType || data.type,
    customerId: data.CustomerID || data.customerId,
    prescriptionId: data.PrescriptionID || data.prescriptionId,
    items: parsedItems || data.items || [],
    subTotal: data.SubTotal || data.subTotal || 0,
    totalDiscount: data.Discount || data.totalDiscount || 0,
    grandTotal: data.GrandTotal || data.grandTotal || 0,
    paymentMode: data.PaymentMode || data.paymentMode || 'Cash',
    paymentDetail: {
      cash: data.CashAmount || 0,
      upi: data.UPIAmount || 0,
      card: data.CardAmount || 0,
      total: (data.CashAmount || 0) + (data.UPIAmount || 0) + (data.CardAmount || 0),
      cardLast4: data.CardReference || '',
      upiTransactionId: data.UPIReference || '',
      remarks: data.BillingRemarks || ''
    },
    advanceAmount: data.Advance || data.advanceAmount || 0,
    balanceAmount: data.Balance || data.balanceAmount || 0,
    status: data.Status || data.status || 'Delivered',
    createdAt: data.CreatedDate ? new Date(data.CreatedDate).getTime() : Date.now(),
    updatedAt: data.UpdatedAt ? new Date(data.UpdatedAt).getTime() : Date.now(),
  } as Invoice;
}

export const invoiceService = {
  async createInvoice(invoice: Invoice): Promise<Invoice> {
    const pascalInvoice = mapInvoiceToPascalCase(invoice);
    const data = await apiCall<any>('saveInvoice', pascalInvoice);
    return data && data.InvoiceID ? { ...invoice, id: data.InvoiceID, invoiceNumber: data.InvoiceNumber || data.InvoiceID } : invoice;
  },

  async updateInvoice(invoice: Invoice): Promise<Invoice> {
    const pascalInvoice = mapInvoiceToPascalCase(invoice);
    const data = await apiCall<any>('saveInvoice', pascalInvoice);
    return data && data.InvoiceID ? { ...invoice, id: data.InvoiceID, invoiceNumber: data.InvoiceNumber || data.InvoiceID } : invoice;
  },

  async deleteInvoice(invoiceId: string): Promise<void> {
    await apiCall('deleteInvoice', { invoiceId });
  },

  async getInvoices(): Promise<Invoice[]> {
    try {
      const data = await apiCall<any[]>('getInvoices');
      if (Array.isArray(data)) {
        return data.map(mapPascalCaseToInvoice);
      }
    } catch (e) {
      console.warn('getInvoices API failed, loading from local cache:', e);
    }
    return [];
  },

  async getInvoiceById(invoiceId: string): Promise<Invoice | null> {
    try {
      const data = await apiCall<any>('getInvoiceById', { invoiceId });
      return data ? mapPascalCaseToInvoice(data) : null;
    } catch (e) {
      console.warn('getInvoiceById API failed:', e);
      const list = await this.getInvoices();
      return list.find(i => i.id === invoiceId) || null;
    }
  },

  async getInvoicesByCustomer(customerId: string): Promise<Invoice[]> {
    try {
      const data = await apiCall<any[]>('getInvoicesByCustomer', { customerId });
      if (Array.isArray(data)) {
        return data.map(mapPascalCaseToInvoice);
      }
    } catch (e) {
      console.warn('getInvoicesByCustomer API failed:', e);
    }
    const list = await this.getInvoices();
    return list.filter(i => i.customerId === customerId);
  },

  async searchInvoices(keyword: string): Promise<Invoice[]> {
    try {
      const data = await apiCall<any[]>('searchInvoices', { keyword });
      if (Array.isArray(data)) {
        return data.map(mapPascalCaseToInvoice);
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

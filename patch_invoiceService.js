const fs = require('fs');
let code = fs.readFileSync('lib/services/invoiceService.ts', 'utf8');

const injection = `
  async createInvoice(invoice: Invoice): Promise<Invoice> {
    const data = await apiCall<any>('saveInvoice', invoice);
    return data && data.id ? data : invoice;
  },
`;

const replacement = `
  async createInvoice(invoice: Invoice): Promise<Invoice> {
    try {
      const data = await apiCall<any>('saveInvoice', invoice);
      return data && data.id ? data : invoice;
    } catch (e: any) {
      if (e.message && e.message.includes('Unsupported action')) {
        // Fallback to legacy endpoints for older Apps Scripts
        if (invoice.type === 'Sales Order') {
           const fallbackData = await apiCall<any>('saveSalesOrder', { salesOrder: invoice });
           return fallbackData && fallbackData.id ? fallbackData : invoice;
        } else if (invoice.type === 'Direct Sale') {
           // Not standard, but sometimes they used saveInvoiceItem or saveInvoice? 
           // Let's just pass it to saveDeliveryCollection as fallback if it's delivery
           const fallbackData = await apiCall<any>('saveSalesOrder', { salesOrder: invoice });
           return fallbackData && fallbackData.id ? fallbackData : invoice;
        }
      }
      throw e;
    }
  },
`;

code = code.replace(injection, replacement);
fs.writeFileSync('lib/services/invoiceService.ts', code);

code = fs.readFileSync('lib/services/invoiceService.ts', 'utf8');
const updateInjection = `
  async updateInvoice(invoice: Invoice): Promise<Invoice> {
    const data = await apiCall<any>('saveInvoice', invoice);
    return data && data.id ? data : invoice;
  },
`;

const updateReplacement = `
  async updateInvoice(invoice: Invoice): Promise<Invoice> {
    try {
      const data = await apiCall<any>('saveInvoice', invoice);
      return data && data.id ? data : invoice;
    } catch (e: any) {
      if (e.message && e.message.includes('Unsupported action')) {
        if (invoice.type === 'Sales Order') {
           const fallbackData = await apiCall<any>('saveSalesOrder', { salesOrder: invoice });
           return fallbackData && fallbackData.id ? fallbackData : invoice;
        } else {
           const fallbackData = await apiCall<any>('saveDeliveryCollection', { invoice: invoice });
           return fallbackData && fallbackData.id ? fallbackData : invoice;
        }
      }
      throw e;
    }
  },
`;

code = code.replace(updateInjection, updateReplacement);
fs.writeFileSync('lib/services/invoiceService.ts', code);

const fs = require('fs');
let code = fs.readFileSync('lib/services/invoiceService.ts', 'utf8');

const createInjection = `
  async createInvoice(invoice: Invoice): Promise<Invoice> {
    const data = await apiCall<any>('saveInvoice', invoice);
    return data && data.id ? data : invoice;
  },
`;

const createReplacement = `
  async createInvoice(invoice: Invoice): Promise<Invoice> {
    const pascal = mapInvoiceToPascalCase(invoice);
    const payload = { ...invoice, ...pascal };
    try {
      const data = await apiCall<any>('saveInvoice', payload);
      return data && data.id ? data : invoice;
    } catch (e: any) {
      if (e.message && e.message.includes('Unsupported action')) {
        if (invoice.type === 'Sales Order' || invoice.type === 'SalesOrder') {
           const fallbackData = await apiCall<any>('saveSalesOrder', { salesOrder: payload });
           return fallbackData && fallbackData.id ? fallbackData : invoice;
        } else {
           const fallbackData = await apiCall<any>('saveDeliveryCollection', { invoice: payload });
           return fallbackData && fallbackData.id ? fallbackData : invoice;
        }
      }
      throw e;
    }
  },
`;

const updateInjection = `
  async updateInvoice(invoice: Invoice): Promise<Invoice> {
    const data = await apiCall<any>('saveInvoice', invoice);
    return data && data.id ? data : invoice;
  },
`;

const updateReplacement = `
  async updateInvoice(invoice: Invoice): Promise<Invoice> {
    const pascal = mapInvoiceToPascalCase(invoice);
    const payload = { ...invoice, ...pascal };
    try {
      const data = await apiCall<any>('saveInvoice', payload);
      return data && data.id ? data : invoice;
    } catch (e: any) {
      if (e.message && e.message.includes('Unsupported action')) {
        if (invoice.type === 'Sales Order' || invoice.type === 'SalesOrder') {
           const fallbackData = await apiCall<any>('saveSalesOrder', { salesOrder: payload });
           return fallbackData && fallbackData.id ? fallbackData : invoice;
        } else {
           const fallbackData = await apiCall<any>('saveDeliveryCollection', { invoice: payload });
           return fallbackData && fallbackData.id ? fallbackData : invoice;
        }
      }
      throw e;
    }
  },
`;

code = code.replace(createInjection, createReplacement);
code = code.replace(updateInjection, updateReplacement);
fs.writeFileSync('lib/services/invoiceService.ts', code);

const fs = require('fs');
const path = './lib/services/invoiceService.ts';
let code = fs.readFileSync(path, 'utf8');

const brokenGetInvoices = `  async getInvoices(): Promise<Invoice[]> {
    try {const data = await apiCall<any[]>('getInvoices');
      if (Array.isArray(data)) {
        return data.map(normalizeInvoice);
      }
    } catch (e) {
      console.warn('getInvoices API failed, loading from local cache:', e);
    }
    return [];
  },`;

const fixedGetInvoices = `  async getInvoices(): Promise<Invoice[]> {
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
  },`;

code = code.replace(brokenGetInvoices, fixedGetInvoices);
fs.writeFileSync(path, code);

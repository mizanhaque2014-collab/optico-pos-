const fs = require('fs');
let code = fs.readFileSync('lib/services/invoiceService.ts', 'utf8');

const injection = `
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
`;

const replacement = `
  async getInvoicesByCustomer(customerId: string): Promise<Invoice[]> {
    try {
      const data = await apiCall<any[]>('getInvoicesByCustomer', { customerId });
      if (Array.isArray(data) && data.length > 0) {
        return data.map(mapPascalCaseToInvoice);
      }
    } catch (e) {
      console.warn('getInvoicesByCustomer API failed:', e);
    }
    // Fallback: If empty or unsupported, fetch all and filter locally
    const list = await this.getInvoices();
    return list.filter(i => i.customerId === customerId || i.CustomerId === customerId || i.CustomerID === customerId);
  },
`;

if (code.includes(injection)) {
  code = code.replace(injection, replacement);
  fs.writeFileSync('lib/services/invoiceService.ts', code);
  console.log("Success getInvoicesByCustomer fallback");
} else {
  console.log("Injection not found");
}

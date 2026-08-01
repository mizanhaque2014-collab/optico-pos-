const fs = require('fs');
const path = './lib/services/customerService.ts';
let code = fs.readFileSync(path, 'utf8');

const cacheDeclaration = `const STORAGE_KEY = 'opt_customers';

const historyCache = new Map<string, { timestamp: number, data: any }>();
export const clearCustomerHistoryCache = (customerId?: string) => {
  if (customerId) historyCache.delete(customerId);
  else historyCache.clear();
};
`;

code = code.replace("const STORAGE_KEY = 'opt_customers';", cacheDeclaration);

const originalMethodStart = `  async loadCustomerHistory(customerId: string): Promise<{
    customer: Customer | null;
    prescriptions: any[];
    eyeTests: any[];
    invoices: any[];
    payments: any[];
  }> {
    try {`;

const newMethodStart = `  async loadCustomerHistory(customerId: string): Promise<{
    customer: Customer | null;
    prescriptions: any[];
    eyeTests: any[];
    invoices: any[];
    payments: any[];
  }> {
    if (historyCache.has(customerId)) {
      const cached = historyCache.get(customerId);
      if (cached && Date.now() - cached.timestamp < 300000) {
        return cached.data;
      }
    }
    try {`;

code = code.replace(originalMethodStart, newMethodStart);

const originalReturn = `        return {
          customer: sanitizeCustomer(res.customer),
          prescriptions: Array.isArray(res.prescriptions) ? res.prescriptions.map(normalizePrescription) : [],
          eyeTests: Array.isArray(res.eyeTests) ? res.eyeTests.map(normalizeEyeTest) : [],
          invoices: Array.isArray(res.invoices) ? res.invoices.map(normalizeInvoice) : [],
          payments: Array.isArray(res.payments) ? res.payments : [],
        };`;

const newReturn = `        const data = {
          customer: sanitizeCustomer(res.customer),
          prescriptions: Array.isArray(res.prescriptions) ? res.prescriptions.map(normalizePrescription) : [],
          eyeTests: Array.isArray(res.eyeTests) ? res.eyeTests.map(normalizeEyeTest) : [],
          invoices: Array.isArray(res.invoices) ? res.invoices.map(normalizeInvoice) : [],
          payments: Array.isArray(res.payments) ? res.payments : [],
        };
        historyCache.set(customerId, { timestamp: Date.now(), data });
        return data;`;

code = code.replace(originalReturn, newReturn);

const originalFallbackReturn = `    return {
      customer,
      prescriptions,
      eyeTests,
      invoices,
      payments
    };
  }`;

const newFallbackReturn = `    const data = {
      customer,
      prescriptions,
      eyeTests,
      invoices,
      payments
    };
    historyCache.set(customerId, { timestamp: Date.now(), data });
    return data;
  }`;

code = code.replace(originalFallbackReturn, newFallbackReturn);

fs.writeFileSync(path, code);

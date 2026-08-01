const fs = require('fs');

function revert(path) {
  let code = fs.readFileSync(path, 'utf8');
  
  // Revert customerService cache changes
  const newMethodStart = `  async loadCustomerHistory(customerId: string): Promise<{
    customer: Customer | null;
    prescriptions: any[];
    eyeTests: any[];
    invoices: any[];
    payments: any[];
  }> {
    try {
      const res = await apiCall<any>('loadCustomerHistory', { customerId });
      if (res && res.customer) {
        const data = {
          customer: sanitizeCustomer(res.customer),
          prescriptions: Array.isArray(res.prescriptions) ? res.prescriptions.map(normalizePrescription) : [],
          eyeTests: Array.isArray(res.eyeTests) ? res.eyeTests.map(normalizeEyeTest) : [],
          invoices: Array.isArray(res.invoices) ? res.invoices.map(normalizeInvoice) : [],
          payments: Array.isArray(res.payments) ? res.payments : [],
        };
        historyCache.set(customerId, { timestamp: Date.now(), data });
        return data;
      }`;
      
  const originalMethodStart = `  async loadCustomerHistory(customerId: string): Promise<{
    customer: Customer | null;
    prescriptions: any[];
    eyeTests: any[];
    invoices: any[];
    payments: any[];
  }> {
    try {
      const res = await apiCall<any>('loadCustomerHistory', { customerId });
      if (res && res.customer) {
        return {
          customer: sanitizeCustomer(res.customer),
          prescriptions: Array.isArray(res.prescriptions) ? res.prescriptions.map(normalizePrescription) : [],
          eyeTests: Array.isArray(res.eyeTests) ? res.eyeTests.map(normalizeEyeTest) : [],
          invoices: Array.isArray(res.invoices) ? res.invoices.map(normalizeInvoice) : [],
          payments: Array.isArray(res.payments) ? res.payments : [],
        };
      }`;
      
   code = code.replace(newMethodStart, originalMethodStart);
   
   const newFallback = `    const data = {
      customer,
      prescriptions,
      eyeTests: eyeTests.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
      invoices: customerInvoices,
      payments,
    };
  }
};`;

  const oldFallback = `    return {
      customer,
      prescriptions,
      eyeTests: eyeTests.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
      invoices: customerInvoices,
      payments,
    };
  }
};`;
   code = code.replace(newFallback, oldFallback);
   
   // Remove historyCache declaration entirely
   code = code.replace(/const historyCache = new Map.*?;\n/s, '');
   code = code.replace(/export const clearCustomerHistoryCache = .*?\n  else historyCache\.clear\(\);\n};\n/s, '');

   fs.writeFileSync(path, code);
}

revert('./lib/services/customerService.ts');

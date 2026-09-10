const fs = require('fs');

let invoiceService = fs.readFileSync('lib/services/invoiceService.ts', 'utf8');

invoiceService = invoiceService.replace(
  /async getInvoices\(\): Promise<Invoice\[\]> \{/g,
  'async getInvoices(forceFetch: boolean = false): Promise<Invoice[]> {'
);

invoiceService = invoiceService.replace(
  /if \(typeof window !== 'undefined'\) \{/g,
  'if (typeof window !== \'undefined\' && !forceFetch) {'
);

// We need to fix the fallback in the catch block if forceFetch fails
invoiceService = invoiceService.replace(
  /console.warn\('getInvoices API failed, loading from local cache:', e\);\n    \}/g,
  `console.warn('getInvoices API failed, loading from local cache:', e);\n      if (forceFetch && typeof window !== 'undefined') {\n        const stored = localStorage.getItem('opt_invoices');\n        if (stored) return JSON.parse(stored).map(normalizeInvoice);\n      }\n    }`
);

fs.writeFileSync('lib/services/invoiceService.ts', invoiceService);

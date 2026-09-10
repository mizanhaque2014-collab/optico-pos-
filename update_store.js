const fs = require('fs');
let store = fs.readFileSync('lib/store.ts', 'utf8');

const refreshCode = `
  const refreshInvoices = async () => {
    try {
      const data = await invoiceService.getInvoices(true);
      memoryCache.invoices = data;
      notify();
    } catch(e) {}
  };
`;

store = store.replace('  const getInvoices = (): Invoice[] => {', refreshCode + '\n  const getInvoices = (): Invoice[] => {');
store = store.replace('    getInvoices,\n', '    getInvoices,\n    refreshInvoices,\n');

fs.writeFileSync('lib/store.ts', store);

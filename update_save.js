const fs = require('fs');

let code = fs.readFileSync('lib/store.ts', 'utf8');

const newSave = `
  const saveInvoice = async (invoice: Invoice): Promise<void> => {
    await invoiceService.saveInvoice(invoice);
    if (memoryCache.invoices) {
      const idx = memoryCache.invoices.findIndex(i => i.id === invoice.id);
      if (idx !== -1) {
        memoryCache.invoices[idx] = invoice;
      } else {
        memoryCache.invoices.unshift(invoice);
      }
    }
    notify();
    refreshInvoices();
  };
`;

code = code.replace(
  /const saveInvoice = async \(invoice: Invoice\): Promise<void> => \{[\s\S]*?notify\(\);\n  \};/,
  newSave.trim()
);

fs.writeFileSync('lib/store.ts', code);

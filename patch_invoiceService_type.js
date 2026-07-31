const fs = require('fs');
let code = fs.readFileSync('lib/services/invoiceService.ts', 'utf8');

code = code.replace(
  "type: data.InvoiceType || data.type,",
  "type: data.InvoiceType || data.type || data.Type || data.invoiceType,"
);

fs.writeFileSync('lib/services/invoiceService.ts', code);

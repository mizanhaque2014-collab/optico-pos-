const fs = require('fs');
let code = fs.readFileSync('lib/services/invoiceService.ts', 'utf8');

code = code.replace(
  "id: data.InvoiceID || data.id,",
  "id: data.InvoiceID || data.id || data.Id || data.ID,"
);
code = code.replace(
  "customerId: data.CustomerID || data.customerId,",
  "customerId: data.CustomerID || data.customerId || data.CustomerId,"
);
code = code.replace(
  "invoiceNumber: data.InvoiceNumber || data.InvoiceID || data.invoiceNumber,",
  "invoiceNumber: data.InvoiceNumber || data.invoiceNumber || data.InvoiceID || data.id || data.InvoiceNo,"
);

fs.writeFileSync('lib/services/invoiceService.ts', code);

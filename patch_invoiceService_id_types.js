const fs = require('fs');
let code = fs.readFileSync('lib/services/invoiceService.ts', 'utf8');

code = code.replace(
  "i.customerId === customerId || i.CustomerId === customerId || i.CustomerID === customerId",
  "i.customerId === customerId || (i as any).CustomerId === customerId || (i as any).CustomerID === customerId"
);

fs.writeFileSync('lib/services/invoiceService.ts', code);

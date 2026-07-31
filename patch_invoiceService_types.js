const fs = require('fs');
let code = fs.readFileSync('lib/services/invoiceService.ts', 'utf8');

code = code.replace(
  "invoice.type === 'SalesOrder'",
  "(invoice.type as any) === 'SalesOrder'"
);
code = code.replace(
  "invoice.type === 'SalesOrder'",
  "(invoice.type as any) === 'SalesOrder'"
);

fs.writeFileSync('lib/services/invoiceService.ts', code);

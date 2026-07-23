const fs = require('fs');
let code = fs.readFileSync('lib/services/invoiceService.ts', 'utf8');

code = code.replace(/createdAt: data\.CreatedAt \? new Date\(data\.CreatedAt\)\.getTime\(\) : Date\.now\(\)/, "createdAt: data.CreatedDate ? new Date(data.CreatedDate).getTime() : Date.now()");
code = code.replace(/invoiceNumber: data\.InvoiceNumber \|\| data\.invoiceNumber,/, "invoiceNumber: data.InvoiceNumber || data.InvoiceID || data.invoiceNumber,");

fs.writeFileSync('lib/services/invoiceService.ts', code);

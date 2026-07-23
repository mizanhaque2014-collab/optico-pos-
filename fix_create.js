const fs = require('fs');
let code = fs.readFileSync('lib/services/invoiceService.ts', 'utf8');

code = code.replace(/return data && data\.InvoiceID \? mapPascalCaseToInvoice\(data\) : invoice;/, `return data && data.InvoiceID ? { ...invoice, id: data.InvoiceID, invoiceNumber: data.InvoiceNumber || data.InvoiceID } : invoice;`);

code = code.replace(/return data && data\.InvoiceID \? mapPascalCaseToInvoice\(data\) : invoice;/, `return data && data.InvoiceID ? { ...invoice, id: data.InvoiceID, invoiceNumber: data.InvoiceNumber || data.InvoiceID } : invoice;`); // second for updateInvoice

fs.writeFileSync('lib/services/invoiceService.ts', code);

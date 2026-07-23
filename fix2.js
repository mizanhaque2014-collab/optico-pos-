const fs = require('fs');
let code = fs.readFileSync('lib/services/invoiceService.ts', 'utf8');

code = code.replace(/await apiCall<any>\('createInvoice', \{ invoice: pascalInvoice \}\)/g, "await apiCall<any>('createInvoice', pascalInvoice)");
code = code.replace(/await apiCall<any>\('updateInvoice', \{ invoice: pascalInvoice \}\)/g, "await apiCall<any>('updateInvoice', pascalInvoice)");

fs.writeFileSync('lib/services/invoiceService.ts', code);

const fs = require('fs');
const path = './components/OpticalInvoiceA5.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "const invoiceNum = invoice?.invoiceNumber || 'INV-DRAFT';",
  "const invoiceNum = formatInvoiceNumber(invoice?.invoiceNumber) || 'INV-DRAFT';"
);

fs.writeFileSync(path, code);

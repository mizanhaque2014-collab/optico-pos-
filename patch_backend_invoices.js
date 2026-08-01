const fs = require('fs');
const path = './backend/Invoices.gs';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'inv.InvoiceNumber = "INV-" + Date.now();',
  'inv.InvoiceNumber = Math.floor(100000 + Math.random() * 900000).toString();'
);

fs.writeFileSync(path, code);

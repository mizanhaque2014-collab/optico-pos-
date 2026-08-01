const fs = require('fs');
const path = './backend/Invoices.gs';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'inv.InvoiceNumber = Math.floor(100000 + Math.random() * 900000).toString();',
  'inv.InvoiceNumber = "INV-" + Date.now();'
);

fs.writeFileSync(path, code);

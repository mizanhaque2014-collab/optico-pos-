const fs = require('fs');
const path = './components/CustomerProfileView.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/console\.log\("Invoices From Backend getInvoicesByCustomer", invs\);/g, '');

fs.writeFileSync(path, code);

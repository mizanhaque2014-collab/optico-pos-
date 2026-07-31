const fs = require('fs');
let code = fs.readFileSync('components/CustomerProfileView.tsx', 'utf8');

code = code.replace(
  "const directSaleInvoices = invoices.filter(i => i.type === 'Direct Sale');",
  "const directSaleInvoices = invoices.filter(i => i.type === 'Direct Sale' || i.type === 'DirectSale');"
);

code = code.replace(
  "const salesOrders = invoices.filter(i => i.type === 'Sales Order');",
  "const salesOrders = invoices.filter(i => i.type === 'Sales Order' || i.type === 'SalesOrder');"
);

fs.writeFileSync('components/CustomerProfileView.tsx', code);

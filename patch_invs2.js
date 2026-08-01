const fs = require('fs');
const path = './components/CustomerProfileView.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('console.log("Invoices From Backend getInvoicesByCustomer", invs);')) {
   code = code.replace(
      '        console.log("Invoices From Backend loadCustomerHistory", history.invoices);',
      '        console.log("Invoices From Backend getInvoicesByCustomer", invs);\n        console.log("Invoices From Backend loadCustomerHistory", history.invoices);'
   );
   fs.writeFileSync(path, code);
}

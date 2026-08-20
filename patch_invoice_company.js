const fs = require('fs');
let code = fs.readFileSync('components/InvoiceFormView.tsx', 'utf8');

code = code.replace(
  /const newInvoice = \{/,
  `const newInvoice = {\n      companyId: session?.companyID || 'COMP-default',\n      branchId: session?.branchID || 'BR-default',`
);

fs.writeFileSync('components/InvoiceFormView.tsx', code);

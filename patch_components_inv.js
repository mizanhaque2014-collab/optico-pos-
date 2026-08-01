const fs = require('fs');

const files = [
  './components/OpticalInvoiceA5.tsx',
  './components/InvoiceDetailCard.tsx',
  './components/SalesOrderDetailCard.tsx',
  './components/DeliveryCollectionView.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  if (!code.includes('formatInvoiceNumber')) {
    code = code.replace("import { cn }", "import { cn, formatInvoiceNumber }");
    if (!code.includes('formatInvoiceNumber')) {
      code = code.replace("import { shopConfig }", "import { formatInvoiceNumber } from '@/lib/utils';\nimport { shopConfig }");
    }
    if (!code.includes('formatInvoiceNumber')) {
       code = code.replace("import { Customer", "import { formatInvoiceNumber } from '@/lib/utils';\nimport { Customer");
    }
  }

  // OpticalInvoiceA5.tsx and others use invoiceNum or inv.invoiceNumber
  code = code.replace(/const invoiceNum = (invoice\?\.invoiceNumber || 'INV-DRAFT');/g, "const invoiceNum = formatInvoiceNumber($1);");
  code = code.replace(/const invoiceNum = (inv\?\.invoiceNumber || 'INV-DRAFT');/g, "const invoiceNum = formatInvoiceNumber($1);");
  
  // DeliveryCollectionView.tsx
  code = code.replace(/completedInvoice\.invoiceNumber/g, "formatInvoiceNumber(completedInvoice.invoiceNumber)");
  code = code.replace(/completedInvoice\?\.invoiceNumber/g, "formatInvoiceNumber(completedInvoice?.invoiceNumber)");
  code = code.replace(/selectedInvoice\.invoiceNumber/g, "formatInvoiceNumber(selectedInvoice.invoiceNumber)");
  
  // InvoiceDetailCard and SalesOrderDetailCard use inv.invoiceNumber in headers
  code = code.replace(/inv\.invoiceNumber/g, "formatInvoiceNumber(inv.invoiceNumber)");

  fs.writeFileSync(file, code);
}

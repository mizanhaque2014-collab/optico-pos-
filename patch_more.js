const fs = require('fs');

const files = [
  './components/PrescriptionSection.tsx',
  './components/InvoiceFormView.tsx',
  './components/WhatsAppMarketingView.tsx',
  './components/DeliveryCollectionView.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  if (!code.includes('formatInvoiceNumber')) {
    code = code.replace("import { cn }", "import { cn, formatInvoiceNumber }");
    if (!code.includes('formatInvoiceNumber')) {
      code = code.replace("import { Customer", "import { formatInvoiceNumber } from '@/lib/utils';\nimport { Customer");
    }
  }

  code = code.replace(/lastPurchase\.invoiceNumber/g, "formatInvoiceNumber(lastPurchase.invoiceNumber)");
  code = code.replace(/savedInvoice\.invoiceNumber/g, "formatInvoiceNumber(savedInvoice.invoiceNumber)");
  code = code.replace(/inv\.invoiceNumber/g, "formatInvoiceNumber(inv.invoiceNumber)");
  code = code.replace(/order\.invoiceNumber/g, "formatInvoiceNumber(order.invoiceNumber)");

  fs.writeFileSync(file, code);
}

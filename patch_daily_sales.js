const fs = require('fs');
const path = './components/DailySalesReportView.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('formatInvoiceNumber')) {
  code = code.replace("import { Customer", "import { formatInvoiceNumber } from '@/lib/utils';\nimport { Customer");
}

code = code.replace(/inv\.invoiceNumber/g, "formatInvoiceNumber(inv.invoiceNumber)");
code = code.replace(/item\.invoiceNumber/g, "formatInvoiceNumber(item.invoiceNumber)");
code = code.replace(/lastInvoice\?\.invoiceNumber/g, "formatInvoiceNumber(lastInvoice?.invoiceNumber)");
code = code.replace(/lastInvoice \? lastInvoice\.invoiceNumber/g, "lastInvoice ? formatInvoiceNumber(lastInvoice.invoiceNumber)");

fs.writeFileSync(path, code);

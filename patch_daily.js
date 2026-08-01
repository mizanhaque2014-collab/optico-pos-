const fs = require('fs');
const path = './components/DailySalesReportView.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes("import { formatInvoiceNumber }")) {
  code = code.replace("import { Invoice, Customer", "import { formatInvoiceNumber } from '@/lib/utils';\nimport { Invoice, Customer");
  fs.writeFileSync(path, code);
}

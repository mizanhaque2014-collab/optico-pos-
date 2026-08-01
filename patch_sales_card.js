const fs = require('fs');
const path = './components/SalesOrderDetailCard.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes("import { formatInvoiceNumber } from '@/lib/utils';")) {
  code = code.replace("import { generateWhatsAppInvoiceText }", "import { formatInvoiceNumber } from '@/lib/utils';\nimport { generateWhatsAppInvoiceText }");
  fs.writeFileSync(path, code);
}

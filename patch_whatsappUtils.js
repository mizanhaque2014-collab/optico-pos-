const fs = require('fs');
const path = './lib/whatsappUtils.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('formatInvoiceNumber')) {
  code = code.replace("import { shopConfig } from '@/lib/shopConfig';", "import { shopConfig } from '@/lib/shopConfig';\nimport { formatInvoiceNumber } from '@/lib/utils';");
}

code = code.replace('`*INVOICE:* ${inv.invoiceNumber}\\n', '`*INVOICE:* ${formatInvoiceNumber(inv.invoiceNumber)}\\n');

fs.writeFileSync(path, code);

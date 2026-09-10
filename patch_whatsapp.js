const fs = require('fs');

// Patch whatsappUtils.ts
let waCode = fs.readFileSync('lib/whatsappUtils.ts', 'utf8');
waCode = waCode.replace(
  'export function generateWhatsAppInvoiceText(\n  inv: Invoice, \n  customer: any, \n  prescription: Prescription | null | undefined, \n  parsedItems: OrderItem[]) {',
  'export function generateWhatsAppInvoiceText(\n  inv: Invoice, \n  customer: any, \n  prescription: Prescription | null | undefined, \n  parsedItems: OrderItem[],\n  customShopName?: string) {'
);
waCode = waCode.replace(
  /\*Shop:\* \$\{shopConfig\.shopName\}/,
  '*Shop:* ${customShopName || shopConfig.shopName}'
);
fs.writeFileSync('lib/whatsappUtils.ts', waCode);


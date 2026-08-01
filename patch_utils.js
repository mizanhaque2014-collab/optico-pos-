const fs = require('fs');
const path = './lib/utils.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('formatInvoiceNumber')) {
  code += `\nexport function formatInvoiceNumber(invoiceNum?: string): string {
  if (!invoiceNum) return '';
  // If it is a long UUID
  if (invoiceNum.length > 20 && invoiceNum.includes('-')) {
    return invoiceNum.split('-')[0].substring(0, 6).toUpperCase();
  }
  // If it's INV-timestamp
  if (invoiceNum.startsWith('INV-') && invoiceNum.length > 10) {
    return invoiceNum.substring(4, 10);
  }
  return invoiceNum.substring(0, 6).toUpperCase();
}\n`;
  fs.writeFileSync(path, code);
}

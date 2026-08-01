const fs = require('fs');
const path = './lib/utils.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/export function formatInvoiceNumber[\s\S]*?\n\}\n/m, `export function formatInvoiceNumber(invoiceNum?: string): string {
  if (!invoiceNum) return '';
  if (invoiceNum.length > 20 && invoiceNum.includes('-')) {
    return invoiceNum.split('-')[0].substring(0, 6).toUpperCase();
  }
  if (invoiceNum.startsWith('INV-') && invoiceNum.length > 10) {
    return invoiceNum.substring(4, 10);
  }
  if (invoiceNum.length > 6) {
    return invoiceNum.substring(0, 6).toUpperCase();
  }
  return invoiceNum.toUpperCase();
}\n`);
fs.writeFileSync(path, code);

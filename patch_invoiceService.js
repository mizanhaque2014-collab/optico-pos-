const fs = require('fs');
let code = fs.readFileSync('lib/services/invoiceService.ts', 'utf-8');

const target = `    CompanyID: invoice.companyId || invoice.CompanyID || 'COMP-default',
    BranchID: invoice.branchId || invoice.BranchID || 'BR-default',`;

const replacement = `    CompanyID: (!invoice.companyId || String(invoice.companyId).trim() === '') ? (!invoice.CompanyID || String(invoice.CompanyID).trim() === '' ? 'COMP-default' : invoice.CompanyID) : invoice.companyId,
    BranchID: (!invoice.branchId || String(invoice.branchId).trim() === '') ? (!invoice.BranchID || String(invoice.BranchID).trim() === '' ? 'BR-default' : invoice.BranchID) : invoice.branchId,`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('lib/services/invoiceService.ts', code);
  console.log("Patched invoiceService successfully.");
} else {
  console.log("Target not found in invoiceService.ts.");
}

const fs = require('fs');
let code = fs.readFileSync('lib/services/prescriptionService.ts', 'utf-8');

code = code.replace("CompanyID: legacyP.companyId || legacyP.CompanyID || currentCompanyId || 'COMP-default',", "CompanyID: (!legacyP.companyId || String(legacyP.companyId).trim() === '') ? (!legacyP.CompanyID || String(legacyP.CompanyID).trim() === '' ? (currentCompanyId || 'COMP-default') : legacyP.CompanyID) : legacyP.companyId,");
code = code.replace("BranchID: legacyP.branchId || legacyP.BranchID || currentBranchId || 'BR-default',", "BranchID: (!legacyP.branchId || String(legacyP.branchId).trim() === '') ? (!legacyP.BranchID || String(legacyP.BranchID).trim() === '' ? (currentBranchId || 'BR-default') : legacyP.BranchID) : legacyP.branchId,");

fs.writeFileSync('lib/services/prescriptionService.ts', code);
console.log("Patched prescriptionService successfully.");

const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf-8');

const targetCompAssign = `let normalizedCompanyId = matchedUser.CompanyID;
      if (!normalizedCompanyId || String(normalizedCompanyId).trim() === '') {
        normalizedCompanyId = 'COMP-default';
      }`;

const replaceCompAssign = `let normalizedCompanyId = matchedUser.CompanyID;
      if (!normalizedCompanyId || String(normalizedCompanyId).trim() === '' || String(normalizedCompanyId).toLowerCase() === 'comp-default') {
        normalizedCompanyId = 'COMP-default';
      }`;

const targetBranchAssign = `let normalizedBranchId = matchedUser.BranchID;
      if (!normalizedBranchId || String(normalizedBranchId).trim() === '') {
        normalizedBranchId = 'BR-default';
      }`;

const replaceBranchAssign = `let normalizedBranchId = matchedUser.BranchID;
      if (!normalizedBranchId || String(normalizedBranchId).trim() === '' || String(normalizedBranchId).toLowerCase() === 'br-default') {
        normalizedBranchId = 'BR-default';
      }`;

if (code.includes(targetCompAssign)) {
  code = code.replace(targetCompAssign, replaceCompAssign);
}
if (code.includes(targetBranchAssign)) {
  code = code.replace(targetBranchAssign, replaceBranchAssign);
}

fs.writeFileSync('lib/AuthContext.tsx', code);
console.log("Patched normalization successfully.");

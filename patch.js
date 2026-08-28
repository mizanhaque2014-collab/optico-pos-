const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf-8');

const target = `      // Validate Company and Branch existence as per STEP 4 and STEP 5
      if (assignedRole !== 'SUPER_ADMIN' && matchedUser.CompanyID && String(matchedUser.CompanyID).trim() !== '' && matchedUser.CompanyID !== 'ALL') {`;

const replacement = `      let normalizedCompanyId = matchedUser.CompanyID;
      if (!normalizedCompanyId || String(normalizedCompanyId).trim() === '') {
        normalizedCompanyId = 'COMP-default';
      }

      let normalizedBranchId = matchedUser.BranchID;
      if (!normalizedBranchId || String(normalizedBranchId).trim() === '') {
        normalizedBranchId = 'BR-default';
      }

      matchedUser.CompanyID = normalizedCompanyId;
      matchedUser.BranchID = normalizedBranchId;

      // Validate Company and Branch existence as per STEP 4 and STEP 5
      if (assignedRole !== 'SUPER_ADMIN' && matchedUser.CompanyID && String(matchedUser.CompanyID).trim() !== '' && matchedUser.CompanyID !== 'ALL') {`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('lib/AuthContext.tsx', code);
  console.log("Patched successfully.");
} else {
  console.log("Target not found.");
}

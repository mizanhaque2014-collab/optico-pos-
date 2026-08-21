const fs = require('fs');
let code = fs.readFileSync('components/CompanyReportsView.tsx', 'utf8');

code = code.replace(
  /branchService\.getBranchesV2\(\)\.then\(all => \{/,
  `branchService.getBranchesV2().then(all => {
         console.log("[COMPANY REPORTS] Authenticated CompanyID:", session.companyID);
         console.log("[COMPANY REPORTS] Branch API Response:", all);
         console.log("[COMPANY REPORTS] Total Branches:", all.length);`
);

code = code.replace(
  /setBranches\(uniqueBranches\);/,
  `setBranches(uniqueBranches);
         console.log("[COMPANY REPORTS] Company Branches:", uniqueBranches.length);`
);

code = code.replace(
  /setSelectedBranchId\(session\?\.branchID \|\| 'ALL'\);/,
  `setSelectedBranchId(session?.branchID || 'ALL');
    console.log("[COMPANY REPORTS] Selected BranchID:", session?.branchID || 'ALL');`
);

fs.writeFileSync('components/CompanyReportsView.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('public/backend-bundle.gs', 'utf8');

if (!code.includes('function filterByAuth')) {
  const filterFunc = `
function filterByAuth(records, auth) {
  if (!auth) return records; // No auth info provided, return as is (or return [] if strictly enforcing)
  
  if (auth.role === 'SUPER_ADMIN') return records;
  
  return records.filter(function(r) {
    var recComp = r.CompanyID || r.companyID || r.companyId;
    var recBranch = r.BranchID || r.branchID || r.branchId;
    
    // If record doesn't have company/branch fields, assume global (e.g. settings)
    if (recComp === undefined && recBranch === undefined) return true;
    
    // Check Company
    if (recComp !== undefined && String(recComp).trim() !== '' && String(recComp) !== String(auth.companyID)) return false;
    
    // Check Branch (COMPANY_ADMIN can see all branches in their company IF they select ALL, otherwise they see the specific branch)
    if (auth.branchID !== 'ALL' && recBranch !== undefined && String(recBranch).trim() !== '' && String(recBranch) !== String(auth.branchID)) {
       // Wait, some records (like companies, users, customers) might not be branch-specific or belong to multiple.
       // Usually, branch-specific data has BranchID.
       if (recBranch && String(recBranch) !== String(auth.branchID)) return false;
    }
    
    return true;
  });
}
`;

  code = code.replace(/function getAllRecords\(sheetName\) \{/, filterFunc + '\nfunction getAllRecords(sheetName) {');
  
  code = code.replace(
    /return values.map\(function\(row\) \{ return rowToObject\(row, headers\); \}\);/,
    `var records = values.map(function(row) { return rowToObject(row, headers); });\n  return (typeof payload !== 'undefined' && payload.__auth) ? filterByAuth(records, payload.__auth) : records;`
  );

  fs.writeFileSync('public/backend-bundle.gs', code);
  fs.writeFileSync('Code.gs', code);
  fs.writeFileSync('Code.js', code);
}

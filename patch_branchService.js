const fs = require('fs');
let code = fs.readFileSync('lib/services/branchService.ts', 'utf-8');

const target = `      if (Array.isArray(data)) {
        this.logResponse('getBranches', data);
        return data.map(b => {
          const idVal = b.BranchID || b.branchId || b.id || b.ID || '';
          const compIdVal = b.CompanyID || b.companyId || '';
          const nameVal = b.BranchName || b.branchName || '';
          const mobileVal = b.Mobile || b.mobile || '';
          const statusVal = b.Status || b.status || 'Active';
          const addrVal = b.Address || b.address || '';
          
          const dateVal = (b.CreatedDate || b.createdDate) ? new Date(b.CreatedDate || b.createdDate).getTime() : Date.now();
          return {`;

const replace = `      if (Array.isArray(data)) {
        this.logResponse('getBranches', data);
        return data
          .filter(b => (b.BranchID || b.branchId || b.id || b.ID))
          .map(b => {
          const idVal = b.BranchID || b.branchId || b.id || b.ID || '';
          const compIdVal = b.CompanyID || b.companyId || '';
          const nameVal = b.BranchName || b.branchName || '';
          const mobileVal = b.Mobile || b.mobile || '';
          const statusVal = b.Status || b.status || 'Active';
          const addrVal = b.Address || b.address || b.Location || b.location || '';
          
          const dateVal = (b.CreatedDate || b.createdDate) ? new Date(b.CreatedDate || b.createdDate).getTime() : Date.now();
          return {`;

if (code.includes(target)) {
  code = code.replace(target, replace);
  fs.writeFileSync('lib/services/branchService.ts', code);
  console.log("Patched branchService successfully.");
} else {
  console.log("Target not found.");
}

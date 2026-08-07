const fs = require('fs');
let code = fs.readFileSync('lib/dataMapping.ts', 'utf8');

code = `export function normalizeCompany(c: any): any {
  if (!c) return {};
  const idVal = String(c.CompanyID || c.companyId || c.id || c.ID || '');
  const companyNameVal = String(c.CompanyName || c.companyName || '');
  const statusVal = String(c.Status || c.status || 'Active');
  const createdVal = (c.CreatedDate || c.createdDate) ? new Date(c.CreatedDate || c.createdDate).getTime() : Date.now();
  const updatedVal = (c.UpdatedDate || c.updatedDate) ? new Date(c.UpdatedDate || c.updatedDate).getTime() : createdVal;
  return {
    ...c,
    id: idVal,
    companyId: idVal,
    CompanyID: idVal,
    companyName: companyNameVal,
    CompanyName: companyNameVal,
    status: statusVal,
    Status: statusVal,
    createdDate: isNaN(createdVal) ? Date.now() : createdVal,
    updatedDate: isNaN(updatedVal) ? Date.now() : updatedVal,
  };
}

` + code;

fs.writeFileSync('lib/dataMapping.ts', code);

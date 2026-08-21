const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Patch reactiveCustomers
  code = code.replace(
    /const custCompanyId = \(c as any\)\.companyId \|\| \(c as any\)\.CompanyID \|\| '';\n\s*if \(session\?\.role !== 'SUPER_ADMIN' && custCompanyId && custCompanyId !== session\?\.companyID\) return false;/g,
    "const custCompanyId = String((c as any).companyId || (c as any).CompanyID || '').trim();\n      const sessCompId = String(session?.companyID || '').trim();\n      if (session?.role !== 'SUPER_ADMIN' && sessCompId && sessCompId !== 'ALL' && custCompanyId !== sessCompId) return false;"
  );
  
  // Patch reactiveStock
  code = code.replace(
    /const stockCompanyId = \(s as any\)\.companyId \|\| \(s as any\)\.CompanyID \|\| '';\n\s*if \(session\?\.role !== 'SUPER_ADMIN' && stockCompanyId && stockCompanyId !== session\?\.companyID\) return false;/g,
    "const stockCompanyId = String((s as any).companyId || (s as any).CompanyID || '').trim();\n      const sessCompId = String(session?.companyID || '').trim();\n      if (session?.role !== 'SUPER_ADMIN' && sessCompId && sessCompId !== 'ALL' && stockCompanyId !== sessCompId) return false;"
  );
  
  // Patch filteredInvoicesRaw
  code = code.replace(
    /const invCompanyId = \(inv as any\)\.companyId \|\| \(inv as any\)\.CompanyID \|\| '';\n\s*if \(session\?\.role !== 'SUPER_ADMIN' && invCompanyId && invCompanyId !== session\?\.companyID\) return false;/g,
    "const invCompanyId = String((inv as any).companyId || (inv as any).CompanyID || '').trim();\n      const sessCompId = String(session?.companyID || '').trim();\n      if (session?.role !== 'SUPER_ADMIN' && sessCompId && sessCompId !== 'ALL' && invCompanyId !== sessCompId) return false;"
  );

  fs.writeFileSync(file, code);
}

patchFile('components/CompanyReportsView.tsx');


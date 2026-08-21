const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  code = code.replace(
    /String\(b\.CompanyID \|\| b\.companyId \|\| ''\)\.trim\(\) === String\(session\?\.companyID \|\| ''\)\.trim\(\)/g,
    "(!String(session?.companyID || '').trim() || String(session?.companyID || '').trim() === 'ALL' || String(b.CompanyID || b.companyId || '').trim() === String(session?.companyID || '').trim())"
  );

  code = code.replace(
    /if \(session\?\.role !== 'SUPER_ADMIN' && custCompanyId && custCompanyId !== session\?\.companyID\) return false;/g,
    "const sessCompId = String(session?.companyID || '').trim();\n      if (session?.role !== 'SUPER_ADMIN' && sessCompId && sessCompId !== 'ALL' && custCompanyId !== sessCompId) return false;"
  );

  code = code.replace(
    /if \(session\?\.role !== 'SUPER_ADMIN' && stockCompanyId && stockCompanyId !== session\?\.companyID\) return false;/g,
    "const sessCompId = String(session?.companyID || '').trim();\n      if (session?.role !== 'SUPER_ADMIN' && sessCompId && sessCompId !== 'ALL' && stockCompanyId !== sessCompId) return false;"
  );

  code = code.replace(
    /if \(session\?\.role !== 'SUPER_ADMIN' && invCompanyId && invCompanyId !== session\?\.companyID\) return false;/g,
    "const sessCompId = String(session?.companyID || '').trim();\n      if (session?.role !== 'SUPER_ADMIN' && sessCompId && sessCompId !== 'ALL' && invCompanyId !== sessCompId) return false;"
  );
  
  fs.writeFileSync(file, code);
}

patchFile('components/CompanyReportsView.tsx');



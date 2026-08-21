const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /String\(b\.CompanyID \|\| b\.companyId \|\| ''\)\.trim\(\) === String\(session\?\.companyID \|\| ''\)\.trim\(\)/g,
    "(!String(session?.companyID || '').trim() || String(session?.companyID || '').trim() === 'ALL' || String(b.CompanyID || b.companyId || '').trim() === String(session?.companyID || '').trim())"
  );
  code = code.replace(
    /String\(b\.CompanyID \|\| b\.companyId \|\| ''\)\.trim\(\) === String\(session\.companyID \|\| ''\)\.trim\(\)/g,
    "(!String(session.companyID || '').trim() || String(session.companyID || '').trim() === 'ALL' || String(b.CompanyID || b.companyId || '').trim() === String(session.companyID || '').trim())"
  );
  fs.writeFileSync(file, code);
}

patchFile('components/CompanyReportsView.tsx');
patchFile('components/StockInventoryView.tsx');


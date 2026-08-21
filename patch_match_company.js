const fs = require('fs');

function patchFile(file, regex, replacement) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(regex, replacement);
  fs.writeFileSync(file, code);
}

patchFile(
  'components/WhatsAppMarketingView.tsx',
  /const matchCompany = session\?\.role === 'SUPER_ADMIN' \|\| cComp === session\?\.companyID;/g,
  "const sessCompId = String(session?.companyID || '').trim();\n         const matchCompany = session?.role === 'SUPER_ADMIN' || !sessCompId || sessCompId === 'ALL' || cComp === sessCompId;"
);

patchFile(
  'components/DailySalesReportView.tsx',
  /const matchCompany = session\?\.role === 'SUPER_ADMIN' \|\| invCompanyId === session\?\.companyID;/g,
  "const sessCompId = String(session?.companyID || '').trim();\n         const matchCompany = session?.role === 'SUPER_ADMIN' || !sessCompId || sessCompId === 'ALL' || invCompanyId === sessCompId;"
);

patchFile(
  'components/CompanyReportsView.tsx',
  /const custCompanyId = \(c as any\)\.companyId \|\| \(c as any\)\.CompanyID \|\| '';\n\s*if \(custCompanyId !== session\.companyID\) return false;/g,
  "const custCompanyId = String((c as any).companyId || (c as any).CompanyID || '').trim();\n      const sessCompId = String(session.companyID || '').trim();\n      if (sessCompId && sessCompId !== 'ALL' && custCompanyId !== sessCompId) return false;"
);

patchFile(
  'components/CompanyReportsView.tsx',
  /const stockCompanyId = \(s as any\)\.companyId \|\| \(s as any\)\.CompanyID \|\| '';\n\s*if \(stockCompanyId !== session\.companyID\) return false;/g,
  "const stockCompanyId = String((s as any).companyId || (s as any).CompanyID || '').trim();\n      const sessCompId = String(session.companyID || '').trim();\n      if (sessCompId && sessCompId !== 'ALL' && stockCompanyId !== sessCompId) return false;"
);

patchFile(
  'components/CompanyReportsView.tsx',
  /const invCompanyId = \(inv as any\)\.companyId \|\| \(inv as any\)\.CompanyID \|\| '';\n\s*if \(invCompanyId !== session\.companyID\) return false;/g,
  "const invCompanyId = String((inv as any).companyId || (inv as any).CompanyID || '').trim();\n      const sessCompId = String(session.companyID || '').trim();\n      if (sessCompId && sessCompId !== 'ALL' && invCompanyId !== sessCompId) return false;"
);


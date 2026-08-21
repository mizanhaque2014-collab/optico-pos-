const fs = require('fs');
let code = fs.readFileSync('components/StockInventoryView.tsx', 'utf8');

code = code.replace(
  /\(!String\(session\?\.companyID \|\| ''\)\.trim\(\) \|\| String\(session\?\.companyID \|\| ''\)\.trim\(\) === 'ALL' \|\| String\(b\.CompanyID \|\| b\.companyId \|\| ''\)\.trim\(\) === String\(session\?\.companyID \|\| ''\)\.trim\(\)\)/g,
  "(!String(session?.companyID || '').trim() || String(session?.companyID || '').trim() === 'ALL' || String(b.CompanyID || b.companyId || '').trim() === String(session?.companyID || '').trim())"
);

fs.writeFileSync('components/StockInventoryView.tsx', code);

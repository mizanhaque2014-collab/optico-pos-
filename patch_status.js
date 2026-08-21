const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/String\(b\.Status\)\.toUpperCase\(\) === 'ACTIVE'/g, "String(b.Status || b.status || 'Active').trim().toUpperCase() === 'ACTIVE'");
  fs.writeFileSync(file, code);
}

patchFile('components/CompanyReportsView.tsx');
patchFile('components/StockInventoryView.tsx');


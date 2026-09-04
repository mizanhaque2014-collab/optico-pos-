const fs = require('fs');
let code = fs.readFileSync('lib/dataMapping.ts', 'utf-8');

code = code.replace(
  `createdAt: resolveDate(inv.CreatedDate || inv.createdAt || inv.CreatedAt),`,
  `createdAt: resolveDate(inv.CreatedDate || inv.InvoiceDate || inv.createdAt || inv.CreatedAt),`
);

fs.writeFileSync('lib/dataMapping.ts', code);
console.log("Patched dataMapping.ts Date successfully.");

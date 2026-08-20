const fs = require('fs');
let code = fs.readFileSync('components/StockInventoryView.tsx', 'utf8');

code = code.replace(
  /const companyBranches = branches\.filter\(/,
  'const companyBranches: any[] = branches.filter('
);

fs.writeFileSync('components/StockInventoryView.tsx', code);

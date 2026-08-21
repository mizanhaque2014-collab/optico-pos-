const fs = require('fs');
let code = fs.readFileSync('components/StockInventoryView.tsx', 'utf8');

code = code.replace(/item\.branchId/g, '(item as any).branchId');
code = code.replace(/item\.BranchID/g, '(item as any).BranchID');

code = code.replace(/i\.branchId/g, '(i as any).branchId');
code = code.replace(/i\.BranchID/g, '(i as any).BranchID');

fs.writeFileSync('components/StockInventoryView.tsx', code);

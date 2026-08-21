const fs = require('fs');
let code = fs.readFileSync('components/StockInventoryView.tsx', 'utf8');

code = code.replace(/branch: selectedBranch,/g, 'branch: selectedBranchName,');
code = code.replace(/fromBranch: selectedBranch,/g, 'fromBranch: selectedBranchName,');
code = code.replace(/if \(selectedBranch === transferToBranch\)/g, 'if (selectedBranchName === transferToBranch)');
code = code.replace(/s\.branch === selectedBranch/g, 's.branch === selectedBranchName');
code = code.replace(/b !== selectedBranch/g, 'b !== selectedBranchName');

fs.writeFileSync('components/StockInventoryView.tsx', code);

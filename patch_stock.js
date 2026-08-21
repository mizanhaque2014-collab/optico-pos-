const fs = require('fs');
let code = fs.readFileSync('components/StockInventoryView.tsx', 'utf8');

// Update selectedBranch logic
code = code.replace(
  /const selectedBranch = session\?\.branchName \|\| 'Default Branch';/,
  `const selectedBranchId = session?.branchID || 'ALL';
  const selectedBranchName = session?.branchName || 'All Branches';`
);

// Update ALL occurrences of `selectedBranch` appropriately.
code = code.replace(/!selectedBranch \|\| item\.branch === selectedBranch/g, `selectedBranchId === 'ALL' || item.branchId === selectedBranchId || item.BranchID === selectedBranchId || item.branch === selectedBranchName`);

code = code.replace(/!selectedBranch \|\| i\.branch === selectedBranch/g, `selectedBranchId === 'ALL' || i.branchId === selectedBranchId || i.BranchID === selectedBranchId || i.branch === selectedBranchName`);

// For "No matching stock found at {selectedBranch}."
code = code.replace(/\{selectedBranch\}/g, `{selectedBranchName}`);

// For "filename = ... selectedBranch.replace..."
code = code.replace(/selectedBranch\.replace/g, `selectedBranchName.replace`);

// For transfer/receive branches logic, which used `selectedBranch` as the locked branch.
code = code.replace(/value=\{selectedBranch\}/g, `value={selectedBranchId !== 'ALL' ? selectedBranchName : ''}`);

fs.writeFileSync('components/StockInventoryView.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('components/BranchSelector.tsx', 'utf8');

code = code.replace(
  /const companyBranches = allBranches\.filter\(/,
  'const companyBranches: any[] = allBranches.filter('
);

fs.writeFileSync('components/BranchSelector.tsx', code);

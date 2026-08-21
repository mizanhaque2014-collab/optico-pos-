const fs = require('fs');
let code = fs.readFileSync('components/DailySalesReportView.tsx', 'utf8');

code = code.replace(/const \[selectedBranch, setSelectedBranch\] = useState<string>\('all'\);/, `const selectedBranch = session?.branchName || 'All Active Branches';`);

fs.writeFileSync('components/DailySalesReportView.tsx', code);

const fs = require('fs');

// Patch DSR
let dsr = fs.readFileSync('components/DailySalesReportView.tsx', 'utf8');
dsr = dsr.replace(/const AVAILABLE_BRANCHES = \['all', 'Main Branch', 'City Center Branch', 'Metro Mall Branch'\];/g, '');
dsr = dsr.replace(/const \[selectedBranch, setSelectedBranch\] = useState\('all'\);/g, '');
dsr = dsr.replace(
  /const branchMatch = selectedBranch === 'all' \|\|[\s\S]*?if \(!branchMatch\) return false;/g,
  ''
);
dsr = dsr.replace(
  /<div className="flex items-center gap-2">[\s\S]*?<select[\s\S]*?value=\{selectedBranch\}[\s\S]*?onChange=\{\(e\) => setSelectedBranch\(e\.target\.value\)\}[\s\S]*?<\/select>\n          <\/div>/,
  ''
);
// We might also have an import or mention of 'selectedBranch' in deps array
dsr = dsr.replace(/, selectedBranch/g, '');
fs.writeFileSync('components/DailySalesReportView.tsx', dsr);

// Patch StockInventoryView
let stock = fs.readFileSync('components/StockInventoryView.tsx', 'utf8');
stock = stock.replace(/const \[selectedBranch, setSelectedBranch\] = useState\('All Branches'\);/g, '');
stock = stock.replace(/const branchMatch = selectedBranch === 'All Branches' \|\| item\.branch === selectedBranch;\n      if \(!branchMatch\) return false;/g, '');
stock = stock.replace(
  /<select\n            value=\{selectedBranch\}\n            onChange=\{\(e\) => setSelectedBranch\(e\.target\.value\)\}[\s\S]*?<\/select>/,
  ''
);
stock = stock.replace(/, selectedBranch/g, '');
fs.writeFileSync('components/StockInventoryView.tsx', stock);


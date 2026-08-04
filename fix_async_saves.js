const fs = require('fs');
const path = './components/StockInventoryView.tsx';
let code = fs.readFileSync(path, 'utf8');

// fix handleSaveAdjustment
code = code.replace(/const handleSaveAdjustment = \(e: React\.FormEvent\) => \{/m, 'const handleSaveAdjustment = async (e: React.FormEvent) => {');
code = code.replace(/store\.saveStockAdjustment\(adjustmentRecord\);/m, 'await store.saveStockAdjustment(adjustmentRecord);');

// fix handleSaveTransfer
code = code.replace(/const handleSaveTransfer = \(e: React\.FormEvent\) => \{/m, 'const handleSaveTransfer = async (e: React.FormEvent) => {');
code = code.replace(/store\.saveBranchTransfer\(transferRecord\);/m, 'await store.saveBranchTransfer(transferRecord);');

// fix handleBulkImport
code = code.replace(/const handleBulkImport = \(\) => \{/m, 'const handleBulkImport = async () => {');
code = code.replace(/store\.saveStockItemsBulk\(importedItems\);/m, 'await store.saveStockItemsBulk(importedItems);');

fs.writeFileSync(path, code);
console.log("Success");

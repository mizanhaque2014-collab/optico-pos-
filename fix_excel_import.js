const fs = require('fs');
const path = './components/StockInventoryView.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/const handleExcelImport = \(\) => \{/m, 'const handleExcelImport = async () => {');

fs.writeFileSync(path, code);
console.log("Success");

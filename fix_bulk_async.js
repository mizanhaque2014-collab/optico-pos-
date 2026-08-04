const fs = require('fs');
const path = './components/StockInventoryView.tsx';
let code = fs.readFileSync(path, 'utf8');

const regex = /const handleBulkImport = \(\) => \{/m;
if (code.match(regex)) {
    code = code.replace(regex, 'const handleBulkImport = async () => {');
} else {
    code = code.replace(/const handleBulkImport = async \(\) => \{/m, 'const handleBulkImport = async () => {'); // Just in case
    // wait, what if it was not an arrow function?
    const fallbackRegex = /function handleBulkImport\(\) \{/m;
    if (code.match(fallbackRegex)) {
        code = code.replace(fallbackRegex, 'async function handleBulkImport() {');
    }
}
fs.writeFileSync(path, code);
console.log("Success");

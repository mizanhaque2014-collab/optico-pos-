const fs = require('fs');
const path = './components/StockInventoryView.tsx';
let code = fs.readFileSync(path, 'utf8');

const regex = /store\.saveStockItem\(itemToAdd\);\s+setFormSuccess\(`Successfully saved manual product "\$\{newProduct\.brand\} \$\{newProduct\.modelNumber\}" to stock\.`\);/m;

const replacement = `await store.saveStockItem(itemToAdd);
    setFormSuccess(\`Successfully saved manual product "\${newProduct.brand} \${newProduct.modelNumber}" to stock.\`);
    loadData();`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    
    // also we need to make handleSaveManualProduct async
    const asyncRegex = /const handleSaveManualProduct = \(e: React\.FormEvent\) => \{/m;
    code = code.replace(asyncRegex, 'const handleSaveManualProduct = async (e: React.FormEvent) => {');
    
    fs.writeFileSync(path, code);
    console.log("Success");
} else {
    console.log("Failed to match regex");
}

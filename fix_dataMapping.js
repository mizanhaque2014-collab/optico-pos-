const fs = require('fs');
const path = './lib/dataMapping.ts';
let code = fs.readFileSync(path, 'utf8');

const regex = /id: String\(item\.id \|\| item\.InventoryID \|\| item\.inventoryId \|\| item\.inventoryid \|\| item\.StockID \|\| item\.stockId \|\| ''\),/m;

const replacement = `id: String(item.id || item.InventoryID || item.inventoryId || item.inventoryid || item.StockID || item.stockId || 's-missing-' + Math.random().toString(36).substr(2, 9)),`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync(path, code);
    console.log("Success");
} else {
    console.log("Failed to match regex");
}

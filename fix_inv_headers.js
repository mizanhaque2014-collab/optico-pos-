const fs = require('fs');
const path = './backend/Inventory.gs';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/var INV_HEADERS = \[.*?\];/s, 'var INV_HEADERS = ["StockID", "CompanyID", "BranchID", "Category", "Brand", "Model", "Quantity", "Barcode", "PurchasePrice", "SellingPrice", "CreatedAt"];');

fs.writeFileSync(path, code);
console.log("Fixed INV_HEADERS in Inventory.gs");

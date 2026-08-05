const fs = require('fs');
const path = './backend/Inventory.gs';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/if \(item\.modelNumber && typeof item\.Model === 'undefined'\) item\.Model = item\.modelNumber;/g, "if (typeof item.modelNumber !== 'undefined' && typeof item.Model === 'undefined') item.Model = item.modelNumber;");
code = code.replace(/if \(item\.barcode && typeof item\.Barcode === 'undefined'\) item\.Barcode = item\.barcode;/g, "if (typeof item.barcode !== 'undefined' && typeof item.Barcode === 'undefined') item.Barcode = item.barcode;");
code = code.replace(/if \(item\.purchasePrice && typeof item\.PurchasePrice === 'undefined'\) item\.PurchasePrice = item\.purchasePrice;/g, "if (typeof item.purchasePrice !== 'undefined' && typeof item.PurchasePrice === 'undefined') item.PurchasePrice = item.purchasePrice;");
code = code.replace(/if \(item\.sellingPrice && typeof item\.SellingPrice === 'undefined'\) item\.SellingPrice = item\.sellingPrice;/g, "if (typeof item.sellingPrice !== 'undefined' && typeof item.SellingPrice === 'undefined') item.SellingPrice = item.sellingPrice;");
code = code.replace(/if \(item\.supplierName && typeof item\.SupplierName === 'undefined'\) item\.SupplierName = item\.supplierName;/g, "if (typeof item.supplierName !== 'undefined' && typeof item.SupplierName === 'undefined') item.SupplierName = item.supplierName;");
code = code.replace(/if \(item\.purchaseDate && typeof item\.PurchaseDate === 'undefined'\) item\.PurchaseDate = item\.purchaseDate;/g, "if (typeof item.purchaseDate !== 'undefined' && typeof item.PurchaseDate === 'undefined') item.PurchaseDate = item.purchaseDate;");
code = code.replace(/if \(item\.remarks && typeof item\.Remarks === 'undefined'\) item\.Remarks = item\.remarks;/g, "if (typeof item.remarks !== 'undefined' && typeof item.Remarks === 'undefined') item.Remarks = item.remarks;");
code = code.replace(/if \(item\.branch && typeof item\.BranchID === 'undefined'\) item\.BranchID = item\.branch;/g, "if (typeof item.branch !== 'undefined' && typeof item.BranchID === 'undefined') item.BranchID = item.branch;");
code = code.replace(/if \(item\.quantity && typeof item\.Quantity === 'undefined'\) item\.Quantity = item\.quantity;/g, "if (typeof item.quantity !== 'undefined' && typeof item.Quantity === 'undefined') item.Quantity = item.quantity;");

fs.writeFileSync(path, code);
console.log("Fixed saveInventory in Inventory.gs");

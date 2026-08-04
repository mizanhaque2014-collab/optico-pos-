const fs = require('fs');
const path = './backend/Inventory.gs';
const code = `// ==========================================
// INVENTORY.GS
// ==========================================

var INV_HEADERS = ["InventoryID", "CompanyID", "BranchID", "Category", "Brand", "Model", "Color", "Size", "Quantity", "PurchasePrice", "SellingPrice", "CreatedAt", "Barcode"];

function getInventory() {
  getSheetByNameOrCreate(CONFIG.SHEETS.INVENTORY, INV_HEADERS);
  return getAllRecords(CONFIG.SHEETS.INVENTORY);
}

function saveInventory(item) {
  var sheet = getSheetByNameOrCreate(CONFIG.SHEETS.INVENTORY, INV_HEADERS);
  var headers = getSheetHeaders(sheet);
  
  var hasStockID = false;
  for (var i = 0; i < headers.length; i++) {
    if (normalizeKey(headers[i]) === 'stockid') {
      hasStockID = true;
      break;
    }
  }
  
  var idField = hasStockID ? "StockID" : "InventoryID";
  
  if (item.id) {
    item[idField] = item.id;
  }
  
  if (item.modelNumber && typeof item.Model === 'undefined') item.Model = item.modelNumber;
  if (item.barcode && typeof item.Barcode === 'undefined') item.Barcode = item.barcode;
  if (item.purchasePrice && typeof item.PurchasePrice === 'undefined') item.PurchasePrice = item.purchasePrice;
  if (item.sellingPrice && typeof item.SellingPrice === 'undefined') item.SellingPrice = item.sellingPrice;
  if (item.supplierName && typeof item.SupplierName === 'undefined') item.SupplierName = item.supplierName;
  if (item.purchaseDate && typeof item.PurchaseDate === 'undefined') item.PurchaseDate = item.purchaseDate;
  if (item.remarks && typeof item.Remarks === 'undefined') item.Remarks = item.remarks;
  
  return saveRecord(CONFIG.SHEETS.INVENTORY, idField, item, "INVITEM"); 
}

function deleteInventory(id) {
  var sheet = getSheetByNameOrCreate(CONFIG.SHEETS.INVENTORY, INV_HEADERS);
  var headers = getSheetHeaders(sheet);
  
  var hasStockID = false;
  for (var i = 0; i < headers.length; i++) {
    if (normalizeKey(headers[i]) === 'stockid') {
      hasStockID = true;
      break;
    }
  }
  var idField = hasStockID ? "StockID" : "InventoryID";
  return deleteRecord(CONFIG.SHEETS.INVENTORY, idField, id);
}
`;

fs.writeFileSync(path, code);

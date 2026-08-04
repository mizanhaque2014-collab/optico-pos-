const fs = require('fs');
const path = './backend/Inventory.gs';
let code = fs.readFileSync(path, 'utf8');

const replacement = `// ==========================================
// INVENTORY.GS
// ==========================================

var INV_HEADERS = ["InventoryID", "CompanyID", "BranchID", "Category", "Brand", "Model", "Color", "Size", "Quantity", "PurchasePrice", "SellingPrice", "CreatedAt", "Barcode"];

function syncInventoryHeaders() {
  var sheet = getSheetByNameOrCreate(CONFIG.SHEETS.INVENTORY, INV_HEADERS);
  var currentHeaders = getSheetHeaders(sheet);
  var missingHeaders = [];
  
  for (var i = 0; i < INV_HEADERS.length; i++) {
    var found = false;
    for (var j = 0; j < currentHeaders.length; j++) {
      if (normalizeKey(INV_HEADERS[i]) === normalizeKey(currentHeaders[j]) || 
         (normalizeKey(INV_HEADERS[i]) === 'inventoryid' && normalizeKey(currentHeaders[j]) === 'stockid')) {
        found = true;
        break;
      }
    }
    if (!found) {
      missingHeaders.push(INV_HEADERS[i]);
    }
  }
  
  if (missingHeaders.length > 0) {
    var lastCol = sheet.getLastColumn();
    if (lastCol === 0) lastCol = 1;
    sheet.getRange(1, lastCol + 1, 1, missingHeaders.length).setValues([missingHeaders]);
    SpreadsheetApp.flush();
  }
}

function getInventory() {
  syncInventoryHeaders();
  return getAllRecords(CONFIG.SHEETS.INVENTORY);
}

function saveInventory(item) {
  syncInventoryHeaders();
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
  if (item.branch && typeof item.BranchID === 'undefined') item.BranchID = item.branch;
  if (item.quantity && typeof item.Quantity === 'undefined') item.Quantity = item.quantity;
  
  return saveRecord(CONFIG.SHEETS.INVENTORY, idField, item, "INVITEM"); 
}

function deleteInventory(id) {
  syncInventoryHeaders();
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
}`;

fs.writeFileSync(path, replacement);
console.log("Success");

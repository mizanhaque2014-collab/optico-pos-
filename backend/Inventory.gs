// ==========================================
// INVENTORY.GS
// ==========================================

var INV_HEADERS = ["StockID", "CompanyID", "BranchID", "Category", "Brand", "Model", "Quantity", "Barcode", "PurchasePrice", "SellingPrice", "CreatedAt"];

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
  
  if (typeof item.modelNumber !== 'undefined' && typeof item.Model === 'undefined') item.Model = item.modelNumber;
  if (typeof item.barcode !== 'undefined' && typeof item.Barcode === 'undefined') item.Barcode = item.barcode;
  if (typeof item.purchasePrice !== 'undefined' && typeof item.PurchasePrice === 'undefined') item.PurchasePrice = item.purchasePrice;
  if (typeof item.sellingPrice !== 'undefined' && typeof item.SellingPrice === 'undefined') item.SellingPrice = item.sellingPrice;
  if (typeof item.supplierName !== 'undefined' && typeof item.SupplierName === 'undefined') item.SupplierName = item.supplierName;
  if (typeof item.purchaseDate !== 'undefined' && typeof item.PurchaseDate === 'undefined') item.PurchaseDate = item.purchaseDate;
  if (typeof item.remarks !== 'undefined' && typeof item.Remarks === 'undefined') item.Remarks = item.remarks;
  if (typeof item.branch !== 'undefined' && typeof item.BranchID === 'undefined') item.BranchID = item.branch;
  if (typeof item.quantity !== 'undefined' && typeof item.Quantity === 'undefined') item.Quantity = item.quantity;
  
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
}
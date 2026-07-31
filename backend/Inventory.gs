// ==========================================
// INVENTORY.GS
// ==========================================
var INV_HEADERS = ["InventoryID", "CompanyID", "BranchID", "Category", "Brand", "Model", "Color", "Size", "Quantity", "PurchasePrice", "SellingPrice", "CreatedAt"];

function getInventory() {
  getSheetByNameOrCreate(CONFIG.SHEETS.INVENTORY, INV_HEADERS);
  return getAllRecords(CONFIG.SHEETS.INVENTORY);
}

function saveInventory(item) { return saveRecord(CONFIG.SHEETS.INVENTORY, "InventoryID", item, "INVITEM"); }
function deleteInventory(id) { return deleteRecord(CONFIG.SHEETS.INVENTORY, "InventoryID", id); }
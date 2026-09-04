const fs = require('fs');
let code = fs.readFileSync('lib/dataMapping.ts', 'utf-8');

// Patch normalizeCustomer
code = code.replace(
  `id: String(c.id || c.CustomerID || c.customerID || c.CustomerId || c.customerid || c.customerId || ''),`,
  `id: String(c.id || c.CustomerID || c.customerID || c.CustomerId || c.customerid || c.customerId || ''),
    companyId: String(c.companyId || c.CompanyID || ''),
    branchId: String(c.branchId || c.BranchID || ''),`
);

// Patch normalizePrescription
code = code.replace(
  `id: p.id || p.PrescriptionID || p.prescriptionId || '',`,
  `id: p.id || p.PrescriptionID || p.prescriptionId || '',
    companyId: String(p.companyId || p.CompanyID || ''),
    branchId: String(p.branchId || p.BranchID || ''),`
);

// Patch normalizeInvoice
code = code.replace(
  `id: String(inv.InvoiceID || inv.id || inv.Id || inv.ID || ''),`,
  `id: String(inv.InvoiceID || inv.id || inv.Id || inv.ID || ''),
    companyId: String(inv.companyId || inv.CompanyID || ''),
    branchId: String(inv.branchId || inv.BranchID || ''),`
);

// Patch normalizeStockItem
code = code.replace(
  `id: String(item.id || item.InventoryID || item.inventoryId || item.inventoryid || item.StockID || item.stockId || 's-rec-' + (item.barcode || item.Barcode || '') + '-' + (item.modelNumber || item.Model || 'unkn')),`,
  `id: String(item.id || item.InventoryID || item.inventoryId || item.inventoryid || item.StockID || item.stockId || 's-rec-' + (item.barcode || item.Barcode || '') + '-' + (item.modelNumber || item.Model || 'unkn')),
    companyId: String(item.companyId || item.CompanyID || ''),
    branchId: String(item.branchId || item.BranchID || item.branch || item.Branch || ''),`
);

fs.writeFileSync('lib/dataMapping.ts', code);
console.log("Patched dataMapping successfully.");

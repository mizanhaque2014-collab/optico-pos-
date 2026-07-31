const fs = require('fs');
let code = fs.readFileSync('Code.gs', 'utf8');

const injection = `
        } else if (key === 'Category') {
          itemRowData.push(item.category || item.type || item.itemType || '');
        } else if (key === 'ProductSource') {
          itemRowData.push(item.productSource || (item.inventoryId ? 'Inventory' : 'Manual'));
        } else if (key === 'ProductID' || key === 'InventoryID') {
          itemRowData.push(item.id || item.inventoryId || '');
        } else {
          var val = item[key] || item[key.charAt(0).toLowerCase() + key.slice(1)];
          if (val === undefined || val === null) val = "";
          itemRowData.push(val);
        }
`;

const replacement = `
        } else if (key === 'Category') {
          itemRowData.push(item.category || item.type || item.itemType || '');
        } else if (key === 'ProductSource') {
          itemRowData.push(item.productSource || (item.inventoryId ? 'Inventory' : 'Manual'));
        } else if (key === 'ProductID' || key === 'InventoryID') {
          itemRowData.push(item.id || item.inventoryId || '');
        } else if (key === 'Qty') {
          itemRowData.push(item.quantity || item.qty || item.Qty || 0);
        } else if (key === 'UnitPrice') {
          itemRowData.push(item.sellingPrice || item.unitPrice || item.UnitPrice || 0);
        } else if (key === 'Total') {
          itemRowData.push(item.finalAmount || item.total || item.Total || 0);
        } else if (key === 'Model') {
          itemRowData.push(item.modelNumber || item.model || item.Model || '');
        } else if (key === 'Description') {
          itemRowData.push(item.description || item.productType || item.lensCategory || item.Description || '');
        } else if (key === 'LensBrand') {
          itemRowData.push(item.lensBrand || item.brand || item.Brand || '');
        } else if (key === 'LensType') {
          itemRowData.push(item.lensCategory || item.lensType || item.LensType || '');
        } else if (key === 'CustomerID') {
          itemRowData.push(inv.customerId || inv.CustomerID || '');
        } else if (key === 'CompanyID') {
          itemRowData.push(inv.companyId || inv.CompanyID || '');
        } else if (key === 'BranchID') {
          itemRowData.push(inv.branchId || inv.BranchID || '');
        } else {
          var val = item[key] || item[key.charAt(0).toLowerCase() + key.slice(1)];
          if (val === undefined || val === null) val = "";
          itemRowData.push(val);
        }
`;

if (code.includes(injection)) {
  code = code.replace(injection, replacement);
  fs.writeFileSync('Code.gs', code);
  console.log("Success item keys");
} else {
  console.log("Injection not found");
}

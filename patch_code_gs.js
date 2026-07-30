const fs = require('fs');
let code = fs.readFileSync('Code.gs', 'utf8');

// 1. Add getSalesOrderItemsSheet
const sheetGetter = `
function getSalesOrderItemsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("SalesOrderItems");
  if (!sheet) {
    sheet = ss.insertSheet("SalesOrderItems");
    var headers = [
      "SalesOrderID",
      "InvoiceID",
      "CustomerID",
      "CompanyID",
      "BranchID",
      "Category",
      "ProductSource",
      "InventoryID",
      "ProductID",
      "Brand",
      "Model",
      "Description",
      "LensType",
      "LensBrand",
      "LensIndex",
      "LensCoating",
      "Power",
      "Color",
      "Size",
      "Eye",
      "Qty",
      "UnitPrice",
      "Discount",
      "Tax",
      "Total",
      "CreatedDate"
    ];
    sheet.appendRow(headers);
  }
  return sheet;
}
`;

if (!code.includes('getSalesOrderItemsSheet')) {
  code = code.replace('function getInvoicesSheet() {', sheetGetter + '\nfunction getInvoicesSheet() {');
}

// 2. Add saveSalesOrderItems action
const saveAction = `
      case 'saveSalesOrderItems':
        var sheet = getSalesOrderItemsSheet();
        var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        // Delete existing for this invoice
        var lastRow = sheet.getLastRow();
        if (lastRow > 1) {
          var dataRange = sheet.getRange(2, 1, lastRow - 1, headers.length);
          var data = dataRange.getValues();
          var rowsToDelete = [];
          for (var i = data.length - 1; i >= 0; i--) {
            if (data[i][1] === payload.invoiceId) {
              rowsToDelete.push(i + 2);
            }
          }
          rowsToDelete.forEach(function(rowNum) {
            sheet.deleteRow(rowNum);
          });
        }
        // Insert new items
        var items = payload.items || [];
        var createdDate = Date.now();
        items.forEach(function(item) {
          var rowData = [];
          for (var k = 0; k < headers.length; k++) {
            var key = headers[k];
            if (key === 'CreatedDate') {
              rowData.push(createdDate);
            } else if (key === 'InvoiceID' || key === 'SalesOrderID') {
              rowData.push(payload.invoiceId);
            } else if (key === 'Category') {
              rowData.push(item.category || item.type || '');
            } else if (key === 'ProductSource') {
              rowData.push(item.productSource || (item.inventoryId ? 'Inventory' : 'Manual'));
            } else if (key === 'ProductID' || key === 'InventoryID') {
              rowData.push(item.id || item.inventoryId || '');
            } else {
              var val = item[key] || item[key.charAt(0).toLowerCase() + key.slice(1)];
              if (val === undefined || val === null) val = "";
              rowData.push(val);
            }
          }
          sheet.appendRow(rowData);
        });
        SpreadsheetApp.flush();
        result = { success: true, count: items.length };
        break;
      case 'getSalesOrderItems':
        var sheet = getSalesOrderItemsSheet();
        var lastRow = sheet.getLastRow();
        var res = [];
        if (lastRow > 1) {
          var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
          var data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
          for (var i = 0; i < data.length; i++) {
            if (!payload.invoiceId || data[i][1] === payload.invoiceId) {
              var obj = {};
              for (var j = 0; j < headers.length; j++) {
                obj[headers[j]] = data[i][j];
              }
              res.push(obj);
            }
          }
        }
        result = res;
        break;
`;

if (!code.includes("case 'saveSalesOrderItems':")) {
  code = code.replace("case 'saveSalesOrder':", saveAction + "\n      case 'saveSalesOrder':");
}

fs.writeFileSync('Code.gs', code);
console.log('Code.gs patched successfully');

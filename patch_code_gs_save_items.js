const fs = require('fs');
let code = fs.readFileSync('Code.gs', 'utf8');

const injection = `
  if (targetRowIndex !== -1) {
    sheet.getRange(targetRowIndex, 1, 1, headers.length).setValues([rowData]);
    SpreadsheetApp.flush();
  } else {
    sheet.appendRow(rowData);
    SpreadsheetApp.flush();
  }
`;

const replacement = `
  if (targetRowIndex !== -1) {
    sheet.getRange(targetRowIndex, 1, 1, headers.length).setValues([rowData]);
    SpreadsheetApp.flush();
  } else {
    sheet.appendRow(rowData);
    SpreadsheetApp.flush();
  }
  
  // Also save items to SalesOrderItems sheet to prevent data loss
  var itemsToSave = inv.items || inv.Items;
  if (typeof itemsToSave === 'string') {
    try { itemsToSave = JSON.parse(itemsToSave); } catch(e) { itemsToSave = []; }
  }
  if (itemsToSave && itemsToSave.length > 0) {
    var itemsSheet = getSalesOrderItemsSheet();
    var itemsHeaders = itemsSheet.getRange(1, 1, 1, itemsSheet.getLastColumn()).getValues()[0];
    
    // Delete existing for this invoice
    var itemsLastRow = itemsSheet.getLastRow();
    if (itemsLastRow > 1) {
      var dataRange = itemsSheet.getRange(2, 1, itemsLastRow - 1, itemsHeaders.length);
      var data = dataRange.getValues();
      var rowsToDelete = [];
      for (var i = data.length - 1; i >= 0; i--) {
        if (data[i][1] === inv.id || data[i][1] === inv.InvoiceID) {
          rowsToDelete.push(i + 2);
        }
      }
      rowsToDelete.forEach(function(rowNum) {
        itemsSheet.deleteRow(rowNum);
      });
    }
    
    var createdDate = inv.createdAt || inv.CreatedDate || Date.now();
    itemsToSave.forEach(function(item) {
      var itemRowData = [];
      for (var k = 0; k < itemsHeaders.length; k++) {
        var key = itemsHeaders[k];
        if (key === 'CreatedDate') {
          itemRowData.push(createdDate);
        } else if (key === 'InvoiceID' || key === 'SalesOrderID') {
          itemRowData.push(inv.id || inv.InvoiceID);
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
      }
      itemsSheet.appendRow(itemRowData);
    });
    SpreadsheetApp.flush();
  }
`;

code = code.replace(injection, replacement);
fs.writeFileSync('Code.gs', code);

const fs = require('fs');
let code = fs.readFileSync('Code.gs', 'utf8');

const injection = `
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var inv = {};
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j];
      var val = row[j];
      if (key === 'items') {
        try {
          val = val ? JSON.parse(val) : [];
        } catch (e) {
          val = [];
        }
      } else if (key === 'paymentDetail' || key === 'finalCollectionPaymentDetail') {
        try {
          val = val ? JSON.parse(val) : {};
        } catch (e) {
          val = {};
        }
      } else if (key === 'subTotal' || key === 'totalDiscount' || key === 'grandTotal' || key === 'advanceAmount' || key === 'balanceAmount' || key === 'createdAt' || key === 'updatedAt' || key === 'deliveryDate') {
        val = Number(val) || 0;
      }
      inv[key] = val;
    }
    invoices.push(inv);
  }
`;

const replacement = `
  // Pre-load items from SalesOrderItems sheet
  var itemsSheet = getSalesOrderItemsSheet();
  var itemsLastRow = itemsSheet.getLastRow();
  var allItems = [];
  var itemsHeaders = [];
  if (itemsLastRow > 1) {
    itemsHeaders = itemsSheet.getRange(1, 1, 1, itemsSheet.getLastColumn()).getValues()[0];
    var itemsData = itemsSheet.getRange(2, 1, itemsLastRow - 1, itemsHeaders.length).getValues();
    for (var m = 0; m < itemsData.length; m++) {
      var obj = {};
      for (var n = 0; n < itemsHeaders.length; n++) {
        obj[itemsHeaders[n]] = itemsData[m][n];
      }
      allItems.push(obj);
    }
  }

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var inv = {};
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j];
      var val = row[j];
      if (key === 'items') {
        try {
          val = val ? JSON.parse(val) : [];
        } catch (e) {
          val = [];
        }
      } else if (key === 'paymentDetail' || key === 'finalCollectionPaymentDetail') {
        try {
          val = val ? JSON.parse(val) : {};
        } catch (e) {
          val = {};
        }
      } else if (key === 'subTotal' || key === 'totalDiscount' || key === 'grandTotal' || key === 'advanceAmount' || key === 'balanceAmount' || key === 'createdAt' || key === 'updatedAt' || key === 'deliveryDate') {
        val = Number(val) || 0;
      }
      inv[key] = val;
    }
    
    // Attach items from SalesOrderItems if not present in the 'items' column
    if (!inv.items || inv.items.length === 0) {
      var invId = inv.id || inv.InvoiceID || inv.invoiceNumber;
      inv.items = allItems.filter(function(item) {
        return item.InvoiceID === invId || item.SalesOrderID === invId || item.InvoiceID === inv.id;
      }).map(function(item) {
        // Map back to camelCase properties typical for frontend
        var mappedItem = {};
        for(var k in item) {
           var newKey = k.charAt(0).toLowerCase() + k.slice(1);
           if (k === 'ProductID' || k === 'InventoryID') newKey = 'id';
           else if (k === 'Category') newKey = 'itemType';
           mappedItem[newKey] = item[k];
        }
        return mappedItem;
      });
    }
    
    invoices.push(inv);
  }
`;

if (code.includes(injection)) {
  code = code.replace(injection, replacement);
  fs.writeFileSync('Code.gs', code);
  console.log("Success");
} else {
  console.log('Injection point not found');
}

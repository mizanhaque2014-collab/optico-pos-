const fs = require('fs');
let code = fs.readFileSync('Code.gs', 'utf8');

const injection = `
// ======================
// INVOICE MANAGEMENT ADDITIONS
// ======================

function getInvoicesByCustomer(customerId) {
  if (!customerId) return [];
  var all = getInvoices();
  return all.filter(function(i) {
    return (i.customerId && i.customerId.toString() === customerId.toString()) ||
           (i.CustomerID && i.CustomerID.toString() === customerId.toString());
  });
}

function getInvoiceById(id) {
  if (!id) return null;
  var all = getInvoices();
  return all.find(function(i) {
    return i.id && i.id.toString() === id.toString();
  }) || null;
}

function searchInvoices(keyword) {
  if (!keyword) return [];
  var searchStr = keyword.toString().toLowerCase().trim();
  var all = getInvoices();
  return all.filter(function(i) {
    var invNo = (i.invoiceNumber || i.InvoiceNumber || "").toString().toLowerCase();
    var pId = (i.prescriptionId || i.PrescriptionID || "").toString().toLowerCase();
    return invNo.includes(searchStr) || pId.includes(searchStr);
  });
}

function deleteInvoice(id) {
  if (!id) throw new Error("Invoice ID is required");
  var sheet = getInvoicesSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  
  for (var i = 0; i < values.length; i++) {
    if (values[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 2);
      SpreadsheetApp.flush();
      return true;
    }
  }
  return false;
}
`;

if (!code.includes('function getInvoicesByCustomer(')) {
  code = code + '\n' + injection;
  fs.writeFileSync('Code.gs', code);
  console.log("Injected invoice functions.");
}

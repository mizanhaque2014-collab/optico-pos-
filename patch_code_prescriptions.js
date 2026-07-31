const fs = require('fs');
let code = fs.readFileSync('Code.gs', 'utf8');

const injection = `
// ======================
// PRESCRIPTION MANAGEMENT ADDITIONS
// ======================

function getPrescriptionsByCustomer(customerId) {
  if (!customerId) return [];
  var all = getPrescriptions();
  return all.filter(function(p) {
    return (p.customerId && p.customerId.toString() === customerId.toString()) ||
           (p.CustomerID && p.CustomerID.toString() === customerId.toString());
  });
}

function getPrescriptionById(id) {
  if (!id) return null;
  var all = getPrescriptions();
  return all.find(function(p) {
    return p.id && p.id.toString() === id.toString();
  }) || null;
}

function deletePrescription(id) {
  if (!id) throw new Error("Prescription ID is required");
  var sheet = getPrescriptionsSheet();
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

if (!code.includes('function getPrescriptionsByCustomer(')) {
  code = code + '\n' + injection;
  fs.writeFileSync('Code.gs', code);
  console.log("Injected prescription functions.");
}

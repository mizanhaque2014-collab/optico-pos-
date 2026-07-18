const fs = require('fs');

let content = fs.readFileSync('Prescriptions.gs', 'utf8');

// Replace createPrescription
content = content.replace(/function createPrescription\(p\) \{[\s\S]*?(?=\/\*\*|\nfunction updatePrescription)/, 
`function createPrescription(p) {
  logBackend("ENTER createPrescription");
  logBackend("Payload", p);
  logBackend("CustomerID: " + (p.CustomerID || p.customerId));
  logBackend("PrescriptionID: " + (p.PrescriptionID || p.prescriptionId || p.id));
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  logBackend("Spreadsheet ID: " + ss.getId());
  logBackend("Spreadsheet Name: " + ss.getName());
  logBackend("Spreadsheet URL: " + ss.getUrl());

  validatePrescriptionBackend(p);
  
  var sheet = getPrescriptionsSheet();
  logBackend("Sheet Name: " + sheet.getName());
  
  var headers = getPrescriptionHeaders(sheet);
  logBackend("Headers Found: " + JSON.stringify(headers));
  
  var all = getPrescriptions();
  var idToUse;
  do {
    idToUse = generatePrescriptionId();
  } while (all.some(function(item) {
    var idVal = item.PrescriptionID || item.id;
    return idVal === idToUse;
  }));
  
  p.PrescriptionID = idToUse;
  p.id = idToUse;
  p.CreatedDate = Date.now();
  
  var rowData = prescriptionToRow(p, headers);
  logBackend("Mapped Row: " + JSON.stringify(rowData));
  
  logBackend("ENTER appendRow");
  try {
    sheet.appendRow(rowData);
    logBackend("appendRow Result: Success");
  } catch (err) {
    logBackend("appendRow Result: Failed - " + err.toString());
    throw err;
  }
  logBackend("EXIT appendRow");
  
  SpreadsheetApp.flush(); // Force write to sheet immediately
  var lastRow = sheet.getLastRow();
  var lastRowValues = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues();
  logBackend("LAST ROW AFTER APPEND: " + lastRow);
  logBackend("EXACT ROW IN SHEET: " + JSON.stringify(lastRowValues));
  
  logBackend("EXIT createPrescription");
  return p;
}
`);

fs.writeFileSync('Prescriptions.gs', content);

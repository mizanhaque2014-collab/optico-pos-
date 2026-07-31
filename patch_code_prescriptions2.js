const fs = require('fs');
let code = fs.readFileSync('Code.gs', 'utf8');

const injection = `
function getPrescriptionsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Prescriptions");
  if (!sheet) {
    sheet = ss.insertSheet("Prescriptions");
  }
  if (sheet.getLastColumn() === 0) {
    var headers = [
      "id",
      "customerId",
      "companyId",
      "branchId",
      "doctorName",
      "examDate",
      "complaint",
      "diagnosis",
      "advice",
      "remarks",
      "sphOd",
      "cylOd",
      "axisOd",
      "sphOs",
      "cylOs",
      "axisOs",
      "addPower",
      "pdDistance",
      "pdNear",
      "source",
      "createdAt",
      "updatedAt"
    ];
    sheet.appendRow(headers);
  }
  return sheet;
}

function getPrescriptions() {
  var sheet = getPrescriptionsSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var prescriptions = [];
  
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var p = {};
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j];
      p[key] = row[j];
    }
    prescriptions.push(p);
  }
  return prescriptions;
}

function savePrescription(p) {
  if (!p) throw new Error("No prescription provided");
  var sheet = getPrescriptionsSheet();
  var lastRow = sheet.getLastRow();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Try matching via PrescriptionID or id
  var pid = p.PrescriptionID || p.id;
  if (!pid) {
    pid = "PRE-" + Date.now();
    p.id = pid;
    p.PrescriptionID = pid;
  }
  
  var targetRowIndex = -1;
  if (lastRow > 1) {
    var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    for (var i = 0; i < values.length; i++) {
      if (values[i][0].toString() === pid.toString()) {
        targetRowIndex = i + 2;
        break;
      }
    }
  }
  
  var rowData = [];
  for (var k = 0; k < headers.length; k++) {
    var key = headers[k];
    var val = p[key] !== undefined ? p[key] : (p[key.charAt(0).toUpperCase() + key.slice(1)] !== undefined ? p[key.charAt(0).toUpperCase() + key.slice(1)] : "");
    // Try some specific PascalCase matchings
    if (key === 'id') val = pid;
    if (key === 'customerId') val = p.CustomerID || p.customerId || "";
    if (key === 'companyId') val = p.CompanyID || p.companyId || "";
    if (key === 'branchId') val = p.BranchID || p.branchId || "";
    if (key === 'doctorName') val = p.DoctorName || p.doctorName || "";
    if (key === 'examDate') val = p.ExamDate || p.examDate || "";
    if (key === 'complaint') val = p.Complaint || p.complaint || "";
    if (key === 'diagnosis') val = p.Diagnosis || p.diagnosis || "";
    if (key === 'advice') val = p.Advice || p.advice || "";
    if (key === 'remarks') val = p.Remarks || p.remarks || "";
    if (key === 'sphOd') val = p.OD_Distance_SPH || p.sphOd || "";
    if (key === 'cylOd') val = p.OD_Distance_CYL || p.cylOd || "";
    if (key === 'axisOd') val = p.OD_Distance_AXIS || p.axisOd || "";
    if (key === 'sphOs') val = p.OS_Distance_SPH || p.sphOs || "";
    if (key === 'cylOs') val = p.OS_Distance_CYL || p.cylOs || "";
    if (key === 'axisOs') val = p.OS_Distance_AXIS || p.axisOs || "";
    if (key === 'addPower') val = p.AddPower || p.addPower || "";
    if (key === 'pdDistance') val = p.PD_Distance || p.pdDistance || "";
    if (key === 'pdNear') val = p.PD_Near || p.pdNear || "";
    if (key === 'source') val = p.Source || p.source || "";
    if (key === 'createdAt' && !val) val = p.CreatedDate || Date.now();
    if (key === 'updatedAt') val = Date.now();
    
    rowData.push(val);
  }
  
  if (targetRowIndex !== -1) {
    sheet.getRange(targetRowIndex, 1, 1, headers.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  SpreadsheetApp.flush();
  return p;
}

function createPrescription(p) { return savePrescription(p); }
function updatePrescription(p) { return savePrescription(p); }
`;

if (!code.includes('function getPrescriptionsSheet()')) {
  code = code + '\n' + injection;
  fs.writeFileSync('Code.gs', code);
  console.log("Injected createPrescription logic.");
}

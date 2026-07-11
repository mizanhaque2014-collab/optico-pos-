/**
 * Prescriptions Management Module (Prescriptions.gs)
 * This module handles reading, writing, and updating prescription records in the "Prescriptions" Google Sheet.
 */

// Helper to get or create the Prescriptions sheet with standard columns
function getPrescriptionsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Prescriptions");
  if (!sheet) {
    sheet = ss.insertSheet("Prescriptions");
  }
  if (sheet.getLastColumn() === 0) {
    // Write default header columns
    sheet.appendRow([
      "PrescriptionID",
      "CustomerID",
      "CompanyID",
      "BranchID",
      "DoctorName",
      "ExamDate",
      "Complaint",
      "Diagnosis",
      "Advice",
      "Remarks",
      "OD_Distance_SPH",
      "OD_Distance_CYL",
      "OD_Distance_AXIS",
      "OS_Distance_SPH",
      "OS_Distance_CYL",
      "OS_Distance_AXIS",
      "AddPower",
      "PD_Distance",
      "PD_Near",
      "CreatedDate"
    ]);
  }
  return sheet;
}

// Retrieve headers safely
function getPrescriptionHeaders(sheet) {
  var lastColumn = sheet.getLastColumn();
  var defaultHeaders = [
    "PrescriptionID",
    "CustomerID",
    "CompanyID",
    "BranchID",
    "DoctorName",
    "ExamDate",
    "Complaint",
    "Diagnosis",
    "Advice",
    "Remarks",
    "OD_Distance_SPH",
    "OD_Distance_CYL",
    "OD_Distance_AXIS",
    "OS_Distance_SPH",
    "OS_Distance_CYL",
    "OS_Distance_AXIS",
    "AddPower",
    "PD_Distance",
    "PD_Near",
    "CreatedDate"
  ];
  if (lastColumn === 0) {
    sheet.appendRow(defaultHeaders);
    return defaultHeaders;
  }
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
}

// Map Prescriptions sheet header names to exact PascalCase JavaScript property names
function mapPrescriptionHeaderToKey(header) {
  var clean = safeTrim(header).toLowerCase().replace(/[\s_-]/g, '');
  if (clean === 'prescriptionid' || clean === 'id') return 'PrescriptionID';
  if (clean === 'customerid') return 'CustomerID';
  if (clean === 'companyid') return 'CompanyID';
  if (clean === 'branchid') return 'BranchID';
  if (clean === 'doctorname') return 'DoctorName';
  if (clean === 'examdate') return 'ExamDate';
  if (clean === 'complaint') return 'Complaint';
  if (clean === 'diagnosis') return 'Diagnosis';
  if (clean === 'advice') return 'Advice';
  if (clean === 'remarks') return 'Remarks';
  if (clean === 'oddistancesph') return 'OD_Distance_SPH';
  if (clean === 'oddistancecyl') return 'OD_Distance_CYL';
  if (clean === 'oddistanceaxis') return 'OD_Distance_AXIS';
  if (clean === 'osdistancesph') return 'OS_Distance_SPH';
  if (clean === 'osdistancecyl') return 'OS_Distance_CYL';
  if (clean === 'osdistanceaxis') return 'OS_Distance_AXIS';
  if (clean === 'addpower') return 'AddPower';
  if (clean === 'pddistance') return 'PD_Distance';
  if (clean === 'pdnear') return 'PD_Near';
  if (clean === 'createddate') return 'CreatedDate';
  return header;
}

// Serialize prescription object fields into spreadsheet row indices
function prescriptionToRow(p, headers) {
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    var key = mapPrescriptionHeaderToKey(headers[i]);
    var val = p[key];
    if (val === undefined || val === null) {
      if (key === 'PrescriptionID') val = p.PrescriptionID || p.id || p.prescriptionId || p.prescriptionID;
      else if (key === 'CustomerID') val = p.CustomerID || p.customerId || p.customerID;
      else if (key === 'CompanyID') val = p.CompanyID || p.companyId || p.companyID;
      else if (key === 'BranchID') val = p.BranchID || p.branchId || p.branchID;
      else if (key === 'DoctorName') val = p.DoctorName || p.doctorName;
      else if (key === 'ExamDate') val = p.ExamDate || p.examDate;
      else if (key === 'Complaint') val = p.Complaint || p.complaint;
      else if (key === 'Diagnosis') val = p.Diagnosis || p.diagnosis;
      else if (key === 'Advice') val = p.Advice || p.advice;
      else if (key === 'Remarks') val = p.Remarks || p.remarks;
      else if (key === 'OD_Distance_SPH') val = p.OD_Distance_SPH || p.odDistanceSph || (p.rightEye && p.rightEye.sph);
      else if (key === 'OD_Distance_CYL') val = p.OD_Distance_CYL || p.odDistanceCyl || (p.rightEye && p.rightEye.cyl);
      else if (key === 'OD_Distance_AXIS') val = p.OD_Distance_AXIS || p.odDistanceAxis || (p.rightEye && p.rightEye.axis);
      else if (key === 'OS_Distance_SPH') val = p.OS_Distance_SPH || p.osDistanceSph || (p.leftEye && p.leftEye.sph);
      else if (key === 'OS_Distance_CYL') val = p.OS_Distance_CYL || p.osDistanceCyl || (p.leftEye && p.leftEye.cyl);
      else if (key === 'OS_Distance_AXIS') val = p.OS_Distance_AXIS || p.osDistanceAxis || (p.leftEye && p.leftEye.axis);
      else if (key === 'AddPower') val = p.AddPower || p.addPower || (p.rightEye && p.rightEye.add) || (p.leftEye && p.leftEye.add);
      else if (key === 'PD_Distance') val = p.PD_Distance || p.pdDistance;
      else if (key === 'PD_Near') val = p.PD_Near || p.pdNear;
      else if (key === 'CreatedDate') val = p.CreatedDate || p.createdDate || p.createdAt;
    }
    if (val === undefined || val === null) val = "";
    row.push(val);
  }
  return row;
}

// Deserialize spreadsheet row into prescription object
function rowToPrescription(row, headers) {
  var p = {};
  for (var j = 0; j < headers.length; j++) {
    var header = headers[j];
    var key = mapPrescriptionHeaderToKey(header);
    p[key] = row[j];
  }
  return p;
}

// Generate unique ID with PRE- prefix and 12 uppercase characters
function generatePrescriptionId() {
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var result = "";
  for (var i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return "PRE-" + result;
}

// Validate fields
function validatePrescriptionBackend(p) {
  if (!p) {
    throw new Error("No prescription data provided");
  }
  var customerId = p.CustomerID || p.customerId || p.customerID;
  var companyId = p.CompanyID || p.companyId || p.companyID;
  var branchId = p.BranchID || p.branchId || p.branchID;
  var examDate = p.ExamDate || p.examDate;

  if (!customerId || !String(customerId).trim()) {
    throw new Error("CustomerID is mandatory.");
  }
  if (!companyId || !String(companyId).trim()) {
    throw new Error("CompanyID is mandatory.");
  }
  if (!branchId || !String(branchId).trim()) {
    throw new Error("BranchID is mandatory.");
  }
  if (!examDate || !String(examDate).trim()) {
    throw new Error("ExamDate is mandatory.");
  }

  // Validate customer exists
  try {
    getCustomerById(customerId);
  } catch (err) {
    throw new Error("Validation Failed: Customer with ID '" + customerId + "' does not exist.");
  }
}

/**
 * Endpoint action: createPrescription
 */
function createPrescription(p) {
  validatePrescriptionBackend(p);
  
  var sheet = getPrescriptionsSheet();
  var headers = getPrescriptionHeaders(sheet);
  
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
  sheet.appendRow(rowData);
  
  return p;
}

/**
 * Endpoint action: updatePrescription
 */
function updatePrescription(p) {
  var prescriptionId = p.PrescriptionID || p.prescriptionId || p.id || p.prescriptionID;
  if (!prescriptionId) {
    throw new Error("Prescription ID is required for updating details.");
  }
  
  var sheet = getPrescriptionsSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    throw new Error("Prescription with ID " + prescriptionId + " not found (sheet is empty).");
  }
  
  var headers = getPrescriptionHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  
  var targetRowIndex = -1;
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var idColIdx = -1;
    for (var j = 0; j < headers.length; j++) {
      var headerKey = mapPrescriptionHeaderToKey(headers[j]);
      if (headerKey === 'PrescriptionID') {
        idColIdx = j;
        break;
      }
    }
    
    if (idColIdx !== -1 && row[idColIdx].toString() === prescriptionId.toString()) {
      targetRowIndex = i + 2; // +2 for 1-based index and skipping header row
      break;
    }
  }
  
  if (targetRowIndex === -1) {
    throw new Error("Prescription with ID '" + prescriptionId + "' not found.");
  }
  
  var existing = getPrescriptionById(prescriptionId);
  var merged = {};
  for (var key in existing) {
    merged[key] = existing[key];
  }
  for (var key in p) {
    if (p[key] !== undefined && p[key] !== null) {
      merged[key] = p[key];
    }
  }
  
  validatePrescriptionBackend(merged);
  
  var rowData = prescriptionToRow(merged, headers);
  sheet.getRange(targetRowIndex, 1, 1, headers.length).setValues([rowData]);
  
  return merged;
}

/**
 * Endpoint action: deletePrescription
 */
function deletePrescription(id) {
  if (!id) {
    throw new Error("Prescription ID is required for deletion.");
  }
  
  var sheet = getPrescriptionsSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    throw new Error("Prescription not found with ID: " + id);
  }
  
  var headers = getPrescriptionHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  
  var targetRowIndex = -1;
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var idColIdx = -1;
    for (var j = 0; j < headers.length; j++) {
      var headerKey = mapPrescriptionHeaderToKey(headers[j]);
      if (headerKey === 'PrescriptionID') {
        idColIdx = j;
        break;
      }
    }
    
    if (idColIdx !== -1 && row[idColIdx].toString() === id.toString()) {
      targetRowIndex = i + 2;
      break;
    }
  }
  
  if (targetRowIndex === -1) {
    throw new Error("Prescription not found with ID: " + id);
  }
  
  sheet.deleteRow(targetRowIndex);
  return { PrescriptionID: id };
}

/**
 * Endpoint action: getPrescriptions
 */
function getPrescriptions() {
  var sheet = getPrescriptionsSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  
  var headers = getPrescriptionHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var list = [];
  
  for (var i = 0; i < values.length; i++) {
    list.push(rowToPrescription(values[i], headers));
  }
  return list;
}

/**
 * Endpoint action: getPrescriptionById
 */
function getPrescriptionById(id) {
  if (!id) {
    throw new Error("Prescription ID is required.");
  }
  var all = getPrescriptions();
  var found = all.find(function(item) {
    var idVal = item.PrescriptionID || item.id;
    return idVal && idVal.toString() === id.toString();
  });
  if (!found) {
    throw new Error("Prescription not found with ID: " + id);
  }
  return found;
}

/**
 * Endpoint action: getPrescriptionsByCustomer
 */
function getPrescriptionsByCustomer(customerId) {
  if (!customerId) return [];
  var all = getPrescriptions();
  var matches = all.filter(function(item) {
    var cId = item.CustomerID || item.customerId;
    return cId && cId.toString() === customerId.toString();
  });
  matches.sort(function(a, b) {
    var da = Number(a.CreatedDate || a.createdDate || 0);
    var db = Number(b.CreatedDate || b.createdDate || 0);
    return db - da;
  });
  return matches;
}

/**
 * Endpoint action: searchPrescription
 */
function searchPrescription(query) {
  if (!query) return [];
  var searchStr = safeTrim(query).toLowerCase();
  var all = getPrescriptions();
  return all.filter(function(item) {
    return (item.PrescriptionID && safeTrim(item.PrescriptionID).toLowerCase().includes(searchStr)) ||
           (item.CustomerID && safeTrim(item.CustomerID).toLowerCase().includes(searchStr)) ||
           (item.DoctorName && safeTrim(item.DoctorName).toLowerCase().includes(searchStr)) ||
           (item.Complaint && safeTrim(item.Complaint).toLowerCase().includes(searchStr)) ||
           (item.Diagnosis && safeTrim(item.Diagnosis).toLowerCase().includes(searchStr)) ||
           (item.Advice && safeTrim(item.Advice).toLowerCase().includes(searchStr)) ||
           (item.Remarks && safeTrim(item.Remarks).toLowerCase().includes(searchStr));
  });
}

/**
 * Prescriptions Management Module (Prescriptions.gs)
 * This module handles reading, writing, and updating prescription records in the "Prescriptions" Google Sheet.
 */

// Helper to get or create the Prescriptions sheet with standard columns
function getPrescriptionsSheet() {
  logBackend("ENTER getPrescriptionsSheet");

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Prescriptions");
  if (!sheet) {
    sheet = ss.insertSheet("Prescriptions");
  }
  if (sheet.getLastColumn() === 0) {
    // Write default header columns from master prompt exactly
    sheet.appendRow([
      "PrescriptionID",
      "CustomerID",
      "CompanyID",
      "BranchID",
      "ExamDate",
      "Source",
      "OD_SPH",
      "OD_CYL",
      "OD_AXIS",
      "OS_SPH",
      "OS_CYL",
      "OS_AXIS",
      "ADD",
      "PD",
      "Remarks"
    ]);
    SpreadsheetApp.flush();
  }
    logBackend("EXIT getPrescriptionsSheet");
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
    "ExamDate",
    "Source",
    "OD_SPH",
    "OD_CYL",
    "OD_AXIS",
    "OS_SPH",
    "OS_CYL",
    "OS_AXIS",
    "ADD",
    "PD",
    "Remarks"
  ];
  if (lastColumn === 0) {
    sheet.appendRow(defaultHeaders);
    SpreadsheetApp.flush();
    return defaultHeaders;
  }
  var headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  var hasSource = false;
  for (var i = 0; i < headers.length; i++) {
    if (headers[i].toString().toLowerCase().trim() === 'source') {
      hasSource = true;
      break;
    }
  }
  if (!hasSource) {
    sheet.getRange(1, lastColumn + 1).setValue("Source");
    lastColumn++;
    headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  }
  return headers;
}

// Map Prescriptions sheet header names to exact PascalCase JavaScript property names
function mapPrescriptionHeaderToKey(header) {
  var clean = (header || "").toString().trim().toLowerCase().replace(/[\s_-]/g, '');
  if (clean === 'prescriptionid' || clean === 'id') return 'PrescriptionID';
  if (clean === 'customerid') return 'CustomerID';
  if (clean === 'companyid') return 'CompanyID';
  if (clean === 'branchid') return 'BranchID';
  if (clean === 'examdate') return 'ExamDate';
  if (clean === 'source') return 'Source';
  if (clean === 'odsph' || clean === 'oddistancesph') return 'OD_SPH';
  if (clean === 'odcyl' || clean === 'oddistancecyl') return 'OD_CYL';
  if (clean === 'odaxis' || clean === 'oddistanceaxis') return 'OD_AXIS';
  if (clean === 'ossph' || clean === 'osdistancesph') return 'OS_SPH';
  if (clean === 'oscyl' || clean === 'osdistancecyl') return 'OS_CYL';
  if (clean === 'osaxis' || clean === 'osdistanceaxis') return 'OS_AXIS';
  if (clean === 'add' || clean === 'addpower') return 'ADD';
  if (clean === 'pd' || clean === 'pddistance' || clean === 'pdnear') return 'PD';
  if (clean === 'remarks') return 'Remarks';
  
  // Non-standard backwards-compatible column fallback mappings
  if (clean === 'doctorname') return 'DoctorName';
  if (clean === 'complaint') return 'Complaint';
  if (clean === 'diagnosis') return 'Diagnosis';
  if (clean === 'advice') return 'Advice';
  if (clean === 'createddate') return 'CreatedDate';
  
  return header;
}

// Serialize prescription object fields into spreadsheet row indices
function prescriptionToRow(p, headers) {
  logBackend("ENTER prescriptionToRow");

  var row = [];
  for (var i = 0; i < headers.length; i++) {
    var key = mapPrescriptionHeaderToKey(headers[i]);
    var val = p[key];
    if (val === undefined || val === null) {
      if (key === 'PrescriptionID') {
        val = p.PrescriptionID || p.id || p.prescriptionId || p.prescriptionID;
      } else if (key === 'CustomerID') {
        val = p.CustomerID || p.customerId || p.customerID;
      } else if (key === 'CompanyID') {
        val = p.CompanyID || p.companyId || p.companyID;
      } else if (key === 'BranchID') {
        val = p.BranchID || p.branchId || p.branchID;
      } else if (key === 'ExamDate') {
        val = p.ExamDate || p.examDate || p.prescriptionDate || p.eyeTestDate;
      } else if (key === 'Source') {
        val = p.Source || p.source;
      } else if (key === 'Remarks') {
        val = p.Remarks || p.remarks;
      } else if (key === 'DoctorName') {
        val = p.DoctorName || p.doctorName || p.optometristName;
      } else if (key === 'Complaint') {
        val = p.Complaint || p.complaint;
      } else if (key === 'Diagnosis') {
        val = p.Diagnosis || p.diagnosis;
      } else if (key === 'Advice') {
        val = p.Advice || p.advice;
      } else if (key === 'CreatedDate') {
        val = p.CreatedDate || p.createdDate || p.createdAt;
      } else if (key === 'OD_SPH' || key === 'OD_Distance_SPH') {
        val = p.OD_SPH || p.OD_Distance_SPH || p.sphOd || p.odDistanceSph || (p.rightEye && p.rightEye.sph);
      } else if (key === 'OD_CYL' || key === 'OD_Distance_CYL') {
        val = p.OD_CYL || p.OD_Distance_CYL || p.cylOd || p.odDistanceCyl || (p.rightEye && p.rightEye.cyl);
      } else if (key === 'OD_AXIS' || key === 'OD_Distance_AXIS') {
        val = p.OD_AXIS || p.OD_Distance_AXIS || p.axisOd || p.odDistanceAxis || (p.rightEye && p.rightEye.axis);
      } else if (key === 'OS_SPH' || key === 'OS_Distance_SPH') {
        val = p.OS_SPH || p.OS_Distance_SPH || p.sphOs || p.osDistanceSph || (p.leftEye && p.leftEye.sph);
      } else if (key === 'OS_CYL' || key === 'OS_Distance_CYL') {
        val = p.OS_CYL || p.OS_Distance_CYL || p.cylOs || p.osDistanceCyl || (p.leftEye && p.leftEye.cyl);
      } else if (key === 'OS_AXIS' || key === 'OS_Distance_AXIS') {
        val = p.OS_AXIS || p.OS_Distance_AXIS || p.axisOs || p.osDistanceAxis || (p.leftEye && p.leftEye.axis);
      } else if (key === 'ADD' || key === 'AddPower') {
        val = p.ADD || p.AddPower || p.addPower || (p.rightEye && p.rightEye.add) || (p.leftEye && p.leftEye.add);
      } else if (key === 'PD' || key === 'PD_Distance' || key === 'PD_Near') {
        val = p.PD || p.PD_Distance || p.pdDistance || p.PD_Near || p.pdNear || p.pd;
      }
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

// Generate unique ID in the format: PRE-<timestamp>
function generatePrescriptionId() {
  return "PRE-" + Date.now();
}

// Validate fields
function validatePrescriptionBackend(p) {
  logBackend("ENTER validatePrescriptionBackend");

  
  if (!p) {
    throw new Error("No prescription data provided");
  }
  
  var customerId = p.CustomerID || p.customerId || p.customerID;
  logBackend("Resolved customerId for prescription: " + customerId);
  if (!customerId || !String(customerId).trim()) {
    throw new Error("CustomerID is mandatory.");
  }

  var companyId = p.CompanyID || p.companyId || p.companyID;
  if (!companyId || !String(companyId).trim()) {
    companyId = "COMP-default";
  }

  var branchId = p.BranchID || p.branchId || p.branchID;
  if (!branchId || !String(branchId).trim()) {
    branchId = "BR-default";
  }

  var examDate = p.ExamDate || p.examDate;
  if (!examDate || !String(examDate).trim()) {
    examDate = new Date().toISOString().split('T')[0];
  }

  // Ensure these are written back to the object so they get saved
  p.CustomerID = customerId;
  p.CompanyID = companyId;
  p.BranchID = branchId;
  p.ExamDate = examDate;

  p.customerId = customerId;
  p.companyId = companyId;
  p.branchId = branchId;
  p.examDate = examDate;

  // Validate customer exists (STEP 7: Verify getCustomerById)
  try {
    logBackend("Incoming CustomerID: " + customerId);
    var cust = getCustomerById(customerId);
    if (cust) {
      logBackend("Customer Found = true");
      logBackend("Returned object: " + JSON.stringify(cust));
      logBackend("Customer found");
    } else {
      logBackend("Customer Found = false");
      logBackend("Returned object: null");
    }
  } catch (err) {
    logBackend("Customer Found = false");
    logBackend("validatePrescriptionBackend customer check failed: " + err.toString());
    throw new Error("Validation Failed: " + err.toString());
  }
}

/**
 * Endpoint action: createPrescription
 */
function createPrescription(p) {
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
    SpreadsheetApp.flush();
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
  SpreadsheetApp.flush();
  
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
  SpreadsheetApp.flush();
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
  logBackend("ENTER getPrescriptionsByCustomer");

  if (!customerId) return [];
  var targetId = customerId.toString().trim().toLowerCase();
  var all = getPrescriptions();
  var matches = all.filter(function(item) {
    var cId = item.CustomerID || item.customerId || item.customerID;
    if (!cId) return false;
    return cId.toString().trim().toLowerCase() === targetId;
  });
  matches.sort(function(a, b) {
    var da = Number(a.CreatedDate || a.createdDate || 0);
    var db = Number(b.CreatedDate || b.createdDate || 0);
    return db - da;
  });
    logBackend("EXIT getPrescriptionsByCustomer");
  return matches;
}

/**
 * Endpoint action: searchPrescription
 */
function searchPrescription(query) {
  if (!query) return [];
  var searchStr = (query || "").toString().trim().toLowerCase();
  var all = getPrescriptions();
  return all.filter(function(item) {
    return (item.PrescriptionID && (item.PrescriptionID || "").toString().trim().toLowerCase().includes(searchStr)) ||
           (item.CustomerID && (item.CustomerID || "").toString().trim().toLowerCase().includes(searchStr)) ||
           (item.DoctorName && (item.DoctorName || "").toString().trim().toLowerCase().includes(searchStr)) ||
           (item.Complaint && (item.Complaint || "").toString().trim().toLowerCase().includes(searchStr)) ||
           (item.Diagnosis && (item.Diagnosis || "").toString().trim().toLowerCase().includes(searchStr)) ||
           (item.Advice && (item.Advice || "").toString().trim().toLowerCase().includes(searchStr)) ||
           (item.Remarks && (item.Remarks || "").toString().trim().toLowerCase().includes(searchStr));
  });
}

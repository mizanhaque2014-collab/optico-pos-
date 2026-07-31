// ==========================================
// UTILS.GS - Helper Functions
// ==========================================
function safeTrim(val) {
  if (val === null || val === undefined) return "";
  return String(val).trim();
}

function getSheetByNameOrCreate(sheetName, defaultHeaders) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (defaultHeaders && defaultHeaders.length > 0) {
      sheet.appendRow(defaultHeaders);
      SpreadsheetApp.flush();
    }
  } else if (sheet.getLastColumn() === 0 && defaultHeaders) {
    sheet.appendRow(defaultHeaders);
    SpreadsheetApp.flush();
  }
  return sheet;
}

function getSheetHeaders(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) return [];
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
}

function normalizeKey(k) {
  return String(k).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function rowToObject(row, headers) {
  var obj = {};
  for (var i = 0; i < headers.length; i++) {
    var key = headers[i];
    var val = row[i];
    // Attempt JSON parse for objects/arrays if string
    if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
      try { val = JSON.parse(val); } catch(e) {}
    }
    obj[key] = val;
    // Map a camelCase version for convenience
    var ccKey = key.charAt(0).toLowerCase() + key.slice(1);
    if (ccKey !== key) obj[ccKey] = val;
  }
  return obj;
}

function objectToRow(obj, headers) {
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    var key = headers[i];
    var normKey = normalizeKey(key);
    var val = "";
    
    if (obj[key] !== undefined) {
      val = obj[key];
    } else {
      for (var k in obj) {
        if (normalizeKey(k) === normKey) {
          val = obj[k];
          break;
        }
      }
    }
    
    if (typeof val === 'object') {
      val = JSON.stringify(val);
    }
    row.push(val !== undefined ? val : "");
  }
  return row;
}

function getAllRecords(sheetName) {
  var sheet = getSheetByNameOrCreate(sheetName);
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  var headers = getSheetHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return values.map(function(row) { return rowToObject(row, headers); });
}

function saveRecord(sheetName, idField, obj, generateIdPrefix) {
  var sheet = getSheetByNameOrCreate(sheetName);
  var headers = getSheetHeaders(sheet);
  
  var normIdField = normalizeKey(idField);
  var actualId = obj[idField];
  if (!actualId) {
    for (var k in obj) {
      if (normalizeKey(k) === normIdField) {
        actualId = obj[k];
        break;
      }
    }
  }

  if (!actualId) {
    actualId = (generateIdPrefix ? generateIdPrefix + "-" : "ID-") + Date.now() + Math.floor(Math.random()*1000);
    obj[idField] = actualId;
  }
  
  // ensure created / updated dates
  var createdDateFound = false;
  var updatedDateFound = false;
  for (var k in obj) {
    if (normalizeKey(k) === 'createddate' || normalizeKey(k) === 'createdat') createdDateFound = true;
    if (normalizeKey(k) === 'updateddate' || normalizeKey(k) === 'updatedat') {
      obj[k] = Date.now();
      updatedDateFound = true;
    }
  }
  
  if (!createdDateFound) obj.createdAt = Date.now();
  if (!updatedDateFound) obj.updatedAt = Date.now();

  var lastRow = sheet.getLastRow();
  var targetRow = -1;
  
  if (lastRow > 1) {
    var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    for (var i = 0; i < values.length; i++) {
      var rowObj = rowToObject(values[i], headers);
      var rowId = rowObj[idField];
      if (!rowId) {
        for (var kk in rowObj) {
          if (normalizeKey(kk) === normIdField) {
            rowId = rowObj[kk];
            break;
          }
        }
      }
      if (rowId && rowId.toString() === actualId.toString()) {
        targetRow = i + 2;
        break;
      }
    }
  }

  var rowData = objectToRow(obj, headers);
  if (targetRow !== -1) {
    sheet.getRange(targetRow, 1, 1, headers.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  SpreadsheetApp.flush();
  
  // Ensure the idField is set on return if it was generated
  obj[idField] = actualId;
  return obj;
}

function deleteRecord(sheetName, idField, id) {
  if (!id) throw new Error("ID is required to delete.");
  var sheet = getSheetByNameOrCreate(sheetName);
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;
  
  var headers = getSheetHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var normIdField = normalizeKey(idField);
  
  for (var i = 0; i < values.length; i++) {
    var rowObj = rowToObject(values[i], headers);
    var rowId = rowObj[idField];
    if (!rowId) {
      for (var kk in rowObj) {
        if (normalizeKey(kk) === normIdField) {
          rowId = rowObj[kk];
          break;
        }
      }
    }
    
    if (rowId && rowId.toString() === id.toString()) {
      sheet.deleteRow(i + 2);
      SpreadsheetApp.flush();
      return true;
    }
  }
  return false;
}

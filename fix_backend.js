const fs = require('fs');
let code = fs.readFileSync('public/backend-bundle.gs', 'utf8');

// We need to add CLIENT_SPREADSHEET_ID to CONFIG
if (!code.includes("CLIENT_SPREADSHEET_ID")) {
  code = code.replace(
    'var CONFIG = {',
    'var CONFIG = {\n  CLIENT_SPREADSHEET_ID: "YOUR_SPREADSHEET_ID_HERE", // REPLACE WITH ACTUAL SPREADSHEET ID\n'
  );
}

const newGetSheetByName = `function getSheetByNameOrCreate(sheetName, defaultHeaders) {
  if (!CONFIG.CLIENT_SPREADSHEET_ID || CONFIG.CLIENT_SPREADSHEET_ID === "YOUR_SPREADSHEET_ID_HERE") {
    throw new Error("CLIENT_SPREADSHEET_NOT_CONFIGURED");
  }
  
  var ss;
  try {
    ss = SpreadsheetApp.openById(CONFIG.CLIENT_SPREADSHEET_ID);
  } catch (e) {
    throw new Error("CLIENT_SPREADSHEET_ACCESS_FAILED");
  }
  
  if (!ss) {
    throw new Error("CLIENT_SPREADSHEET_ACCESS_FAILED");
  }
  
  var sheet = ss.getSheetByName(sheetName);
  
  // Required sheets validation
  var requiredSheets = [
    CONFIG.SHEETS.USERS,
    CONFIG.SHEETS.COMPANIES,
    CONFIG.SHEETS.BRANCHES,
    CONFIG.SHEETS.CUSTOMERS,
    CONFIG.SHEETS.PRESCRIPTIONS,
    CONFIG.SHEETS.EYE_TESTS,
    CONFIG.SHEETS.INVENTORY,
    CONFIG.SHEETS.INVOICES,
    CONFIG.SHEETS.SALES_ORDER_ITEMS,
    CONFIG.SHEETS.PAYMENTS,
    CONFIG.SHEETS.ACTIVITY_LOGS
  ];
  
  // Actually, wait, the instruction says:
  // "If a required sheet does not exist, return a clear error showing the missing sheet name."
  
  if (!sheet) {
    if (requiredSheets.indexOf(sheetName) !== -1) {
      throw new Error("MISSING_SHEET: " + sheetName);
    }
    
    // For other non-critical sheets, maybe create it?
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
}`;

// Replace the old getSheetByNameOrCreate
code = code.replace(/function getSheetByNameOrCreate\(sheetName, defaultHeaders\) \{[\s\S]*?return sheet;\n\}/, newGetSheetByName);

fs.writeFileSync('public/backend-bundle.gs', code);

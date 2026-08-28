const fs = require('fs');
let code = fs.readFileSync('/tmp/Code.gs', 'utf-8');

// Replace getSheetByNameOrCreate
const targetSheet = `function getSheetByNameOrCreate(sheetName, defaultHeaders) {
  if (!CONFIG.CLIENT_SPREADSHEET_ID || CONFIG.CLIENT_SPREADSHEET_ID === "YOUR_SPREADSHEET_ID_HERE") {
    throw new Error("CLIENT_SPREADSHEET_NOT_CONFIGURED");
  }`;

const replacementSheet = `function getSheetByNameOrCreate(sheetName, defaultHeaders) {
  if (!CONFIG.CLIENT_SPREADSHEET_ID || CONFIG.CLIENT_SPREADSHEET_ID === "YOUR_SPREADSHEET_ID_HERE") {
    throw new Error("CLIENT_SPREADSHEET_NOT_CONFIGURED");
  }
  
  var ss;
  try {
    ss = SpreadsheetApp.openById(CONFIG.CLIENT_SPREADSHEET_ID);
  } catch (e) {
    throw new Error("CLIENT_SPREADSHEET_ACCESS_FAILED");
  }
  if (!ss) throw new Error("CLIENT_SPREADSHEET_ACCESS_FAILED");
  
  var sheet = ss.getSheetByName(sheetName);
  var requiredSheets = [CONFIG.SHEETS.USERS, CONFIG.SHEETS.COMPANIES, CONFIG.SHEETS.BRANCHES, CONFIG.SHEETS.CUSTOMERS, CONFIG.SHEETS.PRESCRIPTIONS, CONFIG.SHEETS.EYE_TESTS, CONFIG.SHEETS.INVENTORY, CONFIG.SHEETS.INVOICES, CONFIG.SHEETS.SALES_ORDER_ITEMS, CONFIG.SHEETS.PAYMENTS, CONFIG.SHEETS.ACTIVITY_LOGS];
  
  var knownHeaders = {
    [CONFIG.SHEETS.INVOICES]: (typeof INVOICE_HEADERS !== 'undefined' ? INVOICE_HEADERS : ["InvoiceID", "InvoiceNumber", "InvoiceType", "CustomerID", "CompanyID", "BranchID", "PrescriptionID", "InvoiceDate", "GrandTotal", "Discount", "FinalAmount", "Advance", "Balance", "PaymentMode", "CashAmount", "CardAmount", "UPIAmount", "CardReference", "UPIReference", "BillingRemarks", "Status", "Items", "CreatedDate"]),
    [CONFIG.SHEETS.ACTIVITY_LOGS]: ["LogID", "Timestamp", "Action", "Username", "UserID", "CompanyID", "BranchID", "Role", "Details"],
    [CONFIG.SHEETS.DSR]: (typeof DSR_HEADERS !== 'undefined' ? DSR_HEADERS : ["DSR_ID", "ReportDate", "CompanyID", "BranchID", "DirectSales", "SalesOrders", "DeliveryCollections", "TotalBusiness", "CashCollected", "UpiCollected", "CardCollected", "PendingOrdersCount", "PendingOrdersValue", "PendingPaymentsCount", "PendingPaymentsValue", "GeneratedAt"]),
    [CONFIG.SHEETS.CUSTOMERS]: ["CustomerID", "FullName", "Mobile", "Email", "DOB", "Gender", "Address", "City", "State", "Pincode", "CreatedDate", "UpdatedDate", "Status"],
    [CONFIG.SHEETS.USERS]: ["UserID", "CompanyID", "BranchID", "FullName", "Username", "Password", "Role", "Mobile", "Email", "Status", "CreatedDate"]
  };

  var fallbackHeaders = defaultHeaders || knownHeaders[sheetName];

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (fallbackHeaders && fallbackHeaders.length > 0) {
      sheet.appendRow(fallbackHeaders);
      SpreadsheetApp.flush();
    }
  } else if (sheet.getLastColumn() === 0) {
    if (fallbackHeaders && fallbackHeaders.length > 0) {
      sheet.appendRow(fallbackHeaders);
      SpreadsheetApp.flush();
    } else {
      throw new Error("The rowContents passed to appendRow() must not be empty. Sheet is empty and no headers provided for: " + sheetName);
    }
  }
  return sheet;
}`;

// I need to find where getSheetByNameOrCreate ends and replace it entirely.
// Let's use regex
code = code.replace(/function getSheetByNameOrCreate[\s\S]*?return sheet;\n}/, replacementSheet);

// Replace filterByAuth
const replacementAuth = `function filterByAuth(records, auth) {
  if (!auth) return records; 
  if (auth.role === 'SUPER_ADMIN') return records;
  
  var authComp = String(auth.companyID || '').trim() || 'COMP-default';
  var authBranch = String(auth.branchID || '').trim() || 'BR-default';
  
  return records.filter(function(r) {
    var recCompRaw = r.CompanyID || r.companyID || r.companyId;
    var recBranchRaw = r.BranchID || r.branchID || r.branchId;
    
    // If record doesn't have company/branch fields, assume global
    if (recCompRaw === undefined && recBranchRaw === undefined) return true;
    
    var recComp = String(recCompRaw || '').trim() || 'COMP-default';
    var recBranch = String(recBranchRaw || '').trim() || 'BR-default';
    
    // Check Company
    if (recComp !== 'ALL' && authComp !== 'ALL' && recComp !== authComp) return false;
    
    // Check Branch
    if (authBranch !== 'ALL' && recBranch !== 'ALL' && recBranch !== authBranch) return false;
        
    return true;
  });
}`;
code = code.replace(/function filterByAuth[\s\S]*?return records\.filter[\s\S]*?\}\);\n\}/, replacementAuth);

fs.writeFileSync('FinalCode.gs', code);
console.log("Generated FinalCode.gs successfully.");

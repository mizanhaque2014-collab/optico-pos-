const fs = require('fs');
let code = fs.readFileSync('Code.gs', 'utf-8');

// We will replace getSheetByNameOrCreate to automatically find headers if not passed
const target = `  if (!sheet) {
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

const replacement = `  var knownHeaders = {
    [CONFIG.SHEETS.INVOICES]: (typeof INVOICE_HEADERS !== 'undefined' ? INVOICE_HEADERS : ["InvoiceID", "InvoiceNumber", "InvoiceType", "CustomerID", "CompanyID", "BranchID", "PrescriptionID", "InvoiceDate", "GrandTotal", "Discount", "FinalAmount", "Advance", "Balance", "PaymentMode", "CashAmount", "CardAmount", "UPIAmount", "CardReference", "UPIReference", "BillingRemarks", "Status", "Items", "CreatedDate"]),
    [CONFIG.SHEETS.ACTIVITY_LOGS]: ["LogID", "Timestamp", "Action", "Username", "UserID", "CompanyID", "BranchID", "Role", "Details"],
    [CONFIG.SHEETS.DSR]: (typeof DSR_HEADERS !== 'undefined' ? DSR_HEADERS : ["DSR_ID", "ReportDate", "CompanyID", "BranchID", "DirectSales", "SalesOrders", "DeliveryCollections", "TotalBusiness", "CashCollected", "UpiCollected", "CardCollected", "PendingOrdersCount", "PendingOrdersValue", "PendingPaymentsCount", "PendingPaymentsValue", "GeneratedAt"]),
    [CONFIG.SHEETS.CUSTOMERS]: ["CustomerID", "FullName", "Mobile", "Email", "DOB", "Gender", "Address", "City", "State", "Pincode", "CreatedDate", "UpdatedDate", "Status"],
    [CONFIG.SHEETS.USERS]: ["UserID", "CompanyID", "BranchID", "FullName", "Username", "Password", "Role", "Mobile", "Email", "Status", "CreatedDate"]
  };

  var fallbackHeaders = defaultHeaders || knownHeaders[sheetName];

  if (!sheet) {
    if (requiredSheets.indexOf(sheetName) !== -1) {
      throw new Error("MISSING_SHEET: " + sheetName);
    }
    
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

code = code.replace(target, replacement);
fs.writeFileSync('Code.gs', code);
console.log("Patched successfully");

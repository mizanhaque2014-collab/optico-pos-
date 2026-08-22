// ==========================================
// ACTIVITYLOGS.GS
// ==========================================
var LOG_HEADERS = ["LogID", "Timestamp", "Action", "UserID", "Details"];

function logActivity(log) {
  return saveRecord(CONFIG.SHEETS.ACTIVITY_LOGS, "LogID", log, "LOG");
}

function getActivityLogs() {
  getSheetByNameOrCreate(CONFIG.SHEETS.ACTIVITY_LOGS, LOG_HEADERS);
  return getAllRecords(CONFIG.SHEETS.ACTIVITY_LOGS);
}
function logBackend(msg, data) {
  try {
    var details = typeof data === 'object' ? JSON.stringify(data) : (data || "");
    logActivity({ Action: msg, Details: details });
  } catch(e) {}
}// ==========================================
// BRANCHES.GS
// ==========================================
var BRANCH_HEADERS = ["BranchID", "CompanyID", "BranchName", "Address", "Mobile", "Email", "Status", "CreatedAt", "UpdatedAt"];

function getBranches() {
  getSheetByNameOrCreate(CONFIG.SHEETS.BRANCHES, BRANCH_HEADERS);
  return getAllRecords(CONFIG.SHEETS.BRANCHES);
}

function createBranch(b) { return saveRecord(CONFIG.SHEETS.BRANCHES, "BranchID", b, "BR"); }
function updateBranch(b) { return saveRecord(CONFIG.SHEETS.BRANCHES, "BranchID", b, "BR"); }
function deleteBranch(id) { return deleteRecord(CONFIG.SHEETS.BRANCHES, "BranchID", id); }
function getBranchById(id) {
  var all = getBranches();
  return all.find(function(b) { return b.BranchID === id || b.id === id; });
}// ==========================================
// CODE.GS - Main Router
// ==========================================
var GLOBAL_PAYLOAD = null;
function doPost(e) {
  try {
    var payload;
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
      GLOBAL_PAYLOAD = payload;
    } else {
      payload = e.parameter;
      GLOBAL_PAYLOAD = payload;
    }
    
    var action = payload.action || e.parameter.action;
    var result;
    
    switch (action) {
      // CUSTOMERS
      case 'createCustomer': result = createCustomer(payload.customer || payload); break;
      case 'updateCustomer': result = updateCustomer(payload.customer || payload); break;
      case 'getCustomers': result = getCustomers(); break;
      case 'getCustomerById': result = getCustomerById(payload.customerId || payload.id); break;
      case 'searchCustomerByMobile': result = searchCustomerByMobile(payload.mobile); break;
      case 'searchCustomerByName': result = searchCustomerByName(payload.name); break;
      case 'loadCustomerHistory': result = loadCustomerHistory(payload.customerId); break;
      
      // COMPANIES
      case 'getCompanies': result = getCompanies(); break;
      case 'createCompany': result = createCompany(payload.company || payload); break;
      case 'updateCompany': result = updateCompany(payload.company || payload); break;
      case 'deleteCompany': result = deleteCompany(payload.companyId || payload.id); break;
      case 'getCompanyById': result = getCompanyById(payload.companyId || payload.id); break;
      
      // BRANCHES
      case 'getBranches': result = getBranches(); break;
      case 'createBranch': result = createBranch(payload.branch || payload); break;
      case 'updateBranch': result = updateBranch(payload.branch || payload); break;
      case 'deleteBranch': result = deleteBranch(payload.branchId || payload.id); break;
      case 'getBranchById': result = getBranchById(payload.branchId || payload.id); break;
      
      // USERS
      case 'getUsers': result = getUsers(); break;
      case 'createUser': result = createUser(payload.user || payload); break;
      case 'updateUser': result = updateUser(payload.user || payload); break;
      case 'deleteUser': result = deleteUser(payload.userId || payload.id); break;
      case 'getUserById': result = getUserById(payload.userId || payload.id); break;
      
      // PRESCRIPTIONS
      case 'getPrescriptions': result = getPrescriptions(); break;
      case 'createPrescription': result = createPrescription(payload.prescription || payload); break;
      case 'updatePrescription': result = updatePrescription(payload.prescription || payload); break;
      case 'deletePrescription': result = deletePrescription(payload.prescriptionId || payload.id); break;
      case 'getPrescriptionById': result = getPrescriptionById(payload.prescriptionId || payload.id); break;
      case 'getPrescriptionsByCustomer': result = getPrescriptionsByCustomer(payload.customerId); break;
      
      // EYE TESTS
      case 'saveEyeTest': result = saveEyeTest(payload.eyeTestDetails || payload.eyeTest || payload); break;
      case 'loadEyeTests': result = loadEyeTests(payload.customerId); break;
      
      // INVENTORY
      case 'getInventory': result = getInventory(); break;
      case 'saveInventory': result = saveInventory(payload.inventoryItem || payload); break;
      case 'createInventory': result = saveInventory(payload.inventoryItem || payload); break;
      case 'updateInventory': result = saveInventory(payload.inventoryItem || payload); break;
      case 'deleteInventory': result = deleteInventory(payload.inventoryItemId || payload.id); break;
      
      // INVOICES & SALES ORDERS
      case 'getInvoices': result = getInvoices(); break;
      case 'createInvoice':
      case 'updateInvoice':
      case 'saveInvoice': 
      case 'saveSalesOrder':
      case 'saveDeliveryCollection':
        result = saveInvoice(payload.invoice || payload.salesOrder || payload); 
        break;
      case 'deleteInvoice': result = deleteInvoice(payload.invoiceId || payload.id); break;
      case 'getInvoiceById': result = getInvoiceById(payload.invoiceId || payload.id); break;
      case 'getInvoicesByCustomer': result = getInvoicesByCustomer(payload.customerId); break;
      case 'searchInvoices': result = searchInvoices(payload.keyword || payload.search); break;
      case 'getDailySalesReport': result = getDailySalesReport(payload.companyId, payload.branchId, payload.startDate, payload.endDate); break;
      
      // PAYMENTS
      case 'savePayment': result = savePayment(payload.payment || payload); break;
      case 'getPayments': result = getPayments(payload.customerId); break;
      
      // ACTIVITY LOGS
      case 'logActivity': result = logActivity(payload.log || payload); break;
      case 'getActivityLogs': result = getActivityLogs(); break;
      
      default:
        throw new Error("Unsupported action: " + action);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: result
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message || error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var action = e.parameter.action;
    var result;
    
    switch (action) {
      case 'getCustomers': result = getCustomers(); break;
      case 'getCompanies': result = getCompanies(); break;
      case 'getBranches': result = getBranches(); break;
      case 'getUsers': result = getUsers(); break;
      case 'getInventory': result = getInventory(); break;
      case 'getInvoices': result = getInvoices(); break;
      case 'getPrescriptions': result = getPrescriptions(); break;
      default:
        throw new Error("Unsupported GET action: " + action);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: result
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message || error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}// ==========================================
// COMPANIES.GS
// ==========================================
var COMPANY_HEADERS = ["CompanyID", "CompanyName", "OwnerName", "Mobile", "Email", "Status", "CreatedAt", "UpdatedAt"];

function getCompanies() {
  getSheetByNameOrCreate(CONFIG.SHEETS.COMPANIES, COMPANY_HEADERS);
  return getAllRecords(CONFIG.SHEETS.COMPANIES);
}

function createCompany(c) { return saveRecord(CONFIG.SHEETS.COMPANIES, "CompanyID", c, "COMP"); }
function updateCompany(c) { return saveRecord(CONFIG.SHEETS.COMPANIES, "CompanyID", c, "COMP"); }
function deleteCompany(id) { return deleteRecord(CONFIG.SHEETS.COMPANIES, "CompanyID", id); }
function getCompanyById(id) {
  var all = getCompanies();
  return all.find(function(c) { return c.CompanyID === id || c.id === id; });
}// ==========================================
// CONFIG.GS - Global Configuration
// ==========================================
var CONFIG = {
  CLIENT_SPREADSHEET_ID: "1K3w15Cl41LauOWB3KyFdalbKvqpX6DBWeTeRhgV6R8o", // REPLACE WITH ACTUAL SPREADSHEET ID

  SHEETS: {
    COMPANIES: "Companies",
    BRANCHES: "Branches",
    USERS: "Users",
    CUSTOMERS: "Customers",
    PRESCRIPTIONS: "Prescriptions",
    EYE_TESTS: "EyeTests",
    INVENTORY: "Inventory",
    INVOICES: "Invoices",
    SALES_ORDER_ITEMS: "SalesOrderItems",
    PAYMENTS: "Payments",
    ACTIVITY_LOGS: "ActivityLogs"
  }
};// ==========================================
// CUSTOMERS.GS
// ==========================================
var CUSTOMER_HEADERS = ["id", "name", "mobile", "dob", "address", "gender", "createdAt", "updatedAt"];

function getCustomers() {
  getSheetByNameOrCreate(CONFIG.SHEETS.CUSTOMERS, CUSTOMER_HEADERS);
  return getAllRecords(CONFIG.SHEETS.CUSTOMERS);
}

function createCustomer(c) {
  return saveRecord(CONFIG.SHEETS.CUSTOMERS, "id", c, "CUST");
}

function updateCustomer(c) {
  return saveRecord(CONFIG.SHEETS.CUSTOMERS, "id", c, "CUST");
}

function getCustomerById(id) {
  var all = getCustomers();
  return all.find(function(c) { return c.id === id; });
}

function searchCustomerByMobile(mobile) {
  var all = getCustomers();
  var q = String(mobile).trim();
  return all.filter(function(c) { return String(c.mobile).includes(q); });
}

function searchCustomerByName(name) {
  var all = getCustomers();
  var q = String(name).toLowerCase().trim();
  return all.filter(function(c) { return String(c.name).toLowerCase().includes(q); });
}

function loadCustomerHistory(customerId) {
  var customer = getCustomerById(customerId);
  if (!customer) throw new Error("Customer not found");
  
  return {
    customer: customer,
    prescriptions: getPrescriptionsByCustomer(customerId),
    eyeTests: loadEyeTests(customerId),
    invoices: getInvoicesByCustomer(customerId),
    payments: getPayments(customerId)
  };
}// ==========================================
// DASHBOARD.GS
// ==========================================
// Implement dashboard stats logic here// ==========================================
// EYETESTS.GS
// ==========================================
var EYETEST_HEADERS = ["id", "customerId", "companyId", "branchId", "eyeTestDate", "optometristName", "sphOd", "cylOd", "axisOd", "sphOs", "cylOs", "axisOs", "addPower", "pdDistance", "pdNear", "remarks", "createdAt"];

function loadEyeTests(customerId) {
  getSheetByNameOrCreate(CONFIG.SHEETS.EYE_TESTS, EYETEST_HEADERS);
  var all = getAllRecords(CONFIG.SHEETS.EYE_TESTS);
  return all.filter(function(et) { return et.customerId === customerId || et.CustomerID === customerId; });
}

function saveEyeTest(et) {
  return saveRecord(CONFIG.SHEETS.EYE_TESTS, "id", et, "ET");
}// ==========================================
// INVENTORY.GS
// ==========================================

var INV_HEADERS = ["StockID", "CompanyID", "BranchID", "Category", "Brand", "Model", "Quantity", "Barcode", "PurchasePrice", "SellingPrice", "CreatedAt"];

function syncInventoryHeaders() {
  var sheet = getSheetByNameOrCreate(CONFIG.SHEETS.INVENTORY, INV_HEADERS);
  var currentHeaders = getSheetHeaders(sheet);
  var missingHeaders = [];
  
  for (var i = 0; i < INV_HEADERS.length; i++) {
    var found = false;
    for (var j = 0; j < currentHeaders.length; j++) {
      if (normalizeKey(INV_HEADERS[i]) === normalizeKey(currentHeaders[j]) || 
         (normalizeKey(INV_HEADERS[i]) === 'inventoryid' && normalizeKey(currentHeaders[j]) === 'stockid')) {
        found = true;
        break;
      }
    }
    if (!found) {
      missingHeaders.push(INV_HEADERS[i]);
    }
  }
  
  if (missingHeaders.length > 0) {
    var lastCol = sheet.getLastColumn();
    if (lastCol === 0) lastCol = 1;
    sheet.getRange(1, lastCol + 1, 1, missingHeaders.length).setValues([missingHeaders]);
    SpreadsheetApp.flush();
  }
}

function getInventory() {
  syncInventoryHeaders();
  return getAllRecords(CONFIG.SHEETS.INVENTORY);
}

function saveInventory(item) {
  syncInventoryHeaders();
  var sheet = getSheetByNameOrCreate(CONFIG.SHEETS.INVENTORY, INV_HEADERS);
  var headers = getSheetHeaders(sheet);
  
  var hasStockID = false;
  for (var i = 0; i < headers.length; i++) {
    if (normalizeKey(headers[i]) === 'stockid') {
      hasStockID = true;
      break;
    }
  }
  
  var idField = hasStockID ? "StockID" : "InventoryID";
  
  if (item.id) {
    item[idField] = item.id;
  }
  
  if (typeof item.modelNumber !== 'undefined' && typeof item.Model === 'undefined') item.Model = item.modelNumber;
  if (typeof item.barcode !== 'undefined' && typeof item.Barcode === 'undefined') item.Barcode = item.barcode;
  if (typeof item.purchasePrice !== 'undefined' && typeof item.PurchasePrice === 'undefined') item.PurchasePrice = item.purchasePrice;
  if (typeof item.sellingPrice !== 'undefined' && typeof item.SellingPrice === 'undefined') item.SellingPrice = item.sellingPrice;
  if (typeof item.supplierName !== 'undefined' && typeof item.SupplierName === 'undefined') item.SupplierName = item.supplierName;
  if (typeof item.purchaseDate !== 'undefined' && typeof item.PurchaseDate === 'undefined') item.PurchaseDate = item.purchaseDate;
  if (typeof item.remarks !== 'undefined' && typeof item.Remarks === 'undefined') item.Remarks = item.remarks;
  if (typeof item.branch !== 'undefined' && typeof item.BranchID === 'undefined') item.BranchID = item.branch;
  if (typeof item.quantity !== 'undefined' && typeof item.Quantity === 'undefined') item.Quantity = item.quantity;
  
  return saveRecord(CONFIG.SHEETS.INVENTORY, idField, item, "INVITEM"); 
}

function deleteInventory(id) {
  syncInventoryHeaders();
  var sheet = getSheetByNameOrCreate(CONFIG.SHEETS.INVENTORY, INV_HEADERS);
  var headers = getSheetHeaders(sheet);
  
  var hasStockID = false;
  for (var i = 0; i < headers.length; i++) {
    if (normalizeKey(headers[i]) === 'stockid') {
      hasStockID = true;
      break;
    }
  }
  var idField = hasStockID ? "StockID" : "InventoryID";
  return deleteRecord(CONFIG.SHEETS.INVENTORY, idField, id);
}// ==========================================
// INVOICES.GS
// ==========================================
var INVOICE_HEADERS = ["InvoiceID", "InvoiceNumber", "InvoiceType", "CustomerID", "CompanyID", "BranchID", "PrescriptionID", "InvoiceDate", "GrandTotal", "Discount", "FinalAmount", "Advance", "Balance", "PaymentMode", "CashAmount", "CardAmount", "UPIAmount", "CardReference", "UPIReference", "BillingRemarks", "Status", "Items", "CreatedDate"];

function getInvoices() {
  getSheetByNameOrCreate(CONFIG.SHEETS.INVOICES, INVOICE_HEADERS);
  var all = getAllRecords(CONFIG.SHEETS.INVOICES);
  // Parse Items back into objects if they are strings
  return all.map(function(inv) {
    if (typeof inv.Items === 'string' && (inv.Items.startsWith('[') || inv.Items.startsWith('{'))) {
      try { inv.items = JSON.parse(inv.Items); } catch(e) { inv.items = []; }
    } else {
      inv.items = inv.Items || [];
    }
    return inv;
  });
}

function saveInvoice(inv) {
  // Ensure items are serialized
  if (inv.items && typeof inv.items !== 'string') {
    inv.Items = JSON.stringify(inv.items);
  }
  if (inv.Items && typeof inv.Items !== 'string') {
    inv.Items = JSON.stringify(inv.Items);
  }
  
  if (!inv.InvoiceNumber) {
    inv.InvoiceNumber = "INV-" + Date.now();
  }
  if (!inv.InvoiceID) {
    inv.InvoiceID = inv.id || "INVID-" + Date.now();
  }
  
  return saveRecord(CONFIG.SHEETS.INVOICES, "InvoiceID", inv, "INVID");
}

function deleteInvoice(id) { return deleteRecord(CONFIG.SHEETS.INVOICES, "InvoiceID", id); }

function getInvoiceById(id) {
  var all = getInvoices();
  return all.find(function(inv) { return inv.InvoiceID === id || inv.id === id; });
}

function getInvoicesByCustomer(customerId) {
  var all = getInvoices();
  return all.filter(function(inv) { return inv.CustomerID === customerId || inv.customerId === customerId; });
}

function searchInvoices(keyword) {
  if (!keyword) return getInvoices();
  var q = String(keyword).toLowerCase();
  var all = getInvoices();
  return all.filter(function(inv) { 
    return (inv.InvoiceNumber && inv.InvoiceNumber.toLowerCase().includes(q)) || 
           (inv.PrescriptionID && inv.PrescriptionID.toLowerCase().includes(q));
  });
}// ==========================================
// LICENSE.GS
// ==========================================
// License validation// ==========================================
// PAYMENTS.GS
// ==========================================
var PAYMENT_HEADERS = ["PaymentID", "InvoiceID", "CustomerID", "Amount", "PaymentMode", "PaymentDate", "Remarks", "CreatedAt"];

function getPayments(customerId) {
  getSheetByNameOrCreate(CONFIG.SHEETS.PAYMENTS, PAYMENT_HEADERS);
  var all = getAllRecords(CONFIG.SHEETS.PAYMENTS);
  if (customerId) {
    return all.filter(function(p) { return p.CustomerID === customerId || p.customerId === customerId; });
  }
  return all;
}

function savePayment(payment) {
  return saveRecord(CONFIG.SHEETS.PAYMENTS, "PaymentID", payment, "PAY");
}// ==========================================
// PRESCRIPTIONS.GS
// ==========================================
var PRE_HEADERS = ["PrescriptionID", "CustomerID", "CompanyID", "BranchID", "DoctorName", "ExamDate", "Complaint", "Diagnosis", "Advice", "Remarks", "OD_Distance_SPH", "OD_Distance_CYL", "OD_Distance_AXIS", "OS_Distance_SPH", "OS_Distance_CYL", "OS_Distance_AXIS", "AddPower", "PD_Distance", "PD_Near", "Source", "CreatedDate"];

function getPrescriptions() {
  getSheetByNameOrCreate(CONFIG.SHEETS.PRESCRIPTIONS, PRE_HEADERS);
  return getAllRecords(CONFIG.SHEETS.PRESCRIPTIONS);
}

function createPrescription(p) { return saveRecord(CONFIG.SHEETS.PRESCRIPTIONS, "PrescriptionID", p, "PRE"); }
function updatePrescription(p) { return saveRecord(CONFIG.SHEETS.PRESCRIPTIONS, "PrescriptionID", p, "PRE"); }
function deletePrescription(id) { return deleteRecord(CONFIG.SHEETS.PRESCRIPTIONS, "PrescriptionID", id); }
function getPrescriptionById(id) {
  var all = getPrescriptions();
  return all.find(function(p) { return p.PrescriptionID === id || p.id === id; });
}
function getPrescriptionsByCustomer(customerId) {
  var all = getPrescriptions();
  return all.filter(function(p) { return p.CustomerID === customerId || p.customerId === customerId; });
}// ==========================================
// REPORTS.GS
// ==========================================
// Implement report generation logic here// ==========================================
// SALESORDERS.GS (Now handled via Invoices.gs using InvoiceType)
// ==========================================
// Kept for modularity. Any specialized sales order logic can go here.// ==========================================
// SETTINGS.GS
// ==========================================
// Application settings// ==========================================
// USERS.GS
// ==========================================
var USER_HEADERS = ["UserID", "CompanyID", "BranchID", "FullName", "Username", "Password", "Role", "Mobile", "Email", "Status", "CreatedDate"];

function getUsers() {
  getSheetByNameOrCreate(CONFIG.SHEETS.USERS, USER_HEADERS);
  return getAllRecords(CONFIG.SHEETS.USERS);
}

function createUser(u) { return saveRecord(CONFIG.SHEETS.USERS, "UserID", u, "USR"); }
function updateUser(u) { return saveRecord(CONFIG.SHEETS.USERS, "UserID", u, "USR"); }
function deleteUser(id) { return deleteRecord(CONFIG.SHEETS.USERS, "UserID", id); }
function getUserById(id) {
  var all = getUsers();
  return all.find(function(u) { return u.UserID === id || u.id === id; });
}// ==========================================
// UTILS.GS - Helper Functions
// ==========================================
function safeTrim(val) {
  if (val === null || val === undefined) return "";
  return String(val).trim();
}

function getSheetByNameOrCreate(sheetName, defaultHeaders) {
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


function filterByAuth(records, auth) {
  if (!auth) return records; // No auth info provided, return as is (or return [] if strictly enforcing)
  
  if (auth.role === 'SUPER_ADMIN') return records;
  
  return records.filter(function(r) {
    var recComp = r.CompanyID || r.companyID || r.companyId;
    var recBranch = r.BranchID || r.branchID || r.branchId;
    
    // If record doesn't have company/branch fields, assume global (e.g. settings)
    if (recComp === undefined && recBranch === undefined) return true;
    
    // Check Company
    if (recComp !== undefined && String(recComp).trim() !== '' && String(recComp) !== String(auth.companyID)) return false;
    
    // Check Branch (COMPANY_ADMIN can see all branches in their company IF they select ALL, otherwise they see the specific branch)
    if (auth.branchID !== 'ALL' && recBranch !== undefined && String(recBranch).trim() !== '' && String(recBranch) !== String(auth.branchID)) {
       // Wait, some records (like companies, users, customers) might not be branch-specific or belong to multiple.
       // Usually, branch-specific data has BranchID.
       if (recBranch && String(recBranch) !== String(auth.branchID)) return false;
    }
    
    return true;
  });
}

function getAllRecords(sheetName) {
  var sheet = getSheetByNameOrCreate(sheetName);
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  var headers = getSheetHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var records = values.map(function(row) { return rowToObject(row, headers); });
  return (typeof GLOBAL_PAYLOAD !== 'undefined' && GLOBAL_PAYLOAD !== null && GLOBAL_PAYLOAD.__auth) ? filterByAuth(records, GLOBAL_PAYLOAD.__auth) : records;
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
// ==========================================
// WHATSAPP.GS
// ==========================================
// WhatsApp API integrations

function getDailySalesReport(companyId, branchId, startDate, endDate) {
  var allInvoices = getInvoices();
  var filteredInvoices = [];
  var start = startDate ? new Date(startDate).getTime() : 0;
  var end = endDate ? new Date(endDate).getTime() : Number.MAX_SAFE_INTEGER;
  
  for (var i = 0; i < allInvoices.length; i++) {
    var inv = allInvoices[i];
    
    // Company Filter
    if (companyId && companyId !== 'ALL') {
      var invComp = inv.CompanyID || inv.companyId;
      if (invComp && String(invComp).trim() !== String(companyId).trim()) continue;
    }
    
    // Branch Filter
    if (branchId && branchId !== 'ALL') {
      var invBranch = inv.BranchID || inv.branchId;
      if (invBranch && String(invBranch).trim() !== String(branchId).trim()) continue;
    }
    
    // Date Filter (using CreatedDate or InvoiceDate)
    var dStr = inv.CreatedDate || inv.InvoiceDate || inv.CreatedAt;
    var dTime = dStr ? new Date(dStr).getTime() : 0;
    
    if (dTime >= start && dTime <= end) {
      filteredInvoices.push(inv);
    }
  }
  
  // To strictly follow the "calculate the report from existing sheets" we can return both.
  // The frontend calculates everything properly if we just return the invoices.
  return {
    invoices: filteredInvoices
  };
}

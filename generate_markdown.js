const fs = require('fs');

const utilsCode = `
// ==========================================
// Utils.gs
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
`;

const configCode = `
// ==========================================
// Config.gs
// ==========================================
var CONFIG = {
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
};
`;

const codeCode = `
// ==========================================
// Code.gs
// ==========================================
function doPost(e) {
  try {
    var payload;
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter;
    }
    
    var action = payload.action || e.parameter.action;
    var result;
    
    switch (action) {
      // CUSTOMERS
      case 'createCustomer': result = createCustomer(payload.customer || payload); break;
      case 'updateCustomer': result = updateCustomer(payload.customer || payload); break;
      case 'getCustomers': result = getCustomers(); break;
      case 'getCustomerById': result = getCustomerById(payload.customerId || payload.id); break;
      case 'searchCustomerByMobile': result = searchCustomerByMobile(payload.mobile || e.parameter.mobile); break;
      case 'searchCustomerByName': result = searchCustomerByName(payload.name || e.parameter.name); break;
      case 'loadCustomerHistory': result = loadCustomerHistory(payload.customerId || payload.id); break;
      case 'saveCustomer':
        var cust = payload.customer || payload;
        if (cust.id) {
          result = updateCustomer(cust);
        } else {
          result = createCustomer(cust);
        }
        break;

      // COMPANIES
      case 'getCompanies': result = getCompanies(); break;
      case 'createCompany': result = createCompany(payload.company || payload); break;
      case 'updateCompany': result = updateCompany(payload.company || payload); break;
      case 'deleteCompany': result = deleteCompany(payload.companyId || payload.id); break;
      case 'getCompanyById': result = getCompanyById(payload.companyId || payload.id); break;
      case 'searchCompany': result = searchCompany(payload.query || e.parameter.query); break;

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
      case 'searchUser': result = searchUser(payload.query || e.parameter.query); break;

      // PRESCRIPTIONS
      case 'getPrescriptions': result = getPrescriptions(); break;
      case 'createPrescription': result = createPrescription(payload.prescription || payload); break;
      case 'updatePrescription': result = updatePrescription(payload.prescription || payload); break;
      case 'deletePrescription': result = deletePrescription(payload.prescriptionId || payload.id); break;
      case 'getPrescriptionById': result = getPrescriptionById(payload.prescriptionId || payload.id); break;
      case 'getPrescriptionsByCustomer': result = getPrescriptionsByCustomer(payload.customerId || payload.CustomerID || e.parameter.customerId); break;
      case 'searchPrescription': result = searchPrescription(payload.query || e.parameter.query); break;
      
      // EYE TESTS
      case 'saveEyeTest': result = saveEyeTest(payload.eyeTestDetails || payload.eyeTest || payload); break;
      case 'loadEyeTests': result = loadEyeTests(payload.customerId || e.parameter.customerId); break;
      
      // INVENTORY
      case 'getInventory': result = getInventory(); break;
      case 'saveInventory': result = saveInventory(payload.inventoryItem || payload); break;
      case 'createInventory': result = saveInventory(payload.inventoryItem || payload); break;
      case 'updateInventory': result = saveInventory(payload.inventoryItem || payload); break;
      case 'deleteInventory': result = deleteInventory(payload.inventoryItemId || payload.id); break;
      case 'searchInventory': result = searchInventory(payload.query || e.parameter.query); break;

      // INVOICES & SALES ORDERS
      case 'getInvoices': result = getInvoices(); break;
      case 'createInvoice':
      case 'updateInvoice':
      case 'saveInvoice': 
      case 'saveSalesOrder':
      case 'saveDeliveryCollection':
        result = saveInvoice(payload.invoice || payload.salesOrder || payload); 
        break;
      case 'deleteInvoice': result = deleteInvoice(payload.invoiceId || payload.InvoiceID || payload.id); break;
      case 'getInvoiceById': result = getInvoiceById(payload.invoiceId || payload.InvoiceID || payload.id); break;
      case 'getInvoicesByCustomer': result = getInvoicesByCustomer(payload.customerId || payload.CustomerID || e.parameter.customerId); break;
      case 'searchInvoices': result = searchInvoices(payload.keyword || payload.search || payload.query); break;
      
      case 'saveInvoiceItem':
        var invs = getInvoices();
        var invId = payload.invoiceId || payload.InvoiceID;
        var foundInv = invs.find(function(i) { return i.id === invId || i.InvoiceID === invId; });
        if (foundInv) {
          foundInv.items = payload.items;
          result = saveInvoice(foundInv);
        } else {
          result = {};
        }
        break;

      // PAYMENTS
      case 'savePayment': result = savePayment(payload.payment || payload); break;
      case 'getPayments': result = getPayments(payload.customerId || e.parameter.customerId); break;
      
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
      case 'getCustomerById': result = getCustomerById(e.parameter.customerId || e.parameter.id); break;
      case 'searchCustomerByMobile': result = searchCustomerByMobile(e.parameter.mobile); break;
      case 'searchCustomerByName': result = searchCustomerByName(e.parameter.name); break;

      case 'getCompanies': result = getCompanies(); break;
      case 'getCompanyById': result = getCompanyById(e.parameter.companyId || e.parameter.id); break;

      case 'getBranches': result = getBranches(); break;
      case 'getBranchById': result = getBranchById(e.parameter.branchId || e.parameter.id); break;

      case 'getUsers': result = getUsers(); break;
      case 'getUserById': result = getUserById(e.parameter.userId || e.parameter.id); break;

      case 'getInventory': result = getInventory(); break;
      case 'searchInventory': result = searchInventory(e.parameter.query); break;

      case 'getInvoices': result = getInvoices(); break;
      case 'getInvoiceById': result = getInvoiceById(e.parameter.invoiceId || e.parameter.id); break;
      case 'getInvoicesByCustomer': result = getInvoicesByCustomer(e.parameter.customerId || e.parameter.CustomerID); break;
      case 'searchInvoices': result = searchInvoices(e.parameter.keyword || e.parameter.search); break;

      case 'getPrescriptions': result = getPrescriptions(); break;
      case 'getPrescriptionById': result = getPrescriptionById(e.parameter.prescriptionId || e.parameter.id); break;
      case 'getPrescriptionsByCustomer': result = getPrescriptionsByCustomer(e.parameter.customerId || e.parameter.CustomerID); break;
      case 'searchPrescription': result = searchPrescription(e.parameter.keyword || e.parameter.search); break;

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
}
`;

const customersCode = `
// ==========================================
// Customers.gs
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
  return all.find(function(c) { return c.id === id || c.ID === id; });
}

function searchCustomerByMobile(mobile) {
  if (!mobile) return [];
  var all = getCustomers();
  var q = String(mobile).trim();
  return all.filter(function(c) { return String(c.mobile).includes(q); });
}

function searchCustomerByName(name) {
  if (!name) return [];
  var all = getCustomers();
  var q = String(name).toLowerCase().trim();
  return all.filter(function(c) { return String(c.name).toLowerCase().includes(q); });
}

function loadCustomerHistory(customerId) {
  var customer = getCustomerById(customerId);
  if (!customer) throw new Error("Customer not found with id: " + customerId);
  
  return {
    customer: customer,
    prescriptions: getPrescriptionsByCustomer(customerId),
    eyeTests: loadEyeTests(customerId),
    invoices: getInvoicesByCustomer(customerId),
    payments: getPayments(customerId)
  };
}
`;

const companiesCode = `
// ==========================================
// Companies.gs
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
  return all.find(function(c) { return c.CompanyID === id || c.id === id || c.companyId === id; });
}
function searchCompany(query) {
  if (!query) return getCompanies();
  var q = String(query).toLowerCase().trim();
  var all = getCompanies();
  return all.filter(function(c) {
    return (c.CompanyName && String(c.CompanyName).toLowerCase().includes(q)) || 
           (c.companyName && String(c.companyName).toLowerCase().includes(q));
  });
}
`;

const branchesCode = `
// ==========================================
// Branches.gs
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
  return all.find(function(b) { return b.BranchID === id || b.id === id || b.branchId === id; });
}
`;

const usersCode = `
// ==========================================
// Users.gs
// ==========================================
var USER_HEADERS = ["UserID", "CompanyID", "BranchID", "FullName", "Username", "Password", "Role", "Mobile", "Email", "Status", "CreatedDate", "UpdatedAt"];

function getUsers() {
  getSheetByNameOrCreate(CONFIG.SHEETS.USERS, USER_HEADERS);
  return getAllRecords(CONFIG.SHEETS.USERS);
}

function createUser(u) { return saveRecord(CONFIG.SHEETS.USERS, "UserID", u, "USR"); }
function updateUser(u) { return saveRecord(CONFIG.SHEETS.USERS, "UserID", u, "USR"); }
function deleteUser(id) { return deleteRecord(CONFIG.SHEETS.USERS, "UserID", id); }
function getUserById(id) {
  var all = getUsers();
  return all.find(function(u) { return u.UserID === id || u.id === id || u.userId === id; });
}
function searchUser(query) {
  if (!query) return getUsers();
  var q = String(query).toLowerCase().trim();
  var all = getUsers();
  return all.filter(function(u) {
    return (u.FullName && String(u.FullName).toLowerCase().includes(q)) || 
           (u.Username && String(u.Username).toLowerCase().includes(q)) ||
           (u.fullName && String(u.fullName).toLowerCase().includes(q)) || 
           (u.username && String(u.username).toLowerCase().includes(q));
  });
}
`;

const prescriptionsCode = `
// ==========================================
// Prescriptions.gs
// ==========================================
var PRE_HEADERS = ["PrescriptionID", "CustomerID", "CompanyID", "BranchID", "DoctorName", "ExamDate", "Complaint", "Diagnosis", "Advice", "Remarks", "OD_Distance_SPH", "OD_Distance_CYL", "OD_Distance_AXIS", "OS_Distance_SPH", "OS_Distance_CYL", "OS_Distance_AXIS", "AddPower", "PD_Distance", "PD_Near", "Source", "CreatedDate", "UpdatedAt"];

function getPrescriptions() {
  getSheetByNameOrCreate(CONFIG.SHEETS.PRESCRIPTIONS, PRE_HEADERS);
  return getAllRecords(CONFIG.SHEETS.PRESCRIPTIONS);
}

function createPrescription(p) { return saveRecord(CONFIG.SHEETS.PRESCRIPTIONS, "PrescriptionID", p, "PRE"); }
function updatePrescription(p) { return saveRecord(CONFIG.SHEETS.PRESCRIPTIONS, "PrescriptionID", p, "PRE"); }
function deletePrescription(id) { return deleteRecord(CONFIG.SHEETS.PRESCRIPTIONS, "PrescriptionID", id); }

function getPrescriptionById(id) {
  if (!id) return null;
  var all = getPrescriptions();
  return all.find(function(p) { return p.PrescriptionID === id || p.id === id; });
}

function getPrescriptionsByCustomer(customerId) {
  if (!customerId) return [];
  var all = getPrescriptions();
  return all.filter(function(p) { 
    return p.CustomerID === customerId || p.customerId === customerId; 
  });
}

function searchPrescription(query) {
  if (!query) return getPrescriptions();
  var q = String(query).toLowerCase().trim();
  var all = getPrescriptions();
  return all.filter(function(p) {
    return (p.PrescriptionID && String(p.PrescriptionID).toLowerCase().includes(q)) ||
           (p.id && String(p.id).toLowerCase().includes(q));
  });
}
`;

const eyeTestsCode = `
// ==========================================
// EyeTests.gs
// ==========================================
var EYETEST_HEADERS = ["id", "customerId", "companyId", "branchId", "eyeTestDate", "optometristName", "sphOd", "cylOd", "axisOd", "sphOs", "cylOs", "axisOs", "addPower", "pdDistance", "pdNear", "remarks", "createdAt", "updatedAt"];

function loadEyeTests(customerId) {
  if (!customerId) return [];
  getSheetByNameOrCreate(CONFIG.SHEETS.EYE_TESTS, EYETEST_HEADERS);
  var all = getAllRecords(CONFIG.SHEETS.EYE_TESTS);
  return all.filter(function(et) { return et.customerId === customerId || et.CustomerID === customerId; });
}

function saveEyeTest(et) {
  return saveRecord(CONFIG.SHEETS.EYE_TESTS, "id", et, "ET");
}
`;

const inventoryCode = `
// ==========================================
// Inventory.gs
// ==========================================
var INV_HEADERS = ["InventoryID", "CompanyID", "BranchID", "Category", "Brand", "Model", "Color", "Size", "Quantity", "PurchasePrice", "SellingPrice", "CreatedAt", "UpdatedAt"];

function getInventory() {
  getSheetByNameOrCreate(CONFIG.SHEETS.INVENTORY, INV_HEADERS);
  return getAllRecords(CONFIG.SHEETS.INVENTORY);
}

function saveInventory(item) { return saveRecord(CONFIG.SHEETS.INVENTORY, "InventoryID", item, "INVITEM"); }
function deleteInventory(id) { return deleteRecord(CONFIG.SHEETS.INVENTORY, "InventoryID", id); }

function searchInventory(query) {
  if (!query) return getInventory();
  var q = String(query).toLowerCase().trim();
  var all = getInventory();
  return all.filter(function(item) {
    return (item.Brand && String(item.Brand).toLowerCase().includes(q)) || 
           (item.brand && String(item.brand).toLowerCase().includes(q)) ||
           (item.Model && String(item.Model).toLowerCase().includes(q)) ||
           (item.model && String(item.model).toLowerCase().includes(q)) ||
           (item.InventoryID && String(item.InventoryID).toLowerCase().includes(q)) ||
           (item.id && String(item.id).toLowerCase().includes(q));
  });
}
`;

const invoicesCode = `
// ==========================================
// Invoices.gs
// ==========================================
var INVOICE_HEADERS = ["InvoiceID", "InvoiceNumber", "InvoiceType", "CustomerID", "CompanyID", "BranchID", "PrescriptionID", "InvoiceDate", "GrandTotal", "Discount", "FinalAmount", "Advance", "Balance", "PaymentMode", "CashAmount", "CardAmount", "UPIAmount", "CardReference", "UPIReference", "BillingRemarks", "Status", "Items", "CreatedDate", "UpdatedAt"];

function getInvoices() {
  getSheetByNameOrCreate(CONFIG.SHEETS.INVOICES, INVOICE_HEADERS);
  var all = getAllRecords(CONFIG.SHEETS.INVOICES);
  // Parse Items back into objects if they are strings
  return all.map(function(inv) {
    if (typeof inv.Items === 'string' && (inv.Items.startsWith('[') || inv.Items.startsWith('{'))) {
      try { inv.items = JSON.parse(inv.Items); } catch(e) { inv.items = []; }
    } else if (typeof inv.items === 'string' && (inv.items.startsWith('[') || inv.items.startsWith('{'))) {
      try { inv.items = JSON.parse(inv.items); } catch(e) { inv.items = []; }
    } else {
      inv.items = inv.Items || inv.items || [];
    }
    return inv;
  });
}

function saveInvoice(inv) {
  // Ensure items are serialized
  if (inv.items && typeof inv.items !== 'string') {
    inv.Items = JSON.stringify(inv.items);
  } else if (inv.Items && typeof inv.Items !== 'string') {
    inv.Items = JSON.stringify(inv.Items);
  }
  
  if (!inv.InvoiceNumber && !inv.invoiceNumber) {
    inv.InvoiceNumber = "INV-" + Date.now();
  }
  if (!inv.InvoiceID && !inv.id && !inv.invoiceId) {
    inv.InvoiceID = "INVID-" + Date.now();
  }
  
  return saveRecord(CONFIG.SHEETS.INVOICES, "InvoiceID", inv, "INVID");
}

function deleteInvoice(id) { return deleteRecord(CONFIG.SHEETS.INVOICES, "InvoiceID", id); }

function getInvoiceById(id) {
  if (!id) return null;
  var all = getInvoices();
  return all.find(function(inv) { return inv.InvoiceID === id || inv.id === id || inv.invoiceId === id; });
}

function getInvoicesByCustomer(customerId) {
  if (!customerId) return [];
  var all = getInvoices();
  return all.filter(function(inv) { return inv.CustomerID === customerId || inv.customerId === customerId; });
}

function searchInvoices(keyword) {
  if (!keyword) return getInvoices();
  var q = String(keyword).toLowerCase();
  var all = getInvoices();
  return all.filter(function(inv) { 
    var num = (inv.InvoiceNumber || inv.invoiceNumber || "").toString().toLowerCase();
    var pre = (inv.PrescriptionID || inv.prescriptionId || "").toString().toLowerCase();
    return num.includes(q) || pre.includes(q);
  });
}
`;

const salesOrdersCode = `
// ==========================================
// SalesOrders.gs
// ==========================================
// Sales orders are saved inside Invoices sheet with InvoiceType = 'Sales Order'.
// All specialized sales order queries can rely on the functions in Invoices.gs.
`;

const paymentsCode = `
// ==========================================
// Payments.gs
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
}
`;

const reportsCode = `
// ==========================================
// Reports.gs
// ==========================================
// Placeholder for report generation.
`;

const dashboardCode = `
// ==========================================
// Dashboard.gs
// ==========================================
// Placeholder for dashboard logic.
`;

const settingsCode = `
// ==========================================
// Settings.gs
// ==========================================
`;

const whatsappCode = `
// ==========================================
// WhatsApp.gs
// ==========================================
`;

const licenseCode = `
// ==========================================
// License.gs
// ==========================================
`;

const activityLogsCode = `
// ==========================================
// ActivityLogs.gs
// ==========================================
var LOG_HEADERS = ["LogID", "Timestamp", "Action", "UserID", "Details"];

function logActivity(log) {
  return saveRecord(CONFIG.SHEETS.ACTIVITY_LOGS, "LogID", log, "LOG");
}

function getActivityLogs() {
  getSheetByNameOrCreate(CONFIG.SHEETS.ACTIVITY_LOGS, LOG_HEADERS);
  return getAllRecords(CONFIG.SHEETS.ACTIVITY_LOGS);
}
`;


let output = \`
Here are the COMPLETE updated Google Apps Script files. 
Please delete all existing code from your Google Apps Script project and replace them by creating the individual \`.gs\` files below. 

This architecture fully supports all endpoints needed by the frontend application (customers, eye tests, prescriptions, invoices, sales orders, etc.) and ensures \`saveInvoice\`, \`loadEyeTests\`, \`loadCustomerHistory\` are fully functional and supported. 

---

### **Config.gs**
\\\`\\\`\\\`javascript
\${configCode}
\\\`\\\`\\\`

### **Utils.gs**
\\\`\\\`\\\`javascript
\${utilsCode}
\\\`\\\`\\\`

### **Code.gs**
\\\`\\\`\\\`javascript
\${codeCode}
\\\`\\\`\\\`

### **Customers.gs**
\\\`\\\`\\\`javascript
\${customersCode}
\\\`\\\`\\\`

### **Companies.gs**
\\\`\\\`\\\`javascript
\${companiesCode}
\\\`\\\`\\\`

### **Branches.gs**
\\\`\\\`\\\`javascript
\${branchesCode}
\\\`\\\`\\\`

### **Users.gs**
\\\`\\\`\\\`javascript
\${usersCode}
\\\`\\\`\\\`

### **Prescriptions.gs**
\\\`\\\`\\\`javascript
\${prescriptionsCode}
\\\`\\\`\\\`

### **EyeTests.gs**
\\\`\\\`\\\`javascript
\${eyeTestsCode}
\\\`\\\`\\\`

### **Inventory.gs**
\\\`\\\`\\\`javascript
\${inventoryCode}
\\\`\\\`\\\`

### **Invoices.gs**
\\\`\\\`\\\`javascript
\${invoicesCode}
\\\`\\\`\\\`

### **SalesOrders.gs**
\\\`\\\`\\\`javascript
\${salesOrdersCode}
\\\`\\\`\\\`

### **Payments.gs**
\\\`\\\`\\\`javascript
\${paymentsCode}
\\\`\\\`\\\`

### **Reports.gs**
\\\`\\\`\\\`javascript
\${reportsCode}
\\\`\\\`\\\`

### **Dashboard.gs**
\\\`\\\`\\\`javascript
\${dashboardCode}
\\\`\\\`\\\`

### **Settings.gs**
\\\`\\\`\\\`javascript
\${settingsCode}
\\\`\\\`\\\`

### **WhatsApp.gs**
\\\`\\\`\\\`javascript
\${whatsappCode}
\\\`\\\`\\\`

### **License.gs**
\\\`\\\`\\\`javascript
\${licenseCode}
\\\`\\\`\\\`

### **ActivityLogs.gs**
\\\`\\\`\\\`javascript
\${activityLogsCode}
\\\`\\\`\\\`

---
**Deployment Instructions:**
1. Open your Apps Script Project.
2. Create the exact filenames above (e.g., \`Config.gs\`, \`Code.gs\`, \`Utils.gs\`).
3. Paste the provided code into each corresponding file.
4. Delete the old monolithic \`Code.gs\` if you kept it.
5. Click **Deploy -> Manage deployments -> Edit (Pencil Icon) -> New version -> Deploy**.
6. Refresh your web app. All errors such as "Unsupported action: saveEyeTest" and "Unsupported action: loadCustomerHistory" will be fully resolved.
\`;

fs.writeFileSync('RESPONSE.md', output);
console.log('Done');

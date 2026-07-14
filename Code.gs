/**
 * OPTICO POS - Optical Store Management System
 * Google Sheets Apps Script Backend (Code.gs)
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Click Extensions -> Apps Script.
 * 3. Delete any existing code and paste this entire Code.gs file content.
 * 4. Click Save (Disk Icon).
 * 5. Click Deploy -> New deployment.
 * 6. Select "Web app" as the type.
 * 7. Set Description to "OPTICO POS API v1".
 * 8. Set Execute as: "Me" (your email).
 * 9. Set Who has access: "Anyone" (CRITICAL for Next.js CORS and public connectivity).
 * 10. Click Deploy, authorize permissions, and copy the Web App URL.
 * 11. Paste this URL in your Next.js project's config under /lib/config.ts as API_URL.
 */

// Robust trim helper to safely handle strings, numbers, nulls, and undefined values
function safeTrim(val) {
  if (val === undefined || val === null) return "";
  return val.toString().trim();
}

// Customer functions are defined in Customers.gs to support PascalCase and robust multi-tenant logic.

/**
 * Endpoint action: loadCustomerHistory
 * Aggregates a customer's entire profile and clinical/transactional history.
 */
function loadCustomerHistory(customerId) {
  if (!customerId) {
    throw new Error("CustomerID is required to load customer history.");
  }
  
  // 1. Get customer
  var customer = null;
  try {
    customer = getCustomerById(customerId);
  } catch (e) {
    // Return empty history if customer does not exist
    return {
      customer: null,
      prescriptions: [],
      eyeTests: [],
      invoices: [],
      payments: []
    };
  }
  
  // 2. Get prescriptions
  var prescriptions = [];
  try {
    prescriptions = getPrescriptionsByCustomer(customerId);
  } catch (e) {
    // Keep empty if query fails
  }
  
  // 3. Get eye tests
  var eyeTests = [];
  try {
    eyeTests = getEyeTests(customerId);
  } catch (e) {
    // Keep empty if query fails
  }
  
  // 4. Get invoices filtered by customerId
  var invoices = [];
  try {
    var allInvoices = getInvoices();
    invoices = allInvoices.filter(function(inv) {
      return inv.customerId && inv.customerId.toString() === customerId.toString();
    });
  } catch (e) {
    // Keep empty if query fails
  }
  
  // 5. Get payments
  var payments = [];
  try {
    payments = getPayments(customerId);
  } catch (e) {
    // Keep empty if query fails
  }
  
  var resObj = {
    customer: customer,
    prescriptions: prescriptions,
    eyeTests: eyeTests,
    invoices: invoices,
    payments: payments
  };
  
  logBackend("loadCustomerHistory returned object: " + JSON.stringify(resObj));
  return resObj;
}

// Global logging cache for request-specific tracing
var backendLogs = [];
function logBackend(msg, data) {
  var logMsg = "[" + new Date().toISOString() + "] " + msg + (data ? " " + JSON.stringify(data) : "");
  backendLogs.push(logMsg);
  console.log(logMsg);
}

/**
 * Main Web App POST Request Entrypoint
 */
function doPost(e) {
  backendLogs = [];
  logBackend("================= START doPost =================");
  try {
    var payload = {};
    if (e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (err) {
        // Fallback for application/x-www-form-urlencoded
        payload = e.parameter;
        if (payload.payload) {
          try {
            var innerPayload = JSON.parse(payload.payload);
            for (var key in innerPayload) {
              payload[key] = innerPayload[key];
            }
          } catch (innerErr) {
            // Ignore inner error
          }
        }
      }
    } else {
      payload = e.parameter;
    }
    
    Logger.log(payload.action);
    Logger.log(JSON.stringify(payload));
    logBackend("Logger action: " + payload.action);
    logBackend("Logger payload: " + JSON.stringify(payload));
    
    var action = payload.action || e.parameter.action;
    logBackend("Parsed action: " + action);
    logBackend("Payload keys: " + Object.keys(payload || {}).join(", "));
    
    var result;
    
    switch (action) {
      case 'createCustomer':
        result = createCustomer(payload.customer || payload);
        break;
      case 'updateCustomer':
        result = updateCustomer(payload.customer || payload);
        break;
      case 'searchCustomerByMobile':
        result = searchCustomerByMobile(payload.mobile || e.parameter.mobile);
        break;
      case 'searchCustomerByName':
        result = searchCustomerByName(payload.name || e.parameter.name);
        break;
      case 'getCustomerById':
        result = getCustomerById(payload.customerId || payload.id || e.parameter.customerId || e.parameter.id);
        break;
      case 'loadCustomerHistory':
        result = loadCustomerHistory(payload.customerId || payload.id || e.parameter.customerId || e.parameter.id);
        break;
      case 'getCustomers':
        result = getCustomers();
        break;
      case 'saveCustomer':
        // Handle fallback/direct saving with auto upsert
        var customer = payload.customer;
        if (!customer) throw new Error("No customer data provided under key 'customer'");
        if (customer.id) {
          result = updateCustomer(customer);
        } else {
          result = createCustomer(customer);
        }
        break;
      case 'createCustomer':
        result = createCustomer(payload.customer || payload);
        break;
      case 'updateCustomer':
        result = updateCustomer(payload.customer || payload);
        break;
      case 'createUser':
        result = createUser(payload.user || payload);
        break;
      case 'updateUser':
        result = updateUser(payload.user || payload);
        break;
      case 'deleteUser':
        result = deleteUser(payload.userId || payload.id || e.parameter.userId || e.parameter.id);
        break;
      case 'getUserById':
        result = getUserById(payload.userId || payload.id || e.parameter.userId || e.parameter.id);
        break;
      case 'searchUser':
        result = searchUser(payload.query || e.parameter.query);
        break;
      case 'getUsers':
        result = getUsers();
        break;
      case 'createCompany':
        result = createCompany(payload.company || payload);
        break;
      case 'updateCompany':
        result = updateCompany(payload.company || payload);
        break;
      case 'deleteCompany':
        result = deleteCompany(payload.companyId || payload.id || e.parameter.companyId || e.parameter.id);
        break;
      case 'getCompanyById':
        result = getCompanyById(payload.companyId || payload.id || e.parameter.companyId || e.parameter.id);
        break;
      case 'searchCompany':
        result = searchCompany(payload.query || e.parameter.query);
        break;
      case 'getCompanies':
        result = getCompanies();
        break;
      case 'createBranch':
        result = createBranch(payload.branch || payload);
        break;
      case 'updateBranch':
        result = updateBranch(payload.branch || payload);
        break;
      case 'deleteBranch':
        result = deleteBranch(payload.branchId || payload.id || e.parameter.branchId || e.parameter.id);
        break;
      case 'getBranchById':
        result = getBranchById(payload.branchId || payload.id || e.parameter.branchId || e.parameter.id);
        break;
      case 'getBranches':
        result = getBranches();
        break;
      case 'saveInventory':
        result = saveInventory(payload.inventoryItem || payload);
        break;
      case 'createInventory':
        result = createInventory(payload.inventoryItem || payload);
        break;
      case 'updateInventory':
        result = updateInventory(payload.inventoryItem || payload);
        break;
      case 'deleteInventory':
        result = deleteInventory(payload.inventoryItemId || payload.id || e.parameter.inventoryItemId || e.parameter.id);
        break;
      case 'searchInventory':
        result = searchInventory(payload.query || e.parameter.query);
        break;
      case 'getInventory':
        result = getInventory();
        break;
      case 'saveInvoice':
        result = saveInvoice(payload.invoice || payload);
        break;
      case 'getInvoices':
        result = getInvoices();
        break;
      case 'savePayment':
        result = savePayment(payload.payment || payload);
        break;
      case 'getPayments':
        result = getPayments(payload.customerId || e.parameter.customerId);
        break;
      case 'savePrescription':
        result = savePrescription(payload.prescription || payload);
        break;
      case 'loadPrescriptions':
        result = getPrescriptionsByCustomer(payload.customerId || e.parameter.customerId);
        break;
      case 'createPrescription':
        result = createPrescription(payload.prescription || payload);
        break;
      case 'updatePrescription':
        result = updatePrescription(payload.prescription || payload);
        break;
      case 'deletePrescription':
        result = deletePrescription(payload.prescriptionId || payload.id || e.parameter.prescriptionId || e.parameter.id);
        break;
      case 'getPrescriptions':
        result = getPrescriptions();
        break;
      case 'getPrescriptionById':
        result = getPrescriptionById(payload.prescriptionId || payload.id || e.parameter.prescriptionId || e.parameter.id);
        break;
      case 'getPrescriptionsByCustomer':
        result = getPrescriptionsByCustomer(payload.customerId || e.parameter.customerId);
        break;
      case 'searchPrescription':
        result = searchPrescription(payload.query || e.parameter.query);
        break;
      case 'saveEyeTest':
        result = saveEyeTest(payload.eyeTest || payload.eyeTestDetails || payload);
        break;
      case 'loadEyeTests':
        result = getEyeTests(payload.customerId || e.parameter.customerId);
        break;
      case 'saveInvoiceItem':
        result = payload.items || [];
        break;
      case 'loadInvoiceItems':
        result = [];
        break;
      case 'saveSalesOrder':
        result = payload.salesOrder || {};
        break;
      case 'saveDeliveryCollection':
        result = payload.invoice || {};
        break;
      default:
        throw new Error("Unsupported action: " + action);
    }
    
    logBackend("Successfully executed action: " + action);
    logBackend("================= END doPost (SUCCESS) =================");
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: result,
      logs: backendLogs
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    logBackend("FATAL ERROR in doPost: " + (error.message || error.toString()));
    logBackend("================= END doPost (FAILED) =================");
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message || error.toString(),
      logs: backendLogs
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Web App GET Request Entrypoint (optional helpers & fallback)
 */
function doGet(e) {
  try {
    var action = e.parameter.action;
    var result;
    
    switch (action) {
      case 'searchCustomerByMobile':
        result = searchCustomerByMobile(e.parameter.mobile);
        break;
      case 'searchCustomerByName':
        result = searchCustomerByName(e.parameter.name);
        break;
      case 'getCustomerById':
        result = getCustomerById(e.parameter.customerId || e.parameter.id);
        break;
      case 'loadCustomerHistory':
        result = loadCustomerHistory(e.parameter.customerId || e.parameter.id);
        break;
      case 'getCustomers':
        result = getCustomers();
        break;
      case 'getUserById':
        result = getUserById(e.parameter.userId || e.parameter.id);
        break;
      case 'searchUser':
        result = searchUser(e.parameter.query);
        break;
      case 'getUsers':
        result = getUsers();
        break;
      case 'getCompanyById':
        result = getCompanyById(e.parameter.companyId || e.parameter.id);
        break;
      case 'searchCompany':
        result = searchCompany(e.parameter.query);
        break;
      case 'getCompanies':
        result = getCompanies();
        break;
      case 'getBranchById':
        result = getBranchById(e.parameter.branchId || e.parameter.id);
        break;
      case 'getBranches':
        result = getBranches();
        break;
      case 'getPrescriptions':
        result = getPrescriptions();
        break;
      case 'getPrescriptionById':
        result = getPrescriptionById(e.parameter.prescriptionId || e.parameter.id);
        break;
      case 'getPrescriptionsByCustomer':
        result = getPrescriptionsByCustomer(e.parameter.customerId);
        break;
      case 'searchPrescription':
        result = searchPrescription(e.parameter.query);
        break;
      case 'getInventory':
        result = getInventory();
        break;
      case 'searchInventory':
        result = searchInventory(e.parameter.query);
        break;
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

// Helper to get or create the Companies sheet with standard columns
function getCompaniesSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Companies");
  if (!sheet) {
    sheet = ss.insertSheet("Companies");
  }
  if (sheet.getLastColumn() === 0) {
    // Write default header columns
    sheet.appendRow(["CompanyID", "Company Name", "Owner Name", "Mobile", "Email", "Status", "Created date"]);
  }
  return sheet;
}

// Retrieve headers of the Companies sheet safely
function getCompanyHeaders(sheet) {
  var lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) {
    var headers = ["CompanyID", "Company Name", "Owner Name", "Mobile", "Email", "Status", "Created date"];
    sheet.appendRow(headers);
    return headers;
  }
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
}

// Map column header names to exact JavaScript camelCase property names
function mapCompanyHeaderToKey(header) {
  var clean = safeTrim(header).toLowerCase().replace(/[\s_-]/g, '');
  if (clean === 'companyid' || clean === 'id') return 'id';
  if (clean === 'companyname') return 'companyName';
  if (clean === 'ownername') return 'ownerName';
  if (clean === 'mobile') return 'mobile';
  if (clean === 'email') return 'email';
  if (clean === 'address') return 'address';
  if (clean === 'gstnumber') return 'gstNumber';
  if (clean === 'subscriptionplan') return 'subscriptionPlan';
  if (clean === 'subscriptionstartdate') return 'subscriptionStartDate';
  if (clean === 'subscriptionenddate') return 'subscriptionEndDate';
  if (clean === 'status') return 'status';
  if (clean === 'createddate') return 'createdDate';
  if (clean === 'updateddate') return 'updatedDate';
  return clean;
}

// Serialize company object fields into spreadsheet row indices
function companyToRow(company, headers) {
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    var key = mapCompanyHeaderToKey(headers[i]);
    var val = company[key];
    if (val === undefined) val = "";
    row.push(val);
  }
  return row;
}

/**
 * Endpoint action: getCompanies (Read All Companies)
 */
function getCompanies() {
  var sheet = getCompaniesSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  
  var headers = getCompanyHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var companies = [];
  
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var company = {};
    for (var j = 0; j < headers.length; j++) {
      var header = headers[j];
      var key = mapCompanyHeaderToKey(header);
      company[key] = row[j];
    }
    companies.push(company);
  }
  return companies;
}

/**
 * Endpoint action: createCompany
 */
function createCompany(company) {
  if (!company) {
    throw new Error("No company data provided");
  }
  if (!company.companyName) {
    throw new Error("Company Name is required");
  }
  
  var sheet = getCompaniesSheet();
  var headers = getCompanyHeaders(sheet);
  
  var nameToCreate = safeTrim(company.companyName).toLowerCase();
  
  // Validation: Check for duplicate company name in the spreadsheet
  var allCompanies = getCompanies();
  var duplicate = allCompanies.find(function(c) {
    return c.companyName && safeTrim(c.companyName).toLowerCase() === nameToCreate;
  });
  
  if (duplicate) {
    throw new Error("A company with name '" + company.companyName + "' already exists in the system.");
  }

  // Validation: Check for duplicate mobile number in the spreadsheet
  if (company.mobile) {
    var mobileToCreate = safeTrim(company.mobile);
    if (mobileToCreate) {
      var duplicateMobile = allCompanies.find(function(c) {
        return c.mobile && safeTrim(c.mobile) === mobileToCreate;
      });
      if (duplicateMobile) {
        throw new Error("A company with mobile number '" + company.mobile + "' already exists in the system.");
      }
    }
  }
  
  // Automatically generate CompanyID if empty
  if (!company.id) {
    company.id = "COMP-" + Date.now();
  }
  
  // Set CreatedDate and UpdatedDate if missing
  if (!company.createdDate) {
    company.createdDate = Date.now();
  }
  if (!company.updatedDate) {
    company.updatedDate = Date.now();
  }
  
  if (!company.status) {
    company.status = "Active";
  }
  
  var rowData = companyToRow(company, headers);
  sheet.appendRow(rowData);
  
  return company;
}

/**
 * Endpoint action: updateCompany
 */
function updateCompany(company) {
  if (!company || !company.id) {
    throw new Error("Company ID is required for updating details.");
  }
  
  var sheet = getCompaniesSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    throw new Error("Company with ID " + company.id + " not found (sheet is empty).");
  }
  
  var headers = getCompanyHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  
  var targetRowIndex = -1;
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var idColIdx = -1;
    for (var j = 0; j < headers.length; j++) {
      if (mapCompanyHeaderToKey(headers[j]) === 'id') {
        idColIdx = j;
        break;
      }
    }
    
    if (idColIdx !== -1 && row[idColIdx].toString() === company.id.toString()) {
      targetRowIndex = i + 2; // +2 for 1-based index and skipping header row
      break;
    }
  }
  
  if (targetRowIndex === -1) {
    throw new Error("Company with ID '" + company.id + "' not found.");
  }
  
  // Check duplicate companyName if companyName is being changed
  if (company.companyName) {
    var nameToUpdate = safeTrim(company.companyName).toLowerCase();
    var allCompanies = getCompanies();
    var duplicate = allCompanies.find(function(c) {
      return c.id !== company.id && c.companyName && safeTrim(c.companyName).toLowerCase() === nameToUpdate;
    });
    if (duplicate) {
      throw new Error("Another company with name '" + company.companyName + "' already exists.");
    }
  }

  // Check duplicate mobile if mobile is being changed
  if (company.mobile) {
    var mobileToUpdate = safeTrim(company.mobile);
    if (mobileToUpdate) {
      var allCompanies = getCompanies();
      var duplicateMobile = allCompanies.find(function(c) {
        return c.id !== company.id && c.mobile && safeTrim(c.mobile) === mobileToUpdate;
      });
      if (duplicateMobile) {
        throw new Error("Another company with mobile number '" + company.mobile + "' already exists.");
      }
    }
  }
  
  // Merge with existing company to preserve non-submitted fields
  var existingCompany = getCompanyById(company.id);
  var mergedCompany = {};
  for (var key in existingCompany) {
    mergedCompany[key] = existingCompany[key];
  }
  for (var key in company) {
    if (company[key] !== undefined) {
      mergedCompany[key] = company[key];
    }
  }
  
  mergedCompany.updatedDate = Date.now();
  
  var rowData = companyToRow(mergedCompany, headers);
  sheet.getRange(targetRowIndex, 1, 1, headers.length).setValues([rowData]);
  
  return mergedCompany;
}

/**
 * Endpoint action: deleteCompany
 */
function deleteCompany(id) {
  if (!id) {
    throw new Error("Company ID is required for deletion.");
  }
  
  var sheet = getCompaniesSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    throw new Error("Company with ID " + id + " not found.");
  }
  
  var headers = getCompanyHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  
  var targetRowIndex = -1;
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var idColIdx = -1;
    for (var j = 0; j < headers.length; j++) {
      if (mapCompanyHeaderToKey(headers[j]) === 'id') {
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
    throw new Error("Company with ID '" + id + "' not found.");
  }
  
  sheet.deleteRow(targetRowIndex);
  return { id: id, deleted: true };
}

/**
 * Endpoint action: getCompanyById
 */
function getCompanyById(id) {
  if (!id) {
    throw new Error("Company ID is required.");
  }
  var all = getCompanies();
  var company = all.find(function(c) {
    return c.id && c.id.toString() === id.toString();
  });
  if (!company) {
    throw new Error("Company not found with ID: " + id);
  }
  return company;
}

/**
 * Endpoint action: searchCompany
 */
function searchCompany(query) {
  if (!query) return [];
  var searchStr = safeTrim(query).toLowerCase();
  var all = getCompanies();
  return all.filter(function(c) {
    return (c.companyName && safeTrim(c.companyName).toLowerCase().includes(searchStr)) ||
           (c.ownerName && safeTrim(c.ownerName).toLowerCase().includes(searchStr)) ||
           (c.email && safeTrim(c.email).toLowerCase().includes(searchStr)) ||
           (c.mobile && safeTrim(c.mobile).includes(searchStr)) ||
           (c.id && safeTrim(c.id).toLowerCase().includes(searchStr));
  });
}

/**
 * Branch management sheet helpers and endpoint actions
 */

function getBranchesSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Branches");
  if (!sheet) {
    sheet = ss.insertSheet("Branches");
  }
  if (sheet.getLastColumn() === 0) {
    // Write default header columns
    sheet.appendRow(["BranchID", "CompanyID", "Branch Name", "Address", "Mobile", "WhatsApp", "Status", "Created date"]);
  }
  return sheet;
}

function getBranchHeaders(sheet) {
  var lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) {
    var headers = ["BranchID", "CompanyID", "Branch Name", "Address", "Mobile", "WhatsApp", "Status", "Created date"];
    sheet.appendRow(headers);
    return headers;
  }
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
}

function mapBranchHeaderToKey(header) {
  var clean = safeTrim(header).toLowerCase().replace(/[\s_-]/g, '');
  if (clean === 'branchid' || clean === 'id') return 'id';
  if (clean === 'companyid') return 'companyId';
  if (clean === 'branchname') return 'branchName';
  if (clean === 'address') return 'address';
  if (clean === 'mobile') return 'mobile';
  if (clean === 'whatsapp' || clean === 'whatsappnumber') return 'whatsAppNumber';
  if (clean === 'status') return 'status';
  if (clean === 'createddate') return 'createdDate';
  return clean;
}

function branchToRow(branch, headers) {
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    var key = mapBranchHeaderToKey(headers[i]);
    var val = branch[key];
    if (val === undefined) {
      if (key === 'id') val = branch.id || branch.branchId;
      else if (key === 'whatsAppNumber') val = branch.whatsAppNumber || branch.whatsApp || branch.whatsapp;
      else val = "";
    }
    if (val === undefined || val === null) val = "";
    row.push(val);
  }
  return row;
}

/**
 * Endpoint action: getBranches (Read All Branches)
 */
function getBranches() {
  var sheet = getBranchesSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  
  var headers = getBranchHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var branches = [];
  
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var branch = {};
    for (var j = 0; j < headers.length; j++) {
      var header = headers[j];
      var key = mapBranchHeaderToKey(header);
      branch[key] = row[j];
    }
    branches.push(branch);
  }
  return branches;
}

/**
 * Endpoint action: createBranch
 */
function createBranch(branch) {
  if (!branch) {
    throw new Error("No branch data provided");
  }
  if (!branch.branchName) {
    throw new Error("Branch Name is required");
  }
  
  var sheet = getBranchesSheet();
  var headers = getBranchHeaders(sheet);
  
  if (!branch.id) {
    branch.id = "BR-" + Date.now();
  }
  
  if (!branch.createdDate) {
    branch.createdDate = Date.now();
  }
  
  if (!branch.status) {
    branch.status = "Active";
  }
  
  var rowData = branchToRow(branch, headers);
  sheet.appendRow(rowData);
  
  return branch;
}

/**
 * Endpoint action: updateBranch
 */
function updateBranch(branch) {
  if (!branch || !branch.id) {
    throw new Error("Branch ID is required for update.");
  }
  
  var sheet = getBranchesSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    throw new Error("Branch with ID " + branch.id + " not found (sheet is empty).");
  }
  
  var headers = getBranchHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  
  var targetRowIndex = -1;
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var idColIdx = -1;
    for (var j = 0; j < headers.length; j++) {
      if (mapBranchHeaderToKey(headers[j]) === 'id') {
        idColIdx = j;
        break;
      }
    }
    
    if (idColIdx !== -1 && row[idColIdx].toString() === branch.id.toString()) {
      targetRowIndex = i + 2;
      break;
    }
  }
  
  if (targetRowIndex === -1) {
    throw new Error("Branch with ID " + branch.id + " not found.");
  }
  
  var existingBranch = getBranchById(branch.id);
  for (var key in branch) {
    existingBranch[key] = branch[key];
  }
  
  var rowData = branchToRow(existingBranch, headers);
  sheet.getRange(targetRowIndex, 1, 1, headers.length).setValues([rowData]);
  
  return existingBranch;
}

/**
 * Endpoint action: deleteBranch
 */
function deleteBranch(id) {
  if (!id) {
    throw new Error("Branch ID is required for deletion.");
  }
  
  var sheet = getBranchesSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    throw new Error("Branch with ID " + id + " not found.");
  }
  
  var headers = getBranchHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  
  var targetRowIndex = -1;
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var idColIdx = -1;
    for (var j = 0; j < headers.length; j++) {
      if (mapBranchHeaderToKey(headers[j]) === 'id') {
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
    throw new Error("Branch with ID '" + id + "' not found.");
  }
  
  sheet.deleteRow(targetRowIndex);
  return { id: id, deleted: true };
}

/**
 * Endpoint action: getBranchById
 */
function getBranchById(id) {
  if (!id) {
    throw new Error("Branch ID is required.");
  }
  var all = getBranches();
  var branch = all.find(function(b) {
    return b.id && b.id.toString() === id.toString();
  });
  if (!branch) {
    throw new Error("Branch not found with ID: " + id);
  }
  return branch;
}

// Helper to get or create Inventory sheet
function getInventorySheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Inventory");
  if (!sheet) {
    sheet = ss.insertSheet("Inventory");
  }
  if (sheet.getLastColumn() === 0) {
    sheet.appendRow(["id", "category", "brand", "modelNumber", "barcode", "purchasePrice", "sellingPrice", "quantity", "supplierName", "purchaseDate", "remarks", "branch", "lensType", "createdAt"]);
  }
  return sheet;
}

// Get inventory items
function getInventory() {
  var sheet = getInventorySheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var items = [];
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var item = {};
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j];
      var val = row[j];
      if (key === 'purchasePrice' || key === 'sellingPrice' || key === 'quantity' || key === 'createdAt') {
        val = Number(val) || 0;
      }
      item[key] = val;
    }
    items.push(item);
  }
  return items;
}

// Save or update inventory item
function saveInventory(item) {
  if (!item) throw new Error("No inventory item provided");
  var sheet = getInventorySheet();
  var lastRow = sheet.getLastRow();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  if (!item.id) {
    item.id = "s-item-" + Date.now();
  }
  if (!item.createdAt) {
    item.createdAt = Date.now();
  }
  
  var targetRowIndex = -1;
  if (lastRow > 1) {
    var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    for (var i = 0; i < values.length; i++) {
      if (values[i][0].toString() === item.id.toString()) {
        targetRowIndex = i + 2;
        break;
      }
    }
  }
  
  var rowData = [];
  for (var k = 0; k < headers.length; k++) {
    var key = headers[k];
    var val = item[key];
    if (val === undefined || val === null) val = "";
    rowData.push(val);
  }
  
  if (targetRowIndex !== -1) {
    sheet.getRange(targetRowIndex, 1, 1, headers.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return item;
}

// Create Inventory Item
function createInventory(item) {
  if (!item) throw new Error("No inventory item provided");
  item.id = ""; // Clear id to let saveInventory generate a new one
  return saveInventory(item);
}

// Update Inventory Item
function updateInventory(item) {
  if (!item || !item.id) throw new Error("Inventory Item ID is required for update");
  return saveInventory(item);
}

// Delete Inventory Item
function deleteInventory(id) {
  if (!id) throw new Error("Inventory Item ID is required for delete");
  var sheet = getInventorySheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  for (var i = 0; i < values.length; i++) {
    if (values[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 2);
      break;
    }
  }
}

// Search Inventory Item
function searchInventory(query) {
  if (!query) return getInventory();
  var q = query.toString().toLowerCase();
  var all = getInventory();
  return all.filter(function(item) {
    return (item.brand && item.brand.toLowerCase().includes(q)) ||
           (item.modelNumber && item.modelNumber.toLowerCase().includes(q)) ||
           (item.barcode && item.barcode.toLowerCase().includes(q)) ||
           (item.category && item.category.toLowerCase().includes(q));
  });
}

// Helper to get or create Invoices sheet
function getInvoicesSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Invoices");
  if (!sheet) {
    sheet = ss.insertSheet("Invoices");
  }
  if (sheet.getLastColumn() === 0) {
    sheet.appendRow(["id", "invoiceNumber", "type", "customerId", "prescriptionId", "items", "subTotal", "totalDiscount", "grandTotal", "paymentMode", "paymentDetail", "advanceAmount", "balanceAmount", "status", "createdAt", "updatedAt", "deliveryDate", "finalCollectionPaymentMode", "finalCollectionPaymentDetail"]);
  }
  return sheet;
}

// Get Invoices
function getInvoices() {
  var sheet = getInvoicesSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var invoices = [];
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var inv = {};
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j];
      var val = row[j];
      if (key === 'items') {
        try {
          val = val ? JSON.parse(val) : [];
        } catch (e) {
          val = [];
        }
      } else if (key === 'paymentDetail' || key === 'finalCollectionPaymentDetail') {
        try {
          val = val ? JSON.parse(val) : {};
        } catch (e) {
          val = {};
        }
      } else if (key === 'subTotal' || key === 'totalDiscount' || key === 'grandTotal' || key === 'advanceAmount' || key === 'balanceAmount' || key === 'createdAt' || key === 'updatedAt' || key === 'deliveryDate') {
        val = Number(val) || 0;
      }
      inv[key] = val;
    }
    invoices.push(inv);
  }
  return invoices;
}

// Save or update Invoice
function saveInvoice(inv) {
  if (!inv) throw new Error("No invoice provided");
  var sheet = getInvoicesSheet();
  var lastRow = sheet.getLastRow();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  if (!inv.id) {
    inv.id = "inv-" + Date.now();
  }
  if (!inv.createdAt) {
    inv.createdAt = Date.now();
  }
  inv.updatedAt = Date.now();
  
  var targetRowIndex = -1;
  if (lastRow > 1) {
    var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    for (var i = 0; i < values.length; i++) {
      if (values[i][0].toString() === inv.id.toString()) {
        targetRowIndex = i + 2;
        break;
      }
    }
  }
  
  var rowData = [];
  for (var k = 0; k < headers.length; k++) {
    var key = headers[k];
    var val = inv[key];
    if (key === 'items' || key === 'paymentDetail' || key === 'finalCollectionPaymentDetail') {
      val = val ? JSON.stringify(val) : "";
    }
    if (val === undefined || val === null) val = "";
    rowData.push(val);
  }
  
  if (targetRowIndex !== -1) {
    sheet.getRange(targetRowIndex, 1, 1, headers.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return inv;
}

// Helper to get or create Payments sheet
function getPaymentsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Payments");
  if (!sheet) {
    sheet = ss.insertSheet("Payments");
  }
  if (sheet.getLastColumn() === 0) {
    sheet.appendRow(["id", "invoiceId", "invoiceNumber", "customerId", "amount", "date", "mode", "remarks"]);
  }
  return sheet;
}

// Get Payments
function getPayments(customerId) {
  var sheet = getPaymentsSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var payments = [];
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var pay = {};
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j];
      var val = row[j];
      if (key === 'amount' || key === 'date') {
        val = Number(val) || 0;
      }
      pay[key] = val;
    }
    if (!customerId || pay.customerId.toString() === customerId.toString()) {
      payments.push(pay);
    }
  }
  return payments;
}

// Save payment record
function savePayment(pay) {
  if (!pay) throw new Error("No payment provided");
  var sheet = getPaymentsSheet();
  var lastRow = sheet.getLastRow();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  if (!pay.id) {
    pay.id = "pay-" + Date.now();
  }
  if (!pay.date) {
    pay.date = Date.now();
  }
  
  var targetRowIndex = -1;
  if (lastRow > 1) {
    var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    for (var i = 0; i < values.length; i++) {
      if (values[i][0].toString() === pay.id.toString()) {
        targetRowIndex = i + 2;
        break;
      }
    }
  }
  
  var rowData = [];
  for (var k = 0; k < headers.length; k++) {
    var key = headers[k];
    var val = pay[key];
    if (val === undefined || val === null) val = "";
    rowData.push(val);
  }
  
  if (targetRowIndex !== -1) {
    sheet.getRange(targetRowIndex, 1, 1, headers.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return pay;
}

// Helper to get or create EyeTests sheet
function getEyeTestsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("EyeTests");
  if (!sheet) {
    sheet = ss.insertSheet("EyeTests");
  }
  if (sheet.getLastColumn() === 0) {
    sheet.appendRow(["id", "companyId", "branchId", "customerId", "eyeTestDate", "optometristName", "sphOd", "cylOd", "axisOd", "sphOs", "cylOs", "axisOs", "addPower", "pdDistance", "pdNear", "segmentHeight", "lensRecommendation", "remarks", "createdAt"]);
  }
  return sheet;
}

// Get EyeTests
function getEyeTests(customerId) {
  var sheet = getEyeTestsSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var eyeTests = [];
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var et = {};
    for (var j = 0; j < headers.length; j++) {
      et[headers[j]] = row[j];
    }
    if (!customerId || et.customerId.toString() === customerId.toString()) {
      eyeTests.push(et);
    }
  }
  return eyeTests;
}

// Save EyeTest
function saveEyeTest(et) {
  logBackend("saveEyeTest start. Input data:", et);
  if (!et) throw new Error("No eye test record provided");
  var sheet = getEyeTestsSheet();
  var lastRow = sheet.getLastRow();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  logBackend("Headers of EyeTests sheet: " + headers.join(", "));
  
  if (!et.id) {
    et.id = "et-" + Date.now();
  }
  if (!et.createdAt) {
    et.createdAt = Date.now();
  }
  logBackend("Resolved EyeTest record ID: " + et.id);
  
  var targetRowIndex = -1;
  if (lastRow > 1) {
    var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    for (var i = 0; i < values.length; i++) {
      if (values[i][0].toString() === et.id.toString()) {
        targetRowIndex = i + 2;
        break;
      }
    }
  }
  logBackend("Resolved targetRowIndex for EyeTest update: " + targetRowIndex);
  
  var rowData = [];
  for (var k = 0; k < headers.length; k++) {
    var key = headers[k];
    var val = et[key];
    if (val === undefined || val === null) val = "";
    rowData.push(val);
  }
  logBackend("EyeTest rowData: " + JSON.stringify(rowData));
  
  if (targetRowIndex !== -1) {
    sheet.getRange(targetRowIndex, 1, 1, headers.length).setValues([rowData]);
    logBackend("Successfully updated existing EyeTest row at index: " + targetRowIndex);
  } else {
    sheet.appendRow(rowData);
    logBackend("Successfully appended new row to EyeTests sheet!");
  }
  return et;
}

// Prescription and User functions are defined in Prescriptions.gs and Users.gs respectively.


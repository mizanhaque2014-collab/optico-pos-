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
  logBackend("ENTER doPost");

  backendLogs = [];
  
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
    
    logBackend("ENTER Router switch(action)");
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
      case 'assignUserToBranch':
        result = assignUserToBranch(payload.username || e.parameter.username, payload.branchName || e.parameter.branchName);
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
        result = createPrescription(payload.prescription || payload);
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
            
      case 'createInvoice':
      case 'updateInvoice':
        result = saveInvoice(payload.invoice || payload);
        break;
      case 'deleteInvoice':
        result = deleteInvoice(payload.invoiceId || payload.InvoiceID || payload.id || e.parameter.invoiceId || e.parameter.id);
        break;
      case 'getInvoiceById':
        result = getInvoiceById(payload.invoiceId || payload.InvoiceID || payload.id || e.parameter.invoiceId || e.parameter.id);
        break;
      case 'getInvoicesByCustomer':
        result = getInvoicesByCustomer(payload.customerId || payload.CustomerID || e.parameter.customerId);
        break;
      case 'searchInvoices':
        result = searchInvoices(payload.keyword || payload.search || payload.query || e.parameter.keyword || e.parameter.query);
        break;

      case 'saveInvoiceItem':
        var inv = getInvoices().find(function(i) { return i.id === payload.invoiceId; });
        if (inv) {
          inv.items = payload.items;
          result = saveInvoice(inv);
        } else {
          result = {};
        }
        break;
      case 'loadInvoiceItems':
        var inv2 = getInvoices().find(function(i) { return i.id === payload.invoiceId; });
        result = inv2 ? inv2.items : [];
        break;
      
      case 'saveSalesOrderItems':
        var sheet = getSalesOrderItemsSheet();
        var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        // Delete existing for this invoice
        var lastRow = sheet.getLastRow();
        if (lastRow > 1) {
          var dataRange = sheet.getRange(2, 1, lastRow - 1, headers.length);
          var data = dataRange.getValues();
          var rowsToDelete = [];
          for (var i = data.length - 1; i >= 0; i--) {
            if (data[i][1] === payload.invoiceId) {
              rowsToDelete.push(i + 2);
            }
          }
          rowsToDelete.forEach(function(rowNum) {
            sheet.deleteRow(rowNum);
          });
        }
        // Insert new items
        var items = payload.items || [];
        var createdDate = Date.now();
        items.forEach(function(item) {
          var rowData = [];
          for (var k = 0; k < headers.length; k++) {
            var key = headers[k];
            if (key === 'CreatedDate') {
              rowData.push(createdDate);
            } else if (key === 'InvoiceID' || key === 'SalesOrderID') {
              rowData.push(payload.invoiceId);
            } else if (key === 'Category') {
              rowData.push(item.category || item.type || '');
            } else if (key === 'ProductSource') {
              rowData.push(item.productSource || (item.inventoryId ? 'Inventory' : 'Manual'));
            } else if (key === 'ProductID' || key === 'InventoryID') {
              rowData.push(item.id || item.inventoryId || '');
            } else {
              var val = item[key] || item[key.charAt(0).toLowerCase() + key.slice(1)];
              if (val === undefined || val === null) val = "";
              rowData.push(val);
            }
          }
          sheet.appendRow(rowData);
        });
        SpreadsheetApp.flush();
        result = { success: true, count: items.length };
        break;
      case 'getSalesOrderItems':
        var sheet = getSalesOrderItemsSheet();
        var lastRow = sheet.getLastRow();
        var res = [];
        if (lastRow > 1) {
          var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
          var data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
          for (var i = 0; i < data.length; i++) {
            if (!payload.invoiceId || data[i][1] === payload.invoiceId) {
              var obj = {};
              for (var j = 0; j < headers.length; j++) {
                obj[headers[j]] = data[i][j];
              }
              res.push(obj);
            }
          }
        }
        result = res;
        break;

      case 'saveSalesOrder':
        result = saveInvoice(payload.salesOrder || payload);
        break;
      case 'saveDeliveryCollection':
        result = saveInvoice(payload.invoice || payload);
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
    SpreadsheetApp.flush();
  }
  return sheet;
}

// Retrieve headers of the Companies sheet safely
function getCompanyHeaders(sheet) {
  var lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) {
    var headers = ["CompanyID", "Company Name", "Owner Name", "Mobile", "Email", "Status", "Created date"];
    sheet.appendRow(headers);
    SpreadsheetApp.flush();
    return headers;
  }
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
}

// Map column header names to exact JavaScript camelCase property names
function mapCompanyHeaderToKey(header) {
  var clean = (header || "").toString().trim().toLowerCase().replace(/[\s_-]/g, '');
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
  
  var nameToCreate = (company.companyName || "").toString().trim().toLowerCase();
  
  // Validation: Check for duplicate company name in the spreadsheet
  var allCompanies = getCompanies();
  var duplicate = allCompanies.find(function(c) {
    return c.companyName && (c.companyName || "").toString().trim().toLowerCase() === nameToCreate;
  });
  
  if (duplicate) {
    throw new Error("A company with name '" + company.companyName + "' already exists in the system.");
  }

  // Validation: Check for duplicate mobile number in the spreadsheet
  if (company.mobile) {
    var mobileToCreate = (company.mobile || "").toString().trim();
    if (mobileToCreate) {
      var duplicateMobile = allCompanies.find(function(c) {
        return c.mobile && (c.mobile || "").toString().trim() === mobileToCreate;
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
  SpreadsheetApp.flush();
  
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
    var nameToUpdate = (company.companyName || "").toString().trim().toLowerCase();
    var allCompanies = getCompanies();
    var duplicate = allCompanies.find(function(c) {
      return c.id !== company.id && c.companyName && (c.companyName || "").toString().trim().toLowerCase() === nameToUpdate;
    });
    if (duplicate) {
      throw new Error("Another company with name '" + company.companyName + "' already exists.");
    }
  }

  // Check duplicate mobile if mobile is being changed
  if (company.mobile) {
    var mobileToUpdate = (company.mobile || "").toString().trim();
    if (mobileToUpdate) {
      var allCompanies = getCompanies();
      var duplicateMobile = allCompanies.find(function(c) {
        return c.id !== company.id && c.mobile && (c.mobile || "").toString().trim() === mobileToUpdate;
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
  SpreadsheetApp.flush();
  
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
  SpreadsheetApp.flush();
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
  var searchStr = (query || "").toString().trim().toLowerCase();
  var all = getCompanies();
  return all.filter(function(c) {
    return (c.companyName && (c.companyName || "").toString().trim().toLowerCase().includes(searchStr)) ||
           (c.ownerName && (c.ownerName || "").toString().trim().toLowerCase().includes(searchStr)) ||
           (c.email && (c.email || "").toString().trim().toLowerCase().includes(searchStr)) ||
           (c.mobile && (c.mobile || "").toString().trim().includes(searchStr)) ||
           (c.id && (c.id || "").toString().trim().toLowerCase().includes(searchStr));
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
    SpreadsheetApp.flush();
  }
  return sheet;
}

function getBranchHeaders(sheet) {
  var lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) {
    var headers = ["BranchID", "CompanyID", "Branch Name", "Address", "Mobile", "WhatsApp", "Status", "Created date"];
    sheet.appendRow(headers);
    SpreadsheetApp.flush();
    return headers;
  }
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
}

function mapBranchHeaderToKey(header) {
  var clean = (header || "").toString().trim().toLowerCase().replace(/[\s_-]/g, '');
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
  SpreadsheetApp.flush();
  
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
  SpreadsheetApp.flush();
  
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
  SpreadsheetApp.flush();
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
    SpreadsheetApp.flush();
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
    SpreadsheetApp.flush();
  } else {
    sheet.appendRow(rowData);
    SpreadsheetApp.flush();
  }
  
  // Also save items to SalesOrderItems sheet to prevent data loss
  var itemsToSave = inv.items || inv.Items;
  if (typeof itemsToSave === 'string') {
    try { itemsToSave = JSON.parse(itemsToSave); } catch(e) { itemsToSave = []; }
  }
  if (itemsToSave && itemsToSave.length > 0) {
    var itemsSheet = getSalesOrderItemsSheet();
    var itemsHeaders = itemsSheet.getRange(1, 1, 1, itemsSheet.getLastColumn()).getValues()[0];
    
    // Delete existing for this invoice
    var itemsLastRow = itemsSheet.getLastRow();
    if (itemsLastRow > 1) {
      var dataRange = itemsSheet.getRange(2, 1, itemsLastRow - 1, itemsHeaders.length);
      var data = dataRange.getValues();
      var rowsToDelete = [];
      for (var i = data.length - 1; i >= 0; i--) {
        if (data[i][1] === inv.id || data[i][1] === inv.InvoiceID) {
          rowsToDelete.push(i + 2);
        }
      }
      rowsToDelete.forEach(function(rowNum) {
        itemsSheet.deleteRow(rowNum);
      });
    }
    
    var createdDate = inv.createdAt || inv.CreatedDate || Date.now();
    itemsToSave.forEach(function(item) {
      var itemRowData = [];
      for (var k = 0; k < itemsHeaders.length; k++) {
        var key = itemsHeaders[k];
        if (key === 'CreatedDate') {
          itemRowData.push(createdDate);
        } else if (key === 'InvoiceID' || key === 'SalesOrderID') {
          itemRowData.push(inv.id || inv.InvoiceID);
        } else if (key === 'Category') {
          itemRowData.push(item.category || item.type || item.itemType || '');
        } else if (key === 'ProductSource') {
          itemRowData.push(item.productSource || (item.inventoryId ? 'Inventory' : 'Manual'));
        } else if (key === 'ProductID' || key === 'InventoryID') {
          itemRowData.push(item.id || item.inventoryId || '');
        } else if (key === 'Qty') {
          itemRowData.push(item.quantity || item.qty || item.Qty || 0);
        } else if (key === 'UnitPrice') {
          itemRowData.push(item.sellingPrice || item.unitPrice || item.UnitPrice || 0);
        } else if (key === 'Total') {
          itemRowData.push(item.finalAmount || item.total || item.Total || 0);
        } else if (key === 'Model') {
          itemRowData.push(item.modelNumber || item.model || item.Model || '');
        } else if (key === 'Description') {
          itemRowData.push(item.description || item.productType || item.lensCategory || item.Description || '');
        } else if (key === 'LensBrand') {
          itemRowData.push(item.lensBrand || item.brand || item.Brand || '');
        } else if (key === 'LensType') {
          itemRowData.push(item.lensCategory || item.lensType || item.LensType || '');
        } else if (key === 'CustomerID') {
          itemRowData.push(inv.customerId || inv.CustomerID || '');
        } else if (key === 'CompanyID') {
          itemRowData.push(inv.companyId || inv.CompanyID || '');
        } else if (key === 'BranchID') {
          itemRowData.push(inv.branchId || inv.BranchID || '');
        } else {
          var val = item[key] || item[key.charAt(0).toLowerCase() + key.slice(1)];
          if (val === undefined || val === null) val = "";
          itemRowData.push(val);
        }
      }
      itemsSheet.appendRow(itemRowData);
    });
    SpreadsheetApp.flush();
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
      SpreadsheetApp.flush();
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

function getSalesOrderItemsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("SalesOrderItems");
  if (!sheet) {
    sheet = ss.insertSheet("SalesOrderItems");
    var headers = [
      "SalesOrderID",
      "InvoiceID",
      "CustomerID",
      "CompanyID",
      "BranchID",
      "Category",
      "ProductSource",
      "InventoryID",
      "ProductID",
      "Brand",
      "Model",
      "Description",
      "LensType",
      "LensBrand",
      "LensIndex",
      "LensCoating",
      "Power",
      "Color",
      "Size",
      "Eye",
      "Qty",
      "UnitPrice",
      "Discount",
      "Tax",
      "Total",
      "CreatedDate"
    ];
    sheet.appendRow(headers);
  }
  return sheet;
}

function getInvoicesSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Invoices");
  if (!sheet) {
    sheet = ss.insertSheet("Invoices");
  }
  if (sheet.getLastColumn() === 0) {
    sheet.appendRow(["id", "invoiceNumber", "type", "customerId", "prescriptionId", "items", "subTotal", "totalDiscount", "grandTotal", "paymentMode", "paymentDetail", "advanceAmount", "balanceAmount", "status", "createdAt", "updatedAt", "deliveryDate", "finalCollectionPaymentMode", "finalCollectionPaymentDetail"]);
    SpreadsheetApp.flush();
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
  // Pre-load items from SalesOrderItems sheet
  var itemsSheet = getSalesOrderItemsSheet();
  var itemsLastRow = itemsSheet.getLastRow();
  var allItems = [];
  var itemsHeaders = [];
  if (itemsLastRow > 1) {
    itemsHeaders = itemsSheet.getRange(1, 1, 1, itemsSheet.getLastColumn()).getValues()[0];
    var itemsData = itemsSheet.getRange(2, 1, itemsLastRow - 1, itemsHeaders.length).getValues();
    for (var m = 0; m < itemsData.length; m++) {
      var obj = {};
      for (var n = 0; n < itemsHeaders.length; n++) {
        obj[itemsHeaders[n]] = itemsData[m][n];
      }
      allItems.push(obj);
    }
  }

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
    
    // Attach items from SalesOrderItems if not present in the 'items' column
    if (!inv.items || inv.items.length === 0) {
      var invId = inv.id || inv.InvoiceID || inv.invoiceNumber;
      inv.items = allItems.filter(function(item) {
        return item.InvoiceID === invId || item.SalesOrderID === invId || item.InvoiceID === inv.id;
      }).map(function(item) {
        // Map back to camelCase properties typical for frontend
        var mappedItem = {};
        for(var k in item) {
           var newKey = k.charAt(0).toLowerCase() + k.slice(1);
           if (k === 'ProductID' || k === 'InventoryID') newKey = 'id';
           else if (k === 'Category') newKey = 'itemType';
           else if (k === 'Qty') newKey = 'quantity';
           else if (k === 'UnitPrice') newKey = 'sellingPrice';
           else if (k === 'Total') newKey = 'finalAmount';
           else if (k === 'Model') newKey = 'modelNumber';
           else if (k === 'LensType') newKey = 'lensCategory';
           mappedItem[newKey] = item[k];
        }
        return mappedItem;
      });
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
    SpreadsheetApp.flush();
  } else {
    sheet.appendRow(rowData);
    SpreadsheetApp.flush();
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
    SpreadsheetApp.flush();
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
    SpreadsheetApp.flush();
  } else {
    sheet.appendRow(rowData);
    SpreadsheetApp.flush();
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
    SpreadsheetApp.flush();
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
    var etCustId = et.customerId || et.CustomerID || et.customerID || "";
    if (!customerId || etCustId.toString().trim().toLowerCase() === customerId.toString().trim().toLowerCase()) {
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
    SpreadsheetApp.flush();
    logBackend("Successfully updated existing EyeTest row at index: " + targetRowIndex);
  } else {
    sheet.appendRow(rowData);
    SpreadsheetApp.flush();
    logBackend("Successfully appended new row to EyeTests sheet!");
  }
  return et;
}

// Prescription and User functions are defined in Prescriptions.gs and Users.gs respectively.


// Assign user to branch
function assignUserToBranch(username, branchName) {
  if (!username || !branchName) throw new Error("Username and Branch Name are required");
  var users = getUsers();
  var targetUser = null;
  for (var i = 0; i < users.length; i++) {
    var uName = users[i].Username || users[i].username;
    if (uName && uName.toString().trim().toLowerCase() === username.toString().trim().toLowerCase()) {
      targetUser = users[i];
      break;
    }
  }
  if (!targetUser) throw new Error("User not found with username: " + username);

  var branches = getBranches();
  var targetBranch = null;
  for (var j = 0; j < branches.length; j++) {
    var bName = branches[j].branchName || branches[j].BranchName || branches[j]["Branch Name"];
    if (bName && bName.toString().trim().toLowerCase() === branchName.toString().trim().toLowerCase()) {
      targetBranch = branches[j];
      break;
    }
  }
  if (!targetBranch) throw new Error("Branch not found with name: " + branchName);

  targetUser.BranchID = targetBranch.id || targetBranch.BranchID;
  updateUser(targetUser);
  return true;
}


// ======================
// INVOICE MANAGEMENT ADDITIONS
// ======================

function getInvoicesByCustomer(customerId) {
  if (!customerId) return [];
  var all = getInvoices();
  return all.filter(function(i) {
    return (i.customerId && i.customerId.toString() === customerId.toString()) ||
           (i.CustomerID && i.CustomerID.toString() === customerId.toString());
  });
}

function getInvoiceById(id) {
  if (!id) return null;
  var all = getInvoices();
  return all.find(function(i) {
    return i.id && i.id.toString() === id.toString();
  }) || null;
}

function searchInvoices(keyword) {
  if (!keyword) return [];
  var searchStr = keyword.toString().toLowerCase().trim();
  var all = getInvoices();
  return all.filter(function(i) {
    var invNo = (i.invoiceNumber || i.InvoiceNumber || "").toString().toLowerCase();
    var pId = (i.prescriptionId || i.PrescriptionID || "").toString().toLowerCase();
    return invNo.includes(searchStr) || pId.includes(searchStr);
  });
}

function deleteInvoice(id) {
  if (!id) throw new Error("Invoice ID is required");
  var sheet = getInvoicesSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  
  for (var i = 0; i < values.length; i++) {
    if (values[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 2);
      SpreadsheetApp.flush();
      return true;
    }
  }
  return false;
}


// ======================
// PRESCRIPTION MANAGEMENT ADDITIONS
// ======================

function getPrescriptionsByCustomer(customerId) {
  if (!customerId) return [];
  var all = getPrescriptions();
  return all.filter(function(p) {
    return (p.customerId && p.customerId.toString() === customerId.toString()) ||
           (p.CustomerID && p.CustomerID.toString() === customerId.toString());
  });
}

function getPrescriptionById(id) {
  if (!id) return null;
  var all = getPrescriptions();
  return all.find(function(p) {
    return p.id && p.id.toString() === id.toString();
  }) || null;
}

function deletePrescription(id) {
  if (!id) throw new Error("Prescription ID is required");
  var sheet = getPrescriptionsSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  
  for (var i = 0; i < values.length; i++) {
    if (values[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 2);
      SpreadsheetApp.flush();
      return true;
    }
  }
  return false;
}


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


// ======================
// USER MANAGEMENT ADDITIONS
// ======================

function getUsersSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Users");
  if (!sheet) {
    sheet = ss.insertSheet("Users");
    var headers = ["id", "username", "password", "role", "name", "email", "phone", "branches", "status", "createdAt", "updatedAt"];
    sheet.appendRow(headers);
  }
  return sheet;
}

function getUsers() {
  var sheet = getUsersSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var users = [];
  
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var u = {};
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j];
      var val = row[j];
      if (key === 'branches') {
        try { u[key] = val ? JSON.parse(val) : []; } catch(e) { u[key] = []; }
      } else {
        u[key] = val;
      }
    }
    users.push(u);
  }
  return users;
}

function saveUser(u) {
  if (!u) throw new Error("No user provided");
  var sheet = getUsersSheet();
  var lastRow = sheet.getLastRow();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  var uid = u.id || u.UserID || u.userId;
  if (!uid) {
    uid = "USR-" + Date.now();
    u.id = uid;
  }
  
  var targetRowIndex = -1;
  if (lastRow > 1) {
    var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    for (var i = 0; i < values.length; i++) {
      if (values[i][0].toString() === uid.toString()) {
        targetRowIndex = i + 2;
        break;
      }
    }
  }
  
  var rowData = [];
  for (var k = 0; k < headers.length; k++) {
    var key = headers[k];
    var val = u[key] !== undefined ? u[key] : "";
    if (key === 'branches') {
      val = val ? JSON.stringify(val) : "[]";
    }
    if (key === 'createdAt' && !val) val = Date.now();
    if (key === 'updatedAt') val = Date.now();
    rowData.push(val);
  }
  
  if (targetRowIndex !== -1) {
    sheet.getRange(targetRowIndex, 1, 1, headers.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  SpreadsheetApp.flush();
  return u;
}

function createUser(u) { return saveUser(u); }
function updateUser(u) { return saveUser(u); }

function deleteUser(id) {
  if (!id) throw new Error("User ID is required");
  var sheet = getUsersSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  
  for (var i = 0; i < values.length; i++) {
    if (values[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 2);
      SpreadsheetApp.flush();
      return true;
    }
  }
  return false;
}

function getUserById(id) {
  if (!id) return null;
  var all = getUsers();
  return all.find(function(u) {
    return u.id && u.id.toString() === id.toString();
  }) || null;
}

function searchUser(query) {
  if (!query) return [];
  var searchStr = query.toString().toLowerCase().trim();
  var all = getUsers();
  return all.filter(function(u) {
    var un = (u.username || "").toString().toLowerCase();
    var n = (u.name || "").toString().toLowerCase();
    return un.includes(searchStr) || n.includes(searchStr);
  });
}

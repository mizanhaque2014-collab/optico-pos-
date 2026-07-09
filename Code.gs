/**
 * LEF SPECS - Optical Store Management System
 * Google Sheets Apps Script Backend (Code.gs)
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Click Extensions -> Apps Script.
 * 3. Delete any existing code and paste this entire Code.gs file content.
 * 4. Click Save (Disk Icon).
 * 5. Click Deploy -> New deployment.
 * 6. Select "Web app" as the type.
 * 7. Set Description to "LEF SPECS API v1".
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

// Helper to get or create the Customers sheet with standard columns
function getCustomersSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Customers");
  if (!sheet) {
    sheet = ss.insertSheet("Customers");
    // Write default header columns
    sheet.appendRow(["id", "name", "mobile", "dob", "address", "status", "prescriptions", "createdAt"]);
  }
  return sheet;
}

// Map column header names to exact JavaScript camelCase property names
function mapHeaderToKey(header) {
  var clean = safeTrim(header).toLowerCase().replace(/[\s_-]/g, '');
  if (clean === 'customerid' || clean === 'id') return 'id';
  if (clean === 'customername' || clean === 'name') return 'name';
  if (clean === 'mobilenumber' || clean === 'mobile' || clean === 'mobilenumber') return 'mobile';
  if (clean === 'dateofbirth' || clean === 'dob') return 'dob';
  if (clean === 'address') return 'address';
  if (clean === 'status') return 'status';
  if (clean === 'prescriptions') return 'prescriptions';
  if (clean === 'createdat') return 'createdAt';
  return clean;
}

// Retrieve headers of the Customers sheet
function getHeaders(sheet) {
  var lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) {
    var headers = ["id", "name", "mobile", "dob", "address", "status", "prescriptions", "createdAt"];
    sheet.appendRow(headers);
    return headers;
  }
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
}

// Serialize customer object fields into spreadsheet row indices
function customerToRow(customer, headers) {
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    var key = mapHeaderToKey(headers[i]);
    var val = customer[key];
    if (val === undefined) val = "";
    
    if (key === 'prescriptions') {
      row.push(JSON.stringify(val || []));
    } else {
      row.push(val);
    }
  }
  return row;
}

/**
 * Endpoint action: getCustomers (Read All Customers)
 * Fallback / backward compatibility helper
 */
function getCustomers() {
  var sheet = getCustomersSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  
  var headers = getHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var customers = [];
  
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var customer = {};
    for (var j = 0; j < headers.length; j++) {
      var header = headers[j];
      var key = mapHeaderToKey(header);
      var val = row[j];
      
      if (key === 'prescriptions') {
        try {
          customer[key] = val ? JSON.parse(val) : [];
        } catch (e) {
          customer[key] = [];
        }
      } else {
        customer[key] = val;
      }
    }
    customers.push(customer);
  }
  return customers;
}

/**
 * Endpoint action: createCustomer
 * Saves new customer, automatically generates CustomerID if empty, and prevents duplicate mobile numbers.
 */
function createCustomer(customer) {
  if (!customer) {
    throw new Error("No customer data provided");
  }
  if (!customer.name) {
    throw new Error("Customer name is required");
  }
  if (!customer.mobile) {
    throw new Error("Customer mobile is required");
  }
  
  var sheet = getCustomersSheet();
  var headers = getHeaders(sheet);
  
  // Clean mobile number for duplicate validation check
  var mobileToCreate = safeTrim(customer.mobile);
  
  // Validation: Check for duplicates in the spreadsheet
  var allCustomers = getCustomers();
  var duplicate = allCustomers.find(function(c) {
    return c.mobile && safeTrim(c.mobile) === mobileToCreate;
  });
  
  if (duplicate) {
    throw new Error("A customer with mobile number '" + mobileToCreate + "' already exists in the system.");
  }
  
  // Automatically generate Customer ID if empty
  if (!customer.id) {
    customer.id = "CUST-" + Date.now() + Math.floor(Math.random() * 1000);
  }
  
  // Set createdAt if missing
  if (!customer.createdAt) {
    customer.createdAt = Date.now();
  }
  
  var rowData = customerToRow(customer, headers);
  sheet.appendRow(rowData);
  
  return customer;
}

/**
 * Endpoint action: updateCustomer
 * Updates existing customer fields and preserves unaltered fields.
 */
function updateCustomer(customer) {
  if (!customer || !customer.id) {
    throw new Error("Customer ID is required for updating details.");
  }
  
  var sheet = getCustomersSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    throw new Error("Customer with ID " + customer.id + " not found (sheet is empty).");
  }
  
  var headers = getHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  
  var targetRowIndex = -1;
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var idColIdx = -1;
    for (var j = 0; j < headers.length; j++) {
      if (mapHeaderToKey(headers[j]) === 'id') {
        idColIdx = j;
        break;
      }
    }
    
    if (idColIdx !== -1 && row[idColIdx].toString() === customer.id.toString()) {
      targetRowIndex = i + 2; // +2 for 1-based index and skipping header row
      break;
    }
  }
  
  if (targetRowIndex === -1) {
    throw new Error("Customer with ID '" + customer.id + "' not found.");
  }
  
  // Check duplicate mobile if mobile is being changed
  if (customer.mobile) {
    var mobileToUpdate = safeTrim(customer.mobile);
    var allCustomers = getCustomers();
    var duplicate = allCustomers.find(function(c) {
      return c.id !== customer.id && c.mobile && safeTrim(c.mobile) === mobileToUpdate;
    });
    if (duplicate) {
      throw new Error("Another customer with mobile number '" + mobileToUpdate + "' already exists.");
    }
  }
  
  // Merge with existing customer to preserve non-submitted fields (e.g. prescriptions)
  var existingCustomer = getCustomerById(customer.id);
  var mergedCustomer = {};
  for (var key in existingCustomer) {
    mergedCustomer[key] = existingCustomer[key];
  }
  for (var key in customer) {
    if (customer[key] !== undefined) {
      mergedCustomer[key] = customer[key];
    }
  }
  
  var rowData = customerToRow(mergedCustomer, headers);
  sheet.getRange(targetRowIndex, 1, 1, headers.length).setValues([rowData]);
  
  return mergedCustomer;
}

/**
 * Endpoint action: searchCustomerByMobile
 * Searches for customers matching or containing the mobile number
 */
function searchCustomerByMobile(mobile) {
  if (!mobile) return [];
  var searchStr = safeTrim(mobile);
  var all = getCustomers();
  return all.filter(function(c) {
    return c.mobile && safeTrim(c.mobile).includes(searchStr);
  });
}

/**
 * Endpoint action: searchCustomerByName
 * Searches for customers matching name partially (case-insensitive)
 */
function searchCustomerByName(name) {
  if (!name) return [];
  var searchStr = safeTrim(name).toLowerCase();
  var all = getCustomers();
  return all.filter(function(c) {
    return c.name && safeTrim(c.name).toLowerCase().includes(searchStr);
  });
}

/**
 * Endpoint action: getCustomerById
 * Retrieve full customer details by ID
 */
function getCustomerById(id) {
  if (!id) {
    throw new Error("Customer ID is required.");
  }
  var all = getCustomers();
  var customer = all.find(function(c) {
    return c.id && c.id.toString() === id.toString();
  });
  if (!customer) {
    throw new Error("Customer not found with ID: " + id);
  }
  return customer;
}

/**
 * Main Web App POST Request Entrypoint
 */
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
      case 'saveInventory':
        result = saveInventory(payload.inventoryItem || payload);
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
        result = payload.prescription || {};
        break;
      case 'loadPrescriptions':
        result = [];
        break;
      case 'saveEyeTest':
        result = payload.eyeTestDetails || {};
        break;
      case 'loadEyeTests':
        result = [];
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

// Helper to get or create the Users sheet with standard columns
function getUsersSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Users");
  if (!sheet) {
    sheet = ss.insertSheet("Users");
  }
  if (sheet.getLastColumn() === 0) {
    // Write default header columns
    sheet.appendRow(["UserID", "CompanyID", "BranchID", "FullName", "Username", "Password", "Role", "Mobile", "Email", "Status", "CreatedDate", "UpdatedDate"]);
  }
  return sheet;
}

// Retrieve headers of the Users sheet safely
function getUserHeaders(sheet) {
  var lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) {
    var headers = ["UserID", "CompanyID", "BranchID", "FullName", "Username", "Password", "Role", "Mobile", "Email", "Status", "CreatedDate", "UpdatedDate"];
    sheet.appendRow(headers);
    return headers;
  }
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
}

// Map User sheet header names to exact JavaScript property names
function mapUserHeaderToKey(header) {
  var clean = safeTrim(header).toLowerCase().replace(/[\s_-]/g, '');
  if (clean === 'userid' || clean === 'id') return 'id';
  if (clean === 'companyid') return 'companyId';
  if (clean === 'branchid') return 'branchId';
  if (clean === 'fullname') return 'fullName';
  if (clean === 'username') return 'username';
  if (clean === 'password') return 'password';
  if (clean === 'role') return 'role';
  if (clean === 'mobile') return 'mobile';
  if (clean === 'email') return 'email';
  if (clean === 'status') return 'status';
  if (clean === 'createddate') return 'createdDate';
  if (clean === 'updateddate') return 'updatedDate';
  return clean;
}

// Serialize user object fields into spreadsheet row indices
function userToRow(user, headers) {
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    var key = mapUserHeaderToKey(headers[i]);
    var val = user[key];
    if (val === undefined) val = "";
    row.push(val);
  }
  return row;
}

/**
 * Endpoint action: getUsers (Read All Users)
 */
function getUsers() {
  var sheet = getUsersSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  
  var headers = getUserHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var users = [];
  
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var user = {};
    for (var j = 0; j < headers.length; j++) {
      var header = headers[j];
      var key = mapUserHeaderToKey(header);
      user[key] = row[j];
    }
    users.push(user);
  }
  return users;
}

// Custom dynamic USR-XXXXXXXX format generator
function generateUserId() {
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var result = "";
  for (var i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return "USR-" + result;
}

// Backend validation using String(value ?? "").trim()
function validateUserBackend(user, isEdit) {
  if (!user) {
    throw new Error("No user data provided");
  }
  if (!String(user.companyId ?? "").trim()) {
    throw new Error("Company required");
  }
  if (!String(user.branchId ?? "").trim()) {
    throw new Error("Branch required");
  }
  if (!String(user.fullName ?? "").trim()) {
    throw new Error("Full Name required");
  }
  if (!String(user.role ?? "").trim()) {
    throw new Error("Role required");
  }
  if (!String(user.username ?? "").trim()) {
    throw new Error("Username required");
  }
  if (!isEdit && !String(user.password ?? "").trim()) {
    throw new Error("Password required");
  }
  
  var mobileVal = String(user.mobile ?? "").trim();
  if (!mobileVal) {
    throw new Error("Mobile required");
  }
  var phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
  if (!phoneRegex.test(mobileVal)) {
    throw new Error("Invalid mobile number format.");
  }
  
  var emailVal = String(user.email ?? "").trim();
  if (emailVal) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) {
      throw new Error("Invalid email.");
    }
  }
  
  if (!String(user.status ?? "").trim()) {
    throw new Error("Status required");
  }
}

/**
 * Endpoint action: createUser
 */
function createUser(user) {
  validateUserBackend(user, false);
  
  var sheet = getUsersSheet();
  var headers = getUserHeaders(sheet);
  
  var usernameToCreate = String(user.username ?? "").trim().toLowerCase();
  
  // Validation: Check for duplicate username in the spreadsheet
  var allUsers = getUsers();
  var duplicate = allUsers.find(function(u) {
    return u.username && String(u.username ?? "").trim().toLowerCase() === usernameToCreate;
  });
  
  if (duplicate) {
    throw new Error("A user with username '" + user.username + "' already exists in the system.");
  }
  
  // Automatically generate UserID if empty or USER- format
  var idToUse;
  do {
    idToUse = generateUserId();
  } while (allUsers.some(function(u) { return u.id === idToUse; }));
  user.id = idToUse;
  
  // Set CreatedDate and UpdatedDate
  user.createdDate = Date.now();
  user.updatedDate = Date.now();
  
  if (!user.status) {
    user.status = "Active";
  }
  
  var rowData = userToRow(user, headers);
  sheet.appendRow(rowData);
  
  return user;
}

/**
 * Endpoint action: updateUser
 */
function updateUser(user) {
  if (!user || !user.id) {
    throw new Error("User ID is required for updating details.");
  }
  
  var sheet = getUsersSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    throw new Error("User with ID " + user.id + " not found (sheet is empty).");
  }
  
  var headers = getUserHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  
  var targetRowIndex = -1;
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var idColIdx = -1;
    for (var j = 0; j < headers.length; j++) {
      if (mapUserHeaderToKey(headers[j]) === 'id') {
        idColIdx = j;
        break;
      }
    }
    
    if (idColIdx !== -1 && row[idColIdx].toString() === user.id.toString()) {
      targetRowIndex = i + 2; // +2 for 1-based index and skipping header row
      break;
    }
  }
  
  if (targetRowIndex === -1) {
    throw new Error("User with ID '" + user.id + "' not found.");
  }
  
  // Merge with existing user to preserve non-submitted fields
  var existingUser = getUserById(user.id);
  var mergedUser = {};
  for (var key in existingUser) {
    mergedUser[key] = existingUser[key];
  }
  for (var key in user) {
    if (user[key] !== undefined) {
      mergedUser[key] = user[key];
    }
  }
  
  // Validate merged user
  validateUserBackend(mergedUser, true);
  
  // Check duplicate username if username is being changed
  if (user.username) {
    var usernameToUpdate = String(user.username ?? "").trim().toLowerCase();
    var allUsers = getUsers();
    var duplicate = allUsers.find(function(u) {
      return u.id !== user.id && u.username && String(u.username ?? "").trim().toLowerCase() === usernameToUpdate;
    });
    if (duplicate) {
      throw new Error("Another user with username '" + user.username + "' already exists.");
    }
  }
  
  mergedUser.updatedDate = Date.now();
  
  var rowData = userToRow(mergedUser, headers);
  sheet.getRange(targetRowIndex, 1, 1, headers.length).setValues([rowData]);
  
  return mergedUser;
}

/**
 * Endpoint action: deleteUser
 */
function deleteUser(id) {
  if (!id) {
    throw new Error("User ID is required for deletion.");
  }
  
  var sheet = getUsersSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    throw new Error("User with ID " + id + " not found.");
  }
  
  var headers = getUserHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  
  var targetRowIndex = -1;
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var idColIdx = -1;
    for (var j = 0; j < headers.length; j++) {
      if (mapUserHeaderToKey(headers[j]) === 'id') {
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
    throw new Error("User with ID '" + id + "' not found.");
  }
  
  sheet.deleteRow(targetRowIndex);
  return { id: id, deleted: true };
}

/**
 * Endpoint action: getUserById
 */
function getUserById(id) {
  if (!id) {
    throw new Error("User ID is required.");
  }
  var all = getUsers();
  var user = all.find(function(u) {
    return u.id && u.id.toString() === id.toString();
  });
  if (!user) {
    throw new Error("User not found with ID: " + id);
  }
  return user;
}

/**
 * Endpoint action: searchUser
 */
function searchUser(query) {
  if (!query) return [];
  var searchStr = safeTrim(query).toLowerCase();
  var all = getUsers();
  return all.filter(function(u) {
    return (u.fullName && safeTrim(u.fullName).toLowerCase().includes(searchStr)) ||
           (u.username && safeTrim(u.username).toLowerCase().includes(searchStr)) ||
           (u.email && safeTrim(u.email).toLowerCase().includes(searchStr)) ||
           (u.mobile && safeTrim(u.mobile).includes(searchStr)) ||
           (u.id && safeTrim(u.id).toLowerCase().includes(searchStr));
  });
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


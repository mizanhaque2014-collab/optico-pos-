/**
 * Customers Management Module (Customers.gs)
 * This module handles reading, writing, and updating customer records in the "Customers" Google Sheet.
 * It uses the canonical PascalCase schema and provides full backward compatibility for camelCase keys.
 */

// Helper to get or create the Customers sheet with standard columns
function getCustomersSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Customers");
  if (!sheet) {
    sheet = ss.insertSheet("Customers");
  }
  if (sheet.getLastColumn() === 0) {
    // Write default header columns
    sheet.appendRow(["CustomerID", "CompanyID", "BranchID", "Name", "Mobile", "DOB", "Address", "Gender", "CreatedDate"]);
  }
  return sheet;
}

// Retrieve headers of the Customers sheet safely
function getHeaders(sheet) {
  var lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) {
    var headers = ["CustomerID", "CompanyID", "BranchID", "Name", "Mobile", "DOB", "Address", "Gender", "CreatedDate"];
    sheet.appendRow(headers);
    return headers;
  }
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
}

// Map Customer sheet header names to exact JavaScript PascalCase property names
function mapCustomerHeaderToKey(header) {
  var clean = safeTrim(header).toLowerCase().replace(/[\s_-]/g, '');
  if (clean === 'customerid' || clean === 'id') return 'CustomerID';
  if (clean === 'companyid') return 'CompanyID';
  if (clean === 'branchid') return 'BranchID';
  if (clean === 'customername' || clean === 'name') return 'Name';
  if (clean === 'mobile' || clean === 'mobilenumber') return 'Mobile';
  if (clean === 'dob' || clean === 'dateofbirth') return 'DOB';
  if (clean === 'address') return 'Address';
  if (clean === 'gender') return 'Gender';
  if (clean === 'createddate' || clean === 'createdat') return 'CreatedDate';
  return header;
}

// Serialize customer object fields into spreadsheet row indices
function customerToRow(customer, headers) {
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    var key = mapCustomerHeaderToKey(headers[i]);
    var val = customer[key];
    if (val === undefined || val === null) {
      if (key === 'CustomerID') val = customer.CustomerID || customer.customerid || customer.id || customer.CustomerId;
      else if (key === 'CompanyID') val = customer.CompanyID || customer.companyId || customer.CompanyId;
      else if (key === 'BranchID') val = customer.BranchID || customer.branchId || customer.BranchId;
      else if (key === 'Name') val = customer.Name || customer.name || customer.customerName || customer.CustomerName;
      else if (key === 'Mobile') val = customer.Mobile || customer.mobile || customer.mobileNumber || customer.MobileNumber;
      else if (key === 'DOB') val = customer.DOB || customer.dob || customer.dateOfBirth || customer.DateOfBirth;
      else if (key === 'Address') val = customer.Address || customer.address;
      else if (key === 'Gender') val = customer.Gender || customer.gender;
      else if (key === 'CreatedDate') val = customer.CreatedDate || customer.createdDate || customer.createdAt;
    }
    if (val === undefined || val === null) val = "";
    row.push(val);
  }
  return row;
}

// Deserialize spreadsheet row into customer object with camelCase backward compatibility
function rowToCustomer(row, headers) {
  var customer = {};
  for (var j = 0; j < headers.length; j++) {
    var header = headers[j];
    var key = mapCustomerHeaderToKey(header);
    customer[key] = row[j];
  }
  
  // Backward compatibility for old camelCase keys
  customer.id = customer.CustomerID;
  customer.name = customer.Name;
  customer.mobile = customer.Mobile;
  customer.dob = customer.DOB;
  customer.address = customer.Address;
  customer.gender = customer.Gender;
  customer.createdDate = customer.CreatedDate;
  customer.createdAt = customer.CreatedDate;
  customer.status = "Active"; // Safe default for compatibility since status column is removed
  customer.prescriptions = []; // Default empty array since prescriptions are loaded via API separately
  
  return customer;
}

// Generate unique ID in standard format: CUST-<timestamp>
function generateCustomerId() {
  return "CUST-" + Date.now() + Math.floor(Math.random() * 1000);
}

// Backend validation check for customer data
function validateCustomerBackend(customer, isEdit) {
  if (!customer) {
    throw new Error("No customer data provided");
  }
  var name = customer.Name || customer.name;
  var mobile = customer.Mobile || customer.mobile;
  
  if (!String(name ?? "").trim()) {
    throw new Error("Customer name is required");
  }
  
  var mobileVal = String(mobile ?? "").trim();
  if (!mobileVal) {
    throw new Error("Customer mobile is required");
  }
  
  var phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
  if (!phoneRegex.test(mobileVal)) {
    throw new Error("Invalid mobile number format.");
  }
}

/**
 * Endpoint action: getCustomers (Read All Customers)
 */
function getCustomers() {
  var sheet = getCustomersSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  
  var headers = getHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var customers = [];
  
  for (var i = 0; i < values.length; i++) {
    customers.push(rowToCustomer(values[i], headers));
  }
  return customers;
}

/**
 * Endpoint action: getCustomerById
 */
function getCustomerById(id) {
  if (!id) {
    throw new Error("Customer ID is required.");
  }
  var all = getCustomers();
  var customer = all.find(function(c) {
    var cId = c.CustomerID || c.id;
    return cId && cId.toString() === id.toString();
  });
  if (!customer) {
    throw new Error("Customer not found with ID: " + id);
  }
  return customer;
}

/**
 * Endpoint action: createCustomer
 * Saves new customer, automatically generates CustomerID, and prevents duplicate mobile numbers.
 */
function createCustomer(customer) {
  validateCustomerBackend(customer, false);
  
  var sheet = getCustomersSheet();
  var headers = getHeaders(sheet);
  
  var mobileVal = customer.Mobile || customer.mobile;
  var mobileToCreate = safeTrim(mobileVal);
  
  // Validation: Check for duplicates in the spreadsheet
  var allCustomers = getCustomers();
  var duplicate = allCustomers.find(function(c) {
    var cMobile = c.Mobile || c.mobile;
    return cMobile && safeTrim(cMobile).toString() === mobileToCreate;
  });
  
  if (duplicate) {
    throw new Error("A customer with mobile number '" + mobileToCreate + "' already exists in the system.");
  }
  
  // Automatically generate CustomerID if empty
  var idToUse;
  do {
    idToUse = generateCustomerId();
  } while (allCustomers.some(function(c) {
    var cId = c.CustomerID || c.id;
    return cId === idToUse;
  }));
  
  customer.CustomerID = idToUse;
  customer.id = idToUse; // compatibility
  
  // Set CreatedDate
  var now = Date.now();
  customer.CreatedDate = now;
  customer.createdDate = now; // compatibility
  customer.createdAt = now; // compatibility
  
  // Fallbacks for missing optional compatibility fields
  customer.status = "Active";
  customer.prescriptions = [];
  
  var rowData = customerToRow(customer, headers);
  sheet.appendRow(rowData);
  
  return customer;
}

/**
 * Endpoint action: updateCustomer
 * Updates existing customer fields and preserves unaltered fields.
 */
function updateCustomer(customer) {
  var customerId = customer.CustomerID || customer.id;
  if (!customerId || customerId.toString().trim() === "") {
    throw new Error("Customer ID is required for updating details.");
  }
  
  if (customerId.toString().indexOf("local") !== -1) {
    customer.CustomerID = "";
    customer.id = "";
    return createCustomer(customer);
  }
  
  var sheet = getCustomersSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    customer.CustomerID = "";
    customer.id = "";
    return createCustomer(customer);
  }
  
  var headers = getHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  
  var targetRowIndex = -1;
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var idColIdx = -1;
    for (var j = 0; j < headers.length; j++) {
      var headerKey = mapCustomerHeaderToKey(headers[j]);
      if (headerKey === 'CustomerID' || headerKey === 'id') {
        idColIdx = j;
        break;
      }
    }
    
    if (idColIdx !== -1 && row[idColIdx].toString() === customerId.toString()) {
      targetRowIndex = i + 2; // +2 for 1-based index and skipping header row
      break;
    }
  }
  
  if (targetRowIndex === -1) {
    customer.CustomerID = "";
    customer.id = "";
    return createCustomer(customer);
  }
  
  // Check duplicate mobile if mobile is being changed
  var mobileVal = customer.Mobile || customer.mobile;
  if (mobileVal) {
    var mobileToUpdate = safeTrim(mobileVal);
    var allCustomers = getCustomers();
    var duplicate = allCustomers.find(function(c) {
      var cId = c.CustomerID || c.id;
      var cMobile = c.Mobile || c.mobile;
      return cId !== customerId && cMobile && safeTrim(cMobile).toString() === mobileToUpdate;
    });
    if (duplicate) {
      throw new Error("Another customer with mobile number '" + mobileToUpdate + "' already exists.");
    }
  }
  
  // Merge with existing customer to preserve non-submitted fields
  var existingCustomer = getCustomerById(customerId);
  var mergedCustomer = {};
  for (var key in existingCustomer) {
    mergedCustomer[key] = existingCustomer[key];
  }
  for (var key in customer) {
    if (customer[key] !== undefined) {
      mergedCustomer[key] = customer[key];
    }
  }
  
  // Validate merged customer
  validateCustomerBackend(mergedCustomer, true);
  
  var rowData = customerToRow(mergedCustomer, headers);
  sheet.getRange(targetRowIndex, 1, 1, headers.length).setValues([rowData]);
  
  return mergedCustomer;
}

/**
 * Endpoint action: deleteCustomer
 */
function deleteCustomer(id) {
  if (!id) {
    throw new Error("Customer ID is required for deletion.");
  }
  
  var sheet = getCustomersSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    throw new Error("Customer with ID " + id + " not found.");
  }
  
  var headers = getHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  
  var targetRowIndex = -1;
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var idColIdx = -1;
    for (var j = 0; j < headers.length; j++) {
      var headerKey = mapCustomerHeaderToKey(headers[j]);
      if (headerKey === 'CustomerID' || headerKey === 'id') {
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
    throw new Error("Customer with ID '" + id + "' not found.");
  }
  
  sheet.deleteRow(targetRowIndex);
  return { id: id, deleted: true };
}

/**
 * Endpoint action: searchCustomerByMobile
 */
function searchCustomerByMobile(mobile) {
  if (!mobile) return [];
  var searchStr = safeTrim(mobile);
  var all = getCustomers();
  return all.filter(function(c) {
    var cMobile = c.Mobile || c.mobile;
    return cMobile && safeTrim(cMobile).toString().includes(searchStr);
  });
}

/**
 * Endpoint action: searchCustomerByName
 */
function searchCustomerByName(name) {
  if (!name) return [];
  var searchStr = safeTrim(name).toLowerCase();
  var all = getCustomers();
  return all.filter(function(c) {
    var cName = c.Name || c.name;
    return cName && safeTrim(cName).toString().toLowerCase().includes(searchStr);
  });
}

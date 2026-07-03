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
  var clean = header.toString().trim().toLowerCase();
  if (clean === 'customerid' || clean === 'id') return 'id';
  if (clean === 'customername' || clean === 'name') return 'name';
  if (clean === 'mobilenumber' || clean === 'mobile' || clean === 'mobile_number') return 'mobile';
  if (clean === 'dateofbirth' || clean === 'dob') return 'dob';
  if (clean === 'address') return 'address';
  if (clean === 'status') return 'status';
  if (clean === 'prescriptions') return 'prescriptions';
  if (clean === 'createdat' || clean === 'created_at') return 'createdAt';
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
  var mobileToCreate = customer.mobile.toString().trim();
  
  // Validation: Check for duplicates in the spreadsheet
  var allCustomers = getCustomers();
  var duplicate = allCustomers.find(function(c) {
    return c.mobile && c.mobile.toString().trim() === mobileToCreate;
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
    var mobileToUpdate = customer.mobile.toString().trim();
    var allCustomers = getCustomers();
    var duplicate = allCustomers.find(function(c) {
      return c.id !== customer.id && c.mobile && c.mobile.toString().trim() === mobileToUpdate;
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
  var searchStr = mobile.toString().trim();
  var all = getCustomers();
  return all.filter(function(c) {
    return c.mobile && c.mobile.toString().includes(searchStr);
  });
}

/**
 * Endpoint action: searchCustomerByName
 * Searches for customers matching name partially (case-insensitive)
 */
function searchCustomerByName(name) {
  if (!name) return [];
  var searchStr = name.toString().toLowerCase().trim();
  var all = getCustomers();
  return all.filter(function(c) {
    return c.name && c.name.toString().toLowerCase().includes(searchStr);
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

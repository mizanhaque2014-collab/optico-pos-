// ==========================================
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
}
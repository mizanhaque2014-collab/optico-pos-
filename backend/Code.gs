// ==========================================
// CODE.GS - Main Router
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
}
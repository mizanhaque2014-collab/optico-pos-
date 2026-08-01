// ==========================================
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
    inv.InvoiceNumber = Math.floor(100000 + Math.random() * 900000).toString();
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
}
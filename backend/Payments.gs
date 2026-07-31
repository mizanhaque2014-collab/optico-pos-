// ==========================================
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
}
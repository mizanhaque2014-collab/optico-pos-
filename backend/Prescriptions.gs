// ==========================================
// PRESCRIPTIONS.GS
// ==========================================
var PRE_HEADERS = ["PrescriptionID", "CustomerID", "CompanyID", "BranchID", "DoctorName", "ExamDate", "Complaint", "Diagnosis", "Advice", "Remarks", "OD_Distance_SPH", "OD_Distance_CYL", "OD_Distance_AXIS", "OS_Distance_SPH", "OS_Distance_CYL", "OS_Distance_AXIS", "AddPower", "PD_Distance", "PD_Near", "Source", "CreatedDate"];

function getPrescriptions() {
  getSheetByNameOrCreate(CONFIG.SHEETS.PRESCRIPTIONS, PRE_HEADERS);
  return getAllRecords(CONFIG.SHEETS.PRESCRIPTIONS);
}

function createPrescription(p) { return saveRecord(CONFIG.SHEETS.PRESCRIPTIONS, "PrescriptionID", p, "PRE"); }
function updatePrescription(p) { return saveRecord(CONFIG.SHEETS.PRESCRIPTIONS, "PrescriptionID", p, "PRE"); }
function deletePrescription(id) { return deleteRecord(CONFIG.SHEETS.PRESCRIPTIONS, "PrescriptionID", id); }
function getPrescriptionById(id) {
  var all = getPrescriptions();
  return all.find(function(p) { return p.PrescriptionID === id || p.id === id; });
}
function getPrescriptionsByCustomer(customerId) {
  var all = getPrescriptions();
  return all.filter(function(p) { return p.CustomerID === customerId || p.customerId === customerId; });
}
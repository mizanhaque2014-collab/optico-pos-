// ==========================================
// COMPANIES.GS
// ==========================================
var COMPANY_HEADERS = ["CompanyID", "CompanyName", "OwnerName", "Mobile", "Email", "Status", "CreatedAt", "UpdatedAt"];

function getCompanies() {
  getSheetByNameOrCreate(CONFIG.SHEETS.COMPANIES, COMPANY_HEADERS);
  return getAllRecords(CONFIG.SHEETS.COMPANIES);
}

function createCompany(c) { return saveRecord(CONFIG.SHEETS.COMPANIES, "CompanyID", c, "COMP"); }
function updateCompany(c) { return saveRecord(CONFIG.SHEETS.COMPANIES, "CompanyID", c, "COMP"); }
function deleteCompany(id) { return deleteRecord(CONFIG.SHEETS.COMPANIES, "CompanyID", id); }
function getCompanyById(id) {
  var all = getCompanies();
  return all.find(function(c) { return c.CompanyID === id || c.id === id; });
}
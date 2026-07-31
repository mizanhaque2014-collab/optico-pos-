// ==========================================
// BRANCHES.GS
// ==========================================
var BRANCH_HEADERS = ["BranchID", "CompanyID", "BranchName", "Address", "Mobile", "Email", "Status", "CreatedAt", "UpdatedAt"];

function getBranches() {
  getSheetByNameOrCreate(CONFIG.SHEETS.BRANCHES, BRANCH_HEADERS);
  return getAllRecords(CONFIG.SHEETS.BRANCHES);
}

function createBranch(b) { return saveRecord(CONFIG.SHEETS.BRANCHES, "BranchID", b, "BR"); }
function updateBranch(b) { return saveRecord(CONFIG.SHEETS.BRANCHES, "BranchID", b, "BR"); }
function deleteBranch(id) { return deleteRecord(CONFIG.SHEETS.BRANCHES, "BranchID", id); }
function getBranchById(id) {
  var all = getBranches();
  return all.find(function(b) { return b.BranchID === id || b.id === id; });
}
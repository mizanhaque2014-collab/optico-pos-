// ==========================================
// USERS.GS
// ==========================================
var USER_HEADERS = ["UserID", "CompanyID", "BranchID", "FullName", "Username", "Password", "Role", "Mobile", "Email", "Status", "CreatedDate"];

function getUsers() {
  getSheetByNameOrCreate(CONFIG.SHEETS.USERS, USER_HEADERS);
  return getAllRecords(CONFIG.SHEETS.USERS);
}

function createUser(u) { return saveRecord(CONFIG.SHEETS.USERS, "UserID", u, "USR"); }
function updateUser(u) { return saveRecord(CONFIG.SHEETS.USERS, "UserID", u, "USR"); }
function deleteUser(id) { return deleteRecord(CONFIG.SHEETS.USERS, "UserID", id); }
function getUserById(id) {
  var all = getUsers();
  return all.find(function(u) { return u.UserID === id || u.id === id; });
}
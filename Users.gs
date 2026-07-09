/**
 * Users Management Module (Users.gs)
 * This module handles reading, writing, and updating user records in the "Users" Google Sheet.
 */

// Helper to get or create the Users sheet with standard columns
function getUsersSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Users");
  if (!sheet) {
    sheet = ss.insertSheet("Users");
  }
  if (sheet.getLastColumn() === 0) {
    // Write default header columns
    sheet.appendRow(["UserID", "CompanyID", "BranchID", "FullName", "Username", "Password", "Role", "Mobile", "Email", "Status", "CreatedDate"]);
  }
  return sheet;
}

// Retrieve headers of the Users sheet safely
function getUserHeaders(sheet) {
  var lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) {
    var headers = ["UserID", "CompanyID", "BranchID", "FullName", "Username", "Password", "Role", "Mobile", "Email", "Status", "CreatedDate"];
    sheet.appendRow(headers);
    return headers;
  }
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
}

// Map User sheet header names to exact JavaScript property names
function mapUserHeaderToKey(header) {
  var clean = safeTrim(header).toLowerCase().replace(/[\s_-]/g, '');
  if (clean === 'userid' || clean === 'id') return 'UserID';
  if (clean === 'companyid') return 'CompanyID';
  if (clean === 'branchid') return 'BranchID';
  if (clean === 'fullname') return 'FullName';
  if (clean === 'username') return 'Username';
  if (clean === 'password') return 'Password';
  if (clean === 'role') return 'Role';
  if (clean === 'mobile') return 'Mobile';
  if (clean === 'email') return 'Email';
  if (clean === 'status') return 'Status';
  if (clean === 'createddate') return 'CreatedDate';
  return header;
}

// Serialize user object fields into spreadsheet row indices
function userToRow(user, headers) {
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    var key = mapUserHeaderToKey(headers[i]);
    var val = user[key];
    if (val === undefined) {
      if (key === 'UserID') val = user.UserID || user.userId || user.id || user.UserId;
      else if (key === 'CompanyID') val = user.CompanyID || user.companyId || user.CompanyId;
      else if (key === 'BranchID') val = user.BranchID || user.branchId || user.BranchId;
      else if (key === 'FullName') val = user.FullName || user.fullName || user.fullname;
      else if (key === 'Username') val = user.Username || user.username;
      else if (key === 'Password') val = user.Password || user.password;
      else if (key === 'Role') val = user.Role || user.role;
      else if (key === 'Mobile') val = user.Mobile || user.mobile;
      else if (key === 'Email') val = user.Email || user.email;
      else if (key === 'Status') val = user.Status || user.status;
      else if (key === 'CreatedDate') val = user.CreatedDate || user.createdDate;
    }
    if (val === undefined) val = "";
    row.push(val);
  }
  return row;
}

// Deserialize spreadsheet row into user object
function rowToUser(row, headers) {
  var user = {};
  for (var j = 0; j < headers.length; j++) {
    var header = headers[j];
    var key = mapUserHeaderToKey(header);
    user[key] = row[j];
  }
  return user;
}

// Custom dynamic USR-XXXXXXXX format generator
function generateUserId() {
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var result = "";
  for (var i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return "USR-" + result;
}

// Backend validation using robust, clean checks
function validateUserBackend(user, isEdit) {
  if (!user) {
    throw new Error("No user data provided");
  }
  var companyId = user.CompanyID || user.companyId || user.CompanyId;
  var branchId = user.BranchID || user.branchId || user.BranchId;
  var fullName = user.FullName || user.fullName || user.fullname;
  var role = user.Role || user.role;
  var username = user.Username || user.username;
  var password = user.Password || user.password;
  var mobile = user.Mobile || user.mobile;
  var email = user.Email || user.email;
  var status = user.Status || user.status;

  if (!String(companyId ?? "").trim()) {
    throw new Error("Company required");
  }
  if (!String(branchId ?? "").trim()) {
    throw new Error("Branch required");
  }
  if (!String(fullName ?? "").trim()) {
    throw new Error("Full Name required");
  }
  if (!String(role ?? "").trim()) {
    throw new Error("Role required");
  }
  if (!String(username ?? "").trim()) {
    throw new Error("Username required");
  }
  if (!isEdit && !String(password ?? "").trim()) {
    throw new Error("Password required");
  }
  
  var mobileVal = String(mobile ?? "").trim();
  if (!mobileVal) {
    throw new Error("Mobile required");
  }
  var phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
  if (!phoneRegex.test(mobileVal)) {
    throw new Error("Invalid mobile number format.");
  }
  
  var emailVal = String(email ?? "").trim();
  if (emailVal) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) {
      throw new Error("Invalid email.");
    }
  }
  
  if (!String(status ?? "").trim()) {
    throw new Error("Status required");
  }
}

/**
 * Endpoint action: getUsers (Read All Users)
 */
function getUsers() {
  var sheet = getUsersSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  
  var headers = getUserHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var users = [];
  
  for (var i = 0; i < values.length; i++) {
    users.push(rowToUser(values[i], headers));
  }
  return users;
}

/**
 * Endpoint action: getUserById
 */
function getUserById(id) {
  if (!id) {
    throw new Error("User ID is required.");
  }
  var all = getUsers();
  var user = all.find(function(u) {
    var uId = u.UserID || u.id || u.userId;
    return uId && uId.toString() === id.toString();
  });
  if (!user) {
    throw new Error("User not found with ID: " + id);
  }
  return user;
}

/**
 * Endpoint action: createUser
 */
function createUser(user) {
  validateUserBackend(user, false);
  
  var sheet = getUsersSheet();
  var headers = getUserHeaders(sheet);
  
  var usernameToCreate = String((user.Username || user.username) ?? "").trim().toLowerCase();
  
  // Validation: Check for duplicate username in the spreadsheet
  var allUsers = getUsers();
  var duplicate = allUsers.find(function(u) {
    var uName = u.Username || u.username;
    return uName && String(uName ?? "").trim().toLowerCase() === usernameToCreate;
  });
  
  if (duplicate) {
    throw new Error("A user with username '" + (user.Username || user.username) + "' already exists in the system.");
  }
  
  // Automatically generate UserID if empty or USER- format
  var idToUse;
  do {
    idToUse = generateUserId();
  } while (allUsers.some(function(u) {
    var uId = u.UserID || u.id || u.userId;
    return uId === idToUse;
  }));
  
  user.UserID = idToUse;
  user.id = idToUse; // safety fallback
  
  // Set CreatedDate
  var now = Date.now();
  user.CreatedDate = now;
  user.createdDate = now; // safety fallback
  
  if (!user.Status && !user.status) {
    user.Status = "Active";
    user.status = "Active";
  }
  
  var rowData = userToRow(user, headers);
  sheet.appendRow(rowData);
  
  return user;
}

/**
 * Endpoint action: updateUser
 */
function updateUser(user) {
  var userId = user.UserID || user.id || user.userId;
  if (!userId) {
    throw new Error("User ID is required for updating details.");
  }
  
  var sheet = getUsersSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    throw new Error("User with ID " + userId + " not found (sheet is empty).");
  }
  
  var headers = getUserHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  
  var targetRowIndex = -1;
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var idColIdx = -1;
    for (var j = 0; j < headers.length; j++) {
      var headerKey = mapUserHeaderToKey(headers[j]);
      if (headerKey === 'UserID' || headerKey === 'id') {
        idColIdx = j;
        break;
      }
    }
    
    if (idColIdx !== -1 && row[idColIdx].toString() === userId.toString()) {
      targetRowIndex = i + 2; // +2 for 1-based index and skipping header row
      break;
    }
  }
  
  if (targetRowIndex === -1) {
    throw new Error("User with ID '" + userId + "' not found.");
  }
  
  // Merge with existing user to preserve non-submitted fields
  var existingUser = getUserById(userId);
  var mergedUser = {};
  for (var key in existingUser) {
    mergedUser[key] = existingUser[key];
  }
  for (var key in user) {
    if (user[key] !== undefined) {
      mergedUser[key] = user[key];
    }
  }
  
  // Validate merged user
  validateUserBackend(mergedUser, true);
  
  // Check duplicate username if username is being changed
  var usernameVal = user.Username || user.username;
  if (usernameVal) {
    var usernameToUpdate = String(usernameVal ?? "").trim().toLowerCase();
    var allUsers = getUsers();
    var duplicate = allUsers.find(function(u) {
      var uId = u.UserID || u.id || u.userId;
      var uName = u.Username || u.username;
      return uId !== userId && uName && String(uName ?? "").trim().toLowerCase() === usernameToUpdate;
    });
    if (duplicate) {
      throw new Error("Another user with username '" + usernameVal + "' already exists.");
    }
  }
  
  var rowData = userToRow(mergedUser, headers);
  sheet.getRange(targetRowIndex, 1, 1, headers.length).setValues([rowData]);
  
  return mergedUser;
}

/**
 * Endpoint action: deleteUser
 */
function deleteUser(id) {
  if (!id) {
    throw new Error("User ID is required for deletion.");
  }
  
  var sheet = getUsersSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    throw new Error("User with ID " + id + " not found.");
  }
  
  var headers = getUserHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  
  var targetRowIndex = -1;
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var idColIdx = -1;
    for (var j = 0; j < headers.length; j++) {
      var headerKey = mapUserHeaderToKey(headers[j]);
      if (headerKey === 'UserID' || headerKey === 'id') {
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
    throw new Error("User with ID '" + id + "' not found.");
  }
  
  sheet.deleteRow(targetRowIndex);
  return { id: id, deleted: true };
}

/**
 * Endpoint action: searchUser
 */
function searchUser(query) {
  if (!query) return [];
  var searchStr = safeTrim(query).toLowerCase();
  var all = getUsers();
  return all.filter(function(u) {
    return (u.FullName && safeTrim(u.FullName).toLowerCase().includes(searchStr)) ||
           (u.Username && safeTrim(u.Username).toLowerCase().includes(searchStr)) ||
           (u.Email && safeTrim(u.Email).toLowerCase().includes(searchStr)) ||
           (u.Mobile && safeTrim(u.Mobile).includes(searchStr)) ||
           (u.UserID && safeTrim(u.UserID).toLowerCase().includes(searchStr));
  });
}

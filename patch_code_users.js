const fs = require('fs');
let code = fs.readFileSync('Code.gs', 'utf8');

const injection = `
// ======================
// USER MANAGEMENT ADDITIONS
// ======================

function getUsersSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Users");
  if (!sheet) {
    sheet = ss.insertSheet("Users");
    var headers = ["id", "username", "password", "role", "name", "email", "phone", "branches", "status", "createdAt", "updatedAt"];
    sheet.appendRow(headers);
  }
  return sheet;
}

function getUsers() {
  var sheet = getUsersSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var users = [];
  
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var u = {};
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j];
      var val = row[j];
      if (key === 'branches') {
        try { u[key] = val ? JSON.parse(val) : []; } catch(e) { u[key] = []; }
      } else {
        u[key] = val;
      }
    }
    users.push(u);
  }
  return users;
}

function saveUser(u) {
  if (!u) throw new Error("No user provided");
  var sheet = getUsersSheet();
  var lastRow = sheet.getLastRow();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  var uid = u.id || u.UserID || u.userId;
  if (!uid) {
    uid = "USR-" + Date.now();
    u.id = uid;
  }
  
  var targetRowIndex = -1;
  if (lastRow > 1) {
    var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    for (var i = 0; i < values.length; i++) {
      if (values[i][0].toString() === uid.toString()) {
        targetRowIndex = i + 2;
        break;
      }
    }
  }
  
  var rowData = [];
  for (var k = 0; k < headers.length; k++) {
    var key = headers[k];
    var val = u[key] !== undefined ? u[key] : "";
    if (key === 'branches') {
      val = val ? JSON.stringify(val) : "[]";
    }
    if (key === 'createdAt' && !val) val = Date.now();
    if (key === 'updatedAt') val = Date.now();
    rowData.push(val);
  }
  
  if (targetRowIndex !== -1) {
    sheet.getRange(targetRowIndex, 1, 1, headers.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  SpreadsheetApp.flush();
  return u;
}

function createUser(u) { return saveUser(u); }
function updateUser(u) { return saveUser(u); }

function deleteUser(id) {
  if (!id) throw new Error("User ID is required");
  var sheet = getUsersSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  
  for (var i = 0; i < values.length; i++) {
    if (values[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 2);
      SpreadsheetApp.flush();
      return true;
    }
  }
  return false;
}

function getUserById(id) {
  if (!id) return null;
  var all = getUsers();
  return all.find(function(u) {
    return u.id && u.id.toString() === id.toString();
  }) || null;
}

function searchUser(query) {
  if (!query) return [];
  var searchStr = query.toString().toLowerCase().trim();
  var all = getUsers();
  return all.filter(function(u) {
    var un = (u.username || "").toString().toLowerCase();
    var n = (u.name || "").toString().toLowerCase();
    return un.includes(searchStr) || n.includes(searchStr);
  });
}
`;

if (!code.includes('function getUsersSheet()')) {
  code = code + '\n' + injection;
  fs.writeFileSync('Code.gs', code);
  console.log("Injected user management logic.");
}

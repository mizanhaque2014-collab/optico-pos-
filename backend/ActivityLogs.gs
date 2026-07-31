// ==========================================
// ACTIVITYLOGS.GS
// ==========================================
var LOG_HEADERS = ["LogID", "Timestamp", "Action", "UserID", "Details"];

function logActivity(log) {
  return saveRecord(CONFIG.SHEETS.ACTIVITY_LOGS, "LogID", log, "LOG");
}

function getActivityLogs() {
  getSheetByNameOrCreate(CONFIG.SHEETS.ACTIVITY_LOGS, LOG_HEADERS);
  return getAllRecords(CONFIG.SHEETS.ACTIVITY_LOGS);
}
function logBackend(msg, data) {
  try {
    var details = typeof data === 'object' ? JSON.stringify(data) : (data || "");
    logActivity({ Action: msg, Details: details });
  } catch(e) {}
}
// ==========================================
// EYETESTS.GS
// ==========================================
var EYETEST_HEADERS = ["id", "customerId", "companyId", "branchId", "eyeTestDate", "optometristName", "sphOd", "cylOd", "axisOd", "sphOs", "cylOs", "axisOs", "addPower", "pdDistance", "pdNear", "remarks", "createdAt"];

function loadEyeTests(customerId) {
  getSheetByNameOrCreate(CONFIG.SHEETS.EYE_TESTS, EYETEST_HEADERS);
  var all = getAllRecords(CONFIG.SHEETS.EYE_TESTS);
  return all.filter(function(et) { return et.customerId === customerId || et.CustomerID === customerId; });
}

function saveEyeTest(et) {
  return saveRecord(CONFIG.SHEETS.EYE_TESTS, "id", et, "ET");
}
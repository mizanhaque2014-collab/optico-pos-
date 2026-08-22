const fs = require('fs');

// 1. Patch Code.gs
let codeGs = fs.readFileSync('Code.gs', 'utf8');

// Add DSR configuration
if (!codeGs.includes('DSR: "DSR"')) {
  codeGs = codeGs.replace(
    /ACTIVITY_LOGS: "ActivityLogs"/,
    'ACTIVITY_LOGS: "ActivityLogs",\n    DSR: "DSR"'
  );
}

// Add DSR functions
const dsrFuncs = `
// ==========================================
// DSR.GS - Daily Sales Report Persistence
// ==========================================
var DSR_HEADERS = ["DSR_ID", "ReportDate", "CompanyID", "BranchID", "DirectSales", "SalesOrders", "DeliveryCollections", "TotalBusiness", "CashCollected", "UpiCollected", "CardCollected", "PendingOrdersCount", "PendingOrdersValue", "PendingPaymentsCount", "PendingPaymentsValue", "GeneratedAt"];

function saveDSRRecord(dsr) {
  if (!CONFIG.SHEETS.DSR) CONFIG.SHEETS.DSR = "DSR";
  getSheetByNameOrCreate(CONFIG.SHEETS.DSR, DSR_HEADERS);
  
  if (!dsr.DSR_ID) {
    var d = dsr.ReportDate || new Date().toISOString().split('T')[0];
    var b = dsr.BranchID || "ALL";
    dsr.DSR_ID = "DSR-" + d + "-" + b;
  }
  
  return saveRecord(CONFIG.SHEETS.DSR, "DSR_ID", dsr, "DSR");
}

function getDSRRecords() {
  if (!CONFIG.SHEETS.DSR) CONFIG.SHEETS.DSR = "DSR";
  getSheetByNameOrCreate(CONFIG.SHEETS.DSR, DSR_HEADERS);
  return getAllRecords(CONFIG.SHEETS.DSR);
}
`;

if (!codeGs.includes('var DSR_HEADERS')) {
  codeGs += "\n" + dsrFuncs;
}

// Add to doPost
if (!codeGs.includes("case 'saveDSRRecord':")) {
  codeGs = codeGs.replace(
    /case 'getDailySalesReport': result = getDailySalesReport[^;]+; break;/,
    "case 'getDailySalesReport': result = getDailySalesReport(payload.companyId, payload.branchId, payload.startDate, payload.endDate); break;\n      case 'saveDSRRecord': result = saveDSRRecord(payload.dsr || payload); break;\n      case 'getDSRRecords': result = getDSRRecords(); break;"
  );
}

fs.writeFileSync('Code.gs', codeGs);
fs.writeFileSync('Code.js', codeGs);

// 2. Patch invoiceService.ts
let invService = fs.readFileSync('lib/services/invoiceService.ts', 'utf8');
if (!invService.includes('saveDSRRecord')) {
  const saveDsrCode = `
  async saveDSRRecord(dsrData: any): Promise<boolean> {
    try {
      await apiCall<any>('saveDSRRecord', { dsr: dsrData });
      return true;
    } catch (e) {
      console.warn('saveDSRRecord failed:', e);
      return false;
    }
  },
`;
  invService = invService.replace(
    /async getDailySalesReport/,
    saveDsrCode + "\n  async getDailySalesReport"
  );
  fs.writeFileSync('lib/services/invoiceService.ts', invService);
}

// 3. Patch store.ts
let storeCode = fs.readFileSync('lib/store.ts', 'utf8');
if (!storeCode.includes('saveDSRRecord')) {
  const storeAdd = `
  const saveDSRRecord = async (dsrData: any) => {
    return await invoiceService.saveDSRRecord(dsrData);
  };
`;
  storeCode = storeCode.replace(
    /const getDailySalesReport =/,
    storeAdd + "\n  const getDailySalesReport ="
  );
  storeCode = storeCode.replace(
    /getDailySalesReport,/g,
    "getDailySalesReport,\n    saveDSRRecord,"
  );
  fs.writeFileSync('lib/store.ts', storeCode);
}

console.log("Persistence patched successfully.");

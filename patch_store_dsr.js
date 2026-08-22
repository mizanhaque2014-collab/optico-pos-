const fs = require('fs');
let code = fs.readFileSync('lib/store.ts', 'utf8');

const storeAdd = `
  const getDailySalesReport = async (companyId: string, branchId: string, startDate: string, endDate: string) => {
    return await invoiceService.getDailySalesReport(companyId, branchId, startDate, endDate);
  };
`;

code = code.replace(
  /const saveInvoice = /g,
  storeAdd + "\n  const saveInvoice = "
);

code = code.replace(
  /getInvoices,/g,
  "getInvoices,\n    getDailySalesReport,"
);

fs.writeFileSync('lib/store.ts', code);
console.log("Patched store.ts");

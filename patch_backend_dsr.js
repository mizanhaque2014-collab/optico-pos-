const fs = require('fs');
let code = fs.readFileSync('Code.gs', 'utf8');

// Add getDailySalesReport inside doPost switch
code = code.replace(
  /case 'searchInvoices': result = searchInvoices\(payload\.keyword \|\| payload\.search\); break;/g,
  `case 'searchInvoices': result = searchInvoices(payload.keyword || payload.search); break;\n      case 'getDailySalesReport': result = getDailySalesReport(payload.companyId, payload.branchId, payload.startDate, payload.endDate); break;`
);

// Add getDailySalesReport function definition
const dsrFunc = `
function getDailySalesReport(companyId, branchId, startDate, endDate) {
  var allInvoices = getInvoices();
  var filteredInvoices = [];
  var start = startDate ? new Date(startDate).getTime() : 0;
  var end = endDate ? new Date(endDate).getTime() : Number.MAX_SAFE_INTEGER;
  
  for (var i = 0; i < allInvoices.length; i++) {
    var inv = allInvoices[i];
    
    // Company Filter
    if (companyId && companyId !== 'ALL') {
      var invComp = inv.CompanyID || inv.companyId;
      if (invComp && String(invComp).trim() !== String(companyId).trim()) continue;
    }
    
    // Branch Filter
    if (branchId && branchId !== 'ALL') {
      var invBranch = inv.BranchID || inv.branchId;
      if (invBranch && String(invBranch).trim() !== String(branchId).trim()) continue;
    }
    
    // Date Filter (using CreatedDate or InvoiceDate)
    var dStr = inv.CreatedDate || inv.InvoiceDate || inv.CreatedAt;
    var dTime = dStr ? new Date(dStr).getTime() : 0;
    
    if (dTime >= start && dTime <= end) {
      filteredInvoices.push(inv);
    }
  }
  
  // To strictly follow the "calculate the report from existing sheets" we can return both.
  // The frontend calculates everything properly if we just return the invoices.
  return {
    invoices: filteredInvoices
  };
}
`;

if (!code.includes('function getDailySalesReport')) {
  code += '\n' + dsrFunc;
}

fs.writeFileSync('Code.gs', code);
fs.writeFileSync('Code.js', code);
console.log("Patched Code.gs and Code.js");

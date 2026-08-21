const fs = require('fs');
let code = fs.readFileSync('components/DailySalesReportView.tsx', 'utf8');

const regex = /const filteredInvoices = useMemo\(\(\) => \{\n    return invoices\.filter\(inv => \{\n      \/\/ 1\. Branch filter mapping simulation inside core invoice properties\s*\/\/ 2\. Date Range filter/;

const newCode = `const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Company Admin Filter
      if (session?.role !== 'SUPER_ADMIN') {
         const invCompanyId = (inv as any).companyId || (inv as any).CompanyID || '';
         if (invCompanyId && invCompanyId !== session?.companyID) return false;
      }
      // 1. Branch filter
      if (session?.branchID && session?.branchID !== 'ALL') {
         const invBranchId = (inv as any).branchId || (inv as any).BranchID || '';
         if (invBranchId !== session?.branchID) return false;
      }
      
      // 2. Date Range filter`;

code = code.replace(regex, newCode);

// Add dependencies to useMemo
code = code.replace(
  /\[invoices, dateRange, dateBoundaries, customStart, customEnd, typeFilters\]\);/,
  `[invoices, dateRange, dateBoundaries, customStart, customEnd, typeFilters, session?.branchID, session?.companyID, session?.role]);`
);

// We should also replace the selectedBranch usage inside this view! It used `selectedBranch = 'all'`. Let's grep for `selectedBranch` in DailySalesReportView.
fs.writeFileSync('components/DailySalesReportView.tsx', code);

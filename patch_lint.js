const fs = require('fs');

function patchFile(file, searchRegex, replacement) {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(searchRegex, replacement);
  fs.writeFileSync(file, code);
}

patchFile('components/StockInventoryView.tsx', 
  /\[stockItems, selectedCategory, searchQuery\]\);/g, 
  `[stockItems, selectedCategory, searchQuery, selectedBranchId, selectedBranchName]);`
);

patchFile('components/WhatsAppMarketingView.tsx', 
  /\[processedCustomers, customerFilter, searchTerm\]\);/, 
  `[processedCustomers, customerFilter, searchTerm, session?.branchID, session?.companyID, session?.role]);`
);

patchFile('components/DailySalesReportView.tsx', 
  /\[invoices, dateRange, dateBoundaries, customStart, customEnd, typeFilters, session\?\.branchID, session\?\.companyID, session\?\.role\]\);/, 
  `[invoices, dateRange, dateBoundaries, customStart, customEnd, typeFilters, session?.branchID, session?.companyID, session?.role, referenceTime]);`
);


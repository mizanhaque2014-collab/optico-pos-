const fs = require('fs');
let code = fs.readFileSync('components/DailySalesReportView.tsx', 'utf8');

const useEBlock = code.match(/const \[isLoading[\s\S]*?}, \[dateRange, customStartDate, customEndDate, session\?\.companyID, session\?\.branchID, dateBoundaries\]\);/)[0];
const dateBBlock = code.match(/\/\/ Compute date bound filters[\s\S]*?}, \[\]\);/)[0];

code = code.replace(useEBlock, "USEEFFECT_PLACEHOLDER");
code = code.replace(dateBBlock, "DATEBOUND_PLACEHOLDER");

code = code.replace("USEEFFECT_PLACEHOLDER", dateBBlock);
code = code.replace("DATEBOUND_PLACEHOLDER", useEBlock);

fs.writeFileSync('components/DailySalesReportView.tsx', code);
console.log("Fixed order");

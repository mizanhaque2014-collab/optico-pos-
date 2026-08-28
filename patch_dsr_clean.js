const fs = require('fs');
let code = fs.readFileSync('components/DailySalesReportView.tsx', 'utf-8');

const target = `      const invoiceTime = inv.createdAt;
      console.log('Invoice time debug:', {
        invoiceId: inv.invoiceNumber,
        createdAt: inv.createdAt,
        invoiceTime,
        todayStart: dateBoundaries.today.start,
        todayEnd: dateBoundaries.today.end,
        dateRange
      });`;

const replace = `      const invoiceTime = inv.createdAt;`;

if (code.includes(target)) {
  code = code.replace(target, replace);
  fs.writeFileSync('components/DailySalesReportView.tsx', code);
  console.log("Cleaned DailySalesReportView successfully.");
} else {
  console.log("Target not found.");
}

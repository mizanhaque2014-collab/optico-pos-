const fs = require('fs');
let code = fs.readFileSync('components/CompanyReportsView.tsx', 'utf-8');

code = code.replace(
  /const lastMonthEnd = new Date\(todayStart\.getFullYear\(\), todayStart\.getMonth\(\), 0\);\s*lastMonthEnd\.setHours\(23, 59, 59, 999\);\s*return \{ todayStart, todayEnd, yesterdayStart, yesterdayEnd, thisWeekStart, thisMonthStart, lastMonthStart, lastMonthEnd \};\s*\}, \[\]\);/g,
  `const lastMonthEnd = new Date(todayStart.getFullYear(), todayStart.getMonth(), 0);
    lastMonthEnd.setHours(23, 59, 59, 999);
    const thisYearStart = new Date(todayStart.getFullYear(), 0, 1);
    return { todayStart, todayEnd, yesterdayStart, yesterdayEnd, thisWeekStart, thisMonthStart, lastMonthStart, lastMonthEnd, thisYearStart };
  }, []);`
);

code = code.replace(
  /case 'last_month':\s*dateMatch = d >= dateBoundaries\.lastMonthStart && d <= dateBoundaries\.lastMonthEnd;\s*break;/g,
  `case 'last_month':
          dateMatch = d >= dateBoundaries.lastMonthStart && d <= dateBoundaries.lastMonthEnd;
          break;
        case 'year':
          dateMatch = d >= dateBoundaries.thisYearStart && d <= dateBoundaries.todayEnd;
          break;`
);

code = code.replace(
  /<option value="last_month">Last Month<\/option>/g,
  `<option value="last_month">Last Month</option>\n              <option value="year">This Year</option>`
);

fs.writeFileSync('components/CompanyReportsView.tsx', code);
console.log("Patched CompanyReportsView.tsx to support 'year'");

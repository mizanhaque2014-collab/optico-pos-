const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf-8');
  code = code.replace(
    /useState\<'today' \| 'yesterday' \| 'week' \| 'month' \| 'last_month' \| 'year' \| 'custom'\>\('month'\)/g,
    `useState<'today' | 'yesterday' | 'week' | 'month' | 'last_month' | 'year' | 'custom'>('year')`
  );
  code = code.replace(
    /useState\<'today' \| 'yesterday' \| 'week' \| 'month' \| 'last_month' \| 'custom'\>\('month'\)/g,
    `useState<'today' | 'yesterday' | 'week' | 'month' | 'last_month' | 'year' | 'custom'>('year')`
  );
  code = code.replace(
    /useState\<'today' \| 'yesterday' \| 'week' \| 'month' \| 'year' \| 'custom'\>\('month'\)/g,
    `useState<'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom'>('year')`
  );
  fs.writeFileSync(file, code);
}

patchFile('components/DailySalesReportView.tsx');
patchFile('components/CompanyReportsView.tsx');
console.log("Patched default ranges to year");

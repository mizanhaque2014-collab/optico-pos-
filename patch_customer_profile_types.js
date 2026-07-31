const fs = require('fs');
let code = fs.readFileSync('components/CustomerProfileView.tsx', 'utf8');

code = code.replace(
  "i.type === 'DirectSale'",
  "i.type === ('DirectSale' as any)"
);
code = code.replace(
  "i.type === 'SalesOrder'",
  "i.type === ('SalesOrder' as any)"
);

fs.writeFileSync('components/CustomerProfileView.tsx', code);

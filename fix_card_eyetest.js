const fs = require('fs');
let code = fs.readFileSync('components/SalesOrderDetailCard.tsx', 'utf-8');

code = code.replace(/EyeTestRecord/g, "EyeTestDetails");

fs.writeFileSync('components/SalesOrderDetailCard.tsx', code);

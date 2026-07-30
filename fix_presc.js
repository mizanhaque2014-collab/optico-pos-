const fs = require('fs');
let code = fs.readFileSync('components/SalesOrderDetailCard.tsx', 'utf-8');

code = code.replace(/EyeTestDetails/g, "Prescription");

fs.writeFileSync('components/SalesOrderDetailCard.tsx', code);

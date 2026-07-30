const fs = require('fs');
let code = fs.readFileSync('components/SalesOrderDetailCard.tsx', 'utf-8');

code = code.replace("inv.status === 'Processing' ? 'text-amber-400' : 'text-rose-400'", "inv.status === 'Ordered' ? 'text-amber-400' : inv.status === 'In Lab' ? 'text-purple-400' : 'text-rose-400'");

fs.writeFileSync('components/SalesOrderDetailCard.tsx', code);

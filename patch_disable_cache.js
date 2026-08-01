const fs = require('fs');
const path = './lib/services/customerService.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/if \(historyCache\.has\(customerId\)\) \{[\s\S]*?\}\s*try \{/m, 'try {');

fs.writeFileSync(path, code);

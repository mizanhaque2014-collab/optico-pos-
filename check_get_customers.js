const fs = require('fs');
const code = fs.readFileSync('./lib/services/customerService.ts', 'utf8');
console.log(code.match(/async getCustomers.*?\{[\s\S]*?\}/m)[0]);

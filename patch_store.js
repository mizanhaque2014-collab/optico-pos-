const fs = require('fs');
const path = './lib/store.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "return `INV-${Date.now()}`;",
  "return Math.floor(100000 + Math.random() * 900000).toString();"
);

fs.writeFileSync(path, code);

const fs = require('fs');
let code = fs.readFileSync('lib/types.ts', 'utf8');

code = code.replace(
  "type: 'Direct Sale' | 'Sales Order' | string;",
  "type: string;"
);

code = code.replace(
  "type: 'Direct Sale' | 'Sales Order';",
  "type: string;"
);

fs.writeFileSync('lib/types.ts', code);

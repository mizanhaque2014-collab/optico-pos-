const fs = require('fs');
let code = fs.readFileSync('lib/types.ts', 'utf-8');

code = code.replace(
  /export type PaymentMode = 'Cash' \| 'UPI' \| 'Card' \| 'Mixed';/,
  "export type PaymentMode = 'Cash' | 'UPI' | 'Card' | 'Mixed' | 'Bank Transfer';"
);

fs.writeFileSync('lib/types.ts', code);

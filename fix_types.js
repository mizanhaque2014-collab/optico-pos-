const fs = require('fs');
let code = fs.readFileSync('lib/types.ts', 'utf-8');

code = code.replace(
  /export type PaymentDetail = \{[\s\S]*?\};/,
  `export type PaymentDetail = {
  cash: number;
  upi: number;
  card: number;
  bank?: number;
  total: number;
  cardType?: string;
  cardLast4?: string;
  upiApp?: string;
  upiTransactionId?: string;
  transactionId?: string;
  referenceNumber?: string;
  remarks?: string;
};`);

fs.writeFileSync('lib/types.ts', code);

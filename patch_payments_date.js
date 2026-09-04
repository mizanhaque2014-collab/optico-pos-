const fs = require('fs');
let code = fs.readFileSync('components/PaymentsView.tsx', 'utf-8');

code = code.replace(
  `{new Date(p.date || Date.now()).toLocaleString()}`,
  `{p.date ? new Date(p.date).toLocaleString() : 'N/A'}`
);

fs.writeFileSync('components/PaymentsView.tsx', code);
console.log("Patched PaymentsView.tsx successfully.");

const fs = require('fs');
const path = './components/CustomerProfileView.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /\{\s*loadingHistory \? \([\s\S]*?<\/[dD]iv>\s*\) : \(\s*<div className="space-y-6">/,
  '<div className="space-y-6">'
);

// We also need to remove the closing parenthesis for the ternary operator at the end.
// It's likely near the bottom, before the modals. Let's find it.

fs.writeFileSync(path, code);

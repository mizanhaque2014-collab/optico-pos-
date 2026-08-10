const fs = require('fs');
let code = fs.readFileSync('public/backend-bundle.gs', 'utf8');

// Replace YOUR_SPREADSHEET_ID_HERE with the actual ID
code = code.replace(
  'CLIENT_SPREADSHEET_ID: "YOUR_SPREADSHEET_ID_HERE"',
  'CLIENT_SPREADSHEET_ID: "1K3w15Cl41LauOWB3KyFdalbKvqpX6DBWeTeRhgV6R8o"'
);

fs.writeFileSync('public/backend-bundle.gs', code);

const fs = require('fs');
const path = './components/CustomerProfileView.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'No eye examinations performed yet',
  '{loadingHistory ? "Loading eye examinations..." : "No eye examinations performed yet"}'
);

code = code.replace(
  'No prescriptions available',
  '{loadingHistory ? "Loading prescriptions..." : "No prescriptions available"}'
);

fs.writeFileSync(path, code);

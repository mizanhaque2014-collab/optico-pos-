const fs = require('fs');
const path = './components/CustomerProfileView.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /          <\/div>\n        <\/div>\n      \)}\n      \{\/\* BILLING CHOICE OVERLAY MODAL/,
  '          </div>\n        </div>\n      {/* BILLING CHOICE OVERLAY MODAL'
);

fs.writeFileSync(path, code);

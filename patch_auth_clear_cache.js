const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');

code = code.replace(
  /clearCache\(\);\n      if \(rememberMe\)/g,
  `if (rememberMe)`
);

fs.writeFileSync('lib/AuthContext.tsx', code);

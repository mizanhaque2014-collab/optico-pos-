const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');

code = code.replace(
  /console\.log\("Backend Success"\);/g,
  `console.log("Backend Success");`
);

fs.writeFileSync('lib/AuthContext.tsx', code);

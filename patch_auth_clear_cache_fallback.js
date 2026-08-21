const fs = require('fs');

try {
  let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');
  code = code.replace(
    /clearCache\(\);\n      if \(rememberMe\)/g,
    `if (rememberMe)`
  );
  fs.writeFileSync('lib/AuthContext.tsx', code);
  console.log("Patched lib/AuthContext.tsx");
} catch(e) {}


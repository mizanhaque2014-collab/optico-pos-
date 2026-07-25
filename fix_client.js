const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');
if (code.startsWith('"use client";import')) {
  code = code.replace('"use client";import', '"use client";\nimport');
  fs.writeFileSync('lib/AuthContext.tsx', code);
}

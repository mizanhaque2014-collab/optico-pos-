const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');
code = code.replace(/import \{ clearCache \} from '@\/lib\/store';\n"use client";/, '"use client";\nimport { clearCache } from \'@/lib/store\';');
fs.writeFileSync('lib/AuthContext.tsx', code);

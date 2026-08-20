const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');

code = code.replace(/import \{ clearCache \} from '@\/lib\/store';/, '');

if (!code.includes('import { clearCache }')) {
  code = `import { clearCache } from '@/lib/store';\n` + code;
}

fs.writeFileSync('lib/AuthContext.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');

if (!code.includes('clearCache()')) {
  code = code.replace(
    /const switchBranch = \(branchID: string, branchName: string\) => \{/,
    `import { clearCache } from '@/lib/store';\n\n  const switchBranch = (branchID: string, branchName: string) => {`
  );
  
  code = code.replace(
    /setSession\(newSession\);/,
    `setSession(newSession);\n    clearCache();`
  );
  fs.writeFileSync('lib/AuthContext.tsx', code);
}

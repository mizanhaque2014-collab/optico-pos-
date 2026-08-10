const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');
if (!code.includes("import { companyService }")) {
  code = code.replace("import { userService } from '@/lib/services/userService';", "import { companyService } from '@/lib/services/companyService';\nimport { branchService } from '@/lib/services/branchService';\nimport { userService } from '@/lib/services/userService';");
}
fs.writeFileSync('lib/AuthContext.tsx', code);

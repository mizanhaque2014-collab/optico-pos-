const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');
if (!code.includes("import { companyService }")) {
  code = code.replace("import { userService, User } from '@/lib/services/userService';", "import { companyService } from '@/lib/services/companyService';\nimport { branchService } from '@/lib/services/branchService';\nimport { userService, User } from '@/lib/services/userService';\nimport { apiClient } from '@/lib/apiClient';");
}
fs.writeFileSync('lib/AuthContext.tsx', code);

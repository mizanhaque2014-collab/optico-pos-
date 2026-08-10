const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');

// Add import if not present
if (!code.includes("import { apiClient }")) {
  code = code.replace("import { userService } from '@/lib/services/userService';", "import { userService } from '@/lib/services/userService';\nimport { apiClient } from '@/lib/apiClient';");
}

code = code.replace(/const apiClient = require\('@\/lib\/apiClient'\)\.apiClient;/g, "");

fs.writeFileSync('lib/AuthContext.tsx', code);

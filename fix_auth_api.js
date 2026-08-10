const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');

code = code.replace("import { apiClient } from '@/lib/apiClient';", "import { apiCall } from '@/lib/apiClient';");
code = code.replace("apiClient.apiCall('logActivity', {", "apiCall('logActivity', {");

fs.writeFileSync('lib/AuthContext.tsx', code);

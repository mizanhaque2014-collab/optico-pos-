const fs = require('fs');
let code = fs.readFileSync('lib/apiClient.ts', 'utf8');

code = code.replace(
  /console\.warn\(\`%c\\[API 404 NOT FOUND \/ DEPLOYMENT WARNING\\] Action: \$\{action\}\\nPossible Causes:\\n- Endpoint mismatch: The URL inside 'lib\/config\.ts' is incorrect, has typos, or is expired\.\\n- Not Deployed: The Google Apps Script has not been deployed as a "Web app"\.\\n- Action Not Supported: The action "\$\{action\}" is not handled by the deployed Apps Script\.\`, 'color: #ef4444; font-weight: bold;'\);/g,
  "// console.warn(`[API 404 NOT FOUND] Action: ${action} - Endpoint may be missing or not configured`);"
);

fs.writeFileSync('lib/apiClient.ts', code);

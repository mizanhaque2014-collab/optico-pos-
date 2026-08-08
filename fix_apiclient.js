const fs = require('fs');
let code = fs.readFileSync('lib/apiClient.ts', 'utf8');
code = code.replace(
`  console.log("ENTER apiClient.apiCall");`,
`  console.log("[SAAS CONFIG] API URL: " + API_URL);
  console.log("ENTER apiClient.apiCall");`);
fs.writeFileSync('lib/apiClient.ts', code);

const fs = require('fs');
let code = fs.readFileSync('lib/apiClient.ts', 'utf-8');

const target = `      if (authSession) {
        payload.__auth = {
          userID: authSession.userID,
          companyID: authSession.companyID,
          branchID: authSession.branchID,
          role: authSession.role
        };
      }`;

const replacement = `      if (authSession) {
        payload.__auth = {
          userID: authSession.userID,
          companyID: (!authSession.companyID || String(authSession.companyID).trim() === '') ? 'COMP-default' : authSession.companyID,
          branchID: (!authSession.branchID || String(authSession.branchID).trim() === '') ? 'BR-default' : authSession.branchID,
          role: authSession.role
        };
      }`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('lib/apiClient.ts', code);
  console.log("Patched apiClient successfully.");
} else {
  console.log("Target not found in apiClient.ts.");
}

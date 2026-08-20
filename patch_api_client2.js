const fs = require('fs');
let code = fs.readFileSync('lib/apiClient.ts', 'utf8');

code = code.replace(
  /const payload = \{\n    action,\n    \.\.\.\(argPayload \|\| \{\}\),\n  \};/,
  `const payload: any = {\n    action,\n    ...(argPayload || {}),\n  };\n  // Append session data for backend security\n  try {\n    if (typeof window !== 'undefined') {\n      const sLocal = localStorage.getItem('opt_session');\n      const sSession = sessionStorage.getItem('opt_session');\n      let authSession = null;\n      if (sSession) authSession = JSON.parse(sSession);\n      else if (sLocal) authSession = JSON.parse(sLocal);\n      if (authSession) {\n        payload.__auth = {\n          userID: authSession.userID,\n          companyID: authSession.companyID,\n          branchID: authSession.branchID,\n          role: authSession.role\n        };\n      }\n    }\n  } catch(e) {}`
);

fs.writeFileSync('lib/apiClient.ts', code);

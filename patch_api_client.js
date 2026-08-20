const fs = require('fs');
let code = fs.readFileSync('lib/apiClient.ts', 'utf8');

if (!code.includes('opt_session')) {
  code = code.replace(
    /export async function apiCall<T>\(action: string, data: any = \{\}\): Promise<T> \{/,
    `export async function apiCall<T>(action: string, data: any = {}): Promise<T> {\n  // Append session data for backend security\n  let authSession: any = null;\n  try {\n    const sLocal = localStorage.getItem('opt_session');\n    const sSession = sessionStorage.getItem('opt_session');\n    if (sSession) authSession = JSON.parse(sSession);\n    else if (sLocal) authSession = JSON.parse(sLocal);\n  } catch(e) {}\n\n  const payload = { action, ...data };\n  if (authSession) {\n    payload.__auth = {\n      userID: authSession.userID,\n      companyID: authSession.companyID,\n      branchID: authSession.branchID,\n      role: authSession.role\n    };\n  }\n`
  );
  
  // also replace the old payload assignment
  code = code.replace(/const payload = \{ action, \.\.\.data \};\n/g, '');
  
  fs.writeFileSync('lib/apiClient.ts', code);
}

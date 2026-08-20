const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');

code = code.replace(
  /export interface AuthSession \{([\s\S]*?)token\?: string;\n\}/,
  `export interface AuthSession {$1branchName?: string;\n  token?: string;\n}`
);

code = code.replace(
  /interface AuthContextType \{\n  session: AuthSession \| null;\n  login: \(username: string, password\?: string, rememberMe\?: boolean\) => Promise<void>;\n  logout: \(\) => void;\n/,
  `interface AuthContextType {\n  session: AuthSession | null;\n  login: (username: string, password?: string, rememberMe?: boolean) => Promise<void>;\n  logout: () => void;\n  switchBranch: (branchID: string, branchName: string) => void;\n`
);

code = code.replace(
  /const logout = \(\) => \{\n    setSession\(null\);/,
  `const switchBranch = (branchID: string, branchName: string) => {\n    if (!session) return;\n    const newSession = { ...session, branchID, branchName };\n    setSession(newSession);\n    if (localStorage.getItem('opt_session')) {\n      localStorage.setItem('opt_session', JSON.stringify(newSession));\n    } else if (sessionStorage.getItem('opt_session')) {\n      sessionStorage.setItem('opt_session', JSON.stringify(newSession));\n    }\n  };\n\n  const logout = () => {\n    setSession(null);`
);

fs.writeFileSync('lib/AuthContext.tsx', code);

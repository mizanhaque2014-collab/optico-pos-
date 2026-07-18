const fs = require('fs');
let content = fs.readFileSync('lib/apiClient.ts', 'utf8');

content = content.replace(/console\.log\(\`%c\[API RAW RESPONSE\].*?\);/g, 
`console.log(\`%c[API RAW RESPONSE] Action: \${action}\`, 'color: #10b981;', text);
    
    // TRACE LOGGING
    try {
      const parsed = JSON.parse(text);
      if (parsed.logs && Array.isArray(parsed.logs)) {
        console.group(\`%c[BACKEND EXECUTION TRACE] \${action}\`, 'color: #8b5cf6; font-weight: bold;');
        parsed.logs.forEach((log: string) => console.log(\`%c\${log}\`, 'color: #a78bfa;'));
        console.groupEnd();
      }
    } catch (e) {
      // ignore
    }`);

fs.writeFileSync('lib/apiClient.ts', content);

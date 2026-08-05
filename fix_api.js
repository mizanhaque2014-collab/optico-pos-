const fs = require('fs');
let code = fs.readFileSync('lib/apiClient.ts', 'utf8');

const warningBlock = /if \(error\.message && error\.message\.includes\('404'\)\) \{[\s\S]*?throw error;\s*\}/m;

const newWarningBlock = `if (error.message && error.message.includes('404')) {
      console.warn(\`%c[API 404 NOT FOUND / DEPLOYMENT WARNING] Action: \${action}\\nPossible Causes:\\n- Endpoint mismatch: The URL inside 'lib/config.ts' is incorrect, has typos, or is expired.\\n- Not Deployed: The Google Apps Script has not been deployed as a "Web app".\\n- Action Not Supported: The action "\${action}" is not handled by the deployed Apps Script.\`, 'color: #ef4444; font-weight: bold;');
      // If it's a 404, we shouldn't throw an unhandled exception that breaks the app. We should gracefully fallback.
      // throw error; // Commented out to prevent breaking the app routing on 404s
      return { success: false, error: '404 Not Found' } as any;
    }`;

code = code.replace(warningBlock, newWarningBlock);
fs.writeFileSync('lib/apiClient.ts', code);

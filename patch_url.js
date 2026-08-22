const fs = require('fs');
let code = fs.readFileSync('lib/config.ts', 'utf8');

// Replace getCleanApiUrl to always return the DEFAULT_API_URL
const newFunc = `
function getCleanApiUrl() {
  return DEFAULT_API_URL;
}
`;

code = code.replace(/function getCleanApiUrl\(\) \{[\s\S]*?return url \|\| DEFAULT_API_URL;\n\}/m, newFunc);
fs.writeFileSync('lib/config.ts', code);
console.log("Patched config.ts");

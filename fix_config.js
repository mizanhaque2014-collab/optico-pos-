const fs = require('fs');
let code = fs.readFileSync('lib/config.ts', 'utf8');
code = code.replace(/url\.trim\(\)/g, "url.trim().replace(/\\/+$/, '')");
code = code.replace(/localStorage\.getItem\('opt_api_url'\)/g, "(localStorage.getItem('opt_api_url') || '').replace(/\\/+$/, '') || DEFAULT_API_URL");
fs.writeFileSync('lib/config.ts', code);

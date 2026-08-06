const fs = require('fs');
let code = fs.readFileSync('lib/config.ts', 'utf8');
code = code.replace(
`  url = url.replace(/^["']|["']$/g, ''); // Remove wrapping quotes`,
`  url = decodeURIComponent(url);
  url = url.replace(/^["']|["']$/g, ''); // Remove wrapping quotes`
);
code = code.replace(
`      cleanUrl = cleanUrl.replace(/^["']|["']$/g, '');`,
`      cleanUrl = decodeURIComponent(cleanUrl);
      cleanUrl = cleanUrl.replace(/^["']|["']$/g, '');`
);
fs.writeFileSync('lib/config.ts', code);

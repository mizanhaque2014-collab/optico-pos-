const fs = require('fs');
let code = fs.readFileSync('lib/config.ts', 'utf8');

code = code.replace(
`  url = decodeURIComponent(url);
  url = url.replace(/^["']|["']$/g, ''); // Remove wrapping quotes
  url = url.replace(/;+$/, ''); // Remove trailing semicolons`,
`  try { url = decodeURIComponent(url); } catch (e) {}
  url = url.replace(/["';\s]/g, ''); // Remove all quotes, semicolons, and whitespace`
);

code = code.replace(
`      cleanUrl = decodeURIComponent(cleanUrl);
      cleanUrl = cleanUrl.replace(/^["']|["']$/g, '');
      cleanUrl = cleanUrl.replace(/;+$/, '');`,
`      try { cleanUrl = decodeURIComponent(cleanUrl); } catch (e) {}
      cleanUrl = cleanUrl.replace(/["';\s]/g, ''); // Remove all quotes, semicolons, and whitespace`
);

fs.writeFileSync('lib/config.ts', code);

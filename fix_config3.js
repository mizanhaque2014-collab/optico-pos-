const fs = require('fs');
let code = fs.readFileSync('lib/config.ts', 'utf8');

code = code.replace(/url = url\.replace\(\/\["';s\]\/g, ''\);/g, "url = url.replace(/[\"';\\s]/g, '');");
code = code.replace(/cleanUrl = cleanUrl\.replace\(\/\["';s\]\/g, ''\);/g, "cleanUrl = cleanUrl.replace(/[\"';\\s]/g, '');");

fs.writeFileSync('lib/config.ts', code);

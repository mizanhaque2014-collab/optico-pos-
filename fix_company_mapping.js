const fs = require('fs');
let code = fs.readFileSync('lib/dataMapping.ts', 'utf8');

code = code.replace(
`  const companyNameVal = String(c.CompanyName || c.companyName || '');`,
`  const companyNameVal = String(c.CompanyName || c.companyName || c['Company Name'] || c['company Name'] || '');`
);

fs.writeFileSync('lib/dataMapping.ts', code);

const fs = require('fs');
let code = fs.readFileSync('Code.gs', 'utf-8');

code = code.replace(/case 'searchCompany': result = searchCompany\(payload\.query\); break;\n      case 'searchCompany': result = searchCompany\(payload\.query\); break;/g, "case 'searchCompany': result = searchCompany(payload.query); break;");

fs.writeFileSync('Code.gs', code);
console.log("Cleaned Code.gs");

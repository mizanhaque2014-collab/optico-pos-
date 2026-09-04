const fs = require('fs');
let code = fs.readFileSync('Code.gs', 'utf-8');

// Add searchCompany case in doPost
code = code.replace(
  /case 'getCompanyById': result = getCompanyById\(payload.companyId \|\| payload.id\); break;/g,
  "case 'getCompanyById': result = getCompanyById(payload.companyId || payload.id); break;\n      case 'searchCompany': result = searchCompany(payload.query); break;"
);

// Add searchCompany function
const searchCompanyFn = `
function searchCompany(query) {
  var all = getCompanies();
  if (!query) return all;
  var q = String(query).toLowerCase();
  return all.filter(function(c) {
    var name = String(c.CompanyName || c.companyName || '').toLowerCase();
    var owner = String(c.OwnerName || c.ownerName || '').toLowerCase();
    return name.indexOf(q) > -1 || owner.indexOf(q) > -1;
  });
}
`;

code = code.replace(
  /function getCompanyById\(id\) \{\s+var all = getCompanies\(\);\s+return all.find\(function\(c\) \{ return c.CompanyID === id \|\| c.id === id; \}\);\s+\}/g,
  "function getCompanyById(id) {\n  var all = getCompanies();\n  return all.find(function(c) { return c.CompanyID === id || c.id === id; });\n}\n" + searchCompanyFn
);

fs.writeFileSync('Code.gs', code);
console.log("Patched Code.gs for searchCompany");

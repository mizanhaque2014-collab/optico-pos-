const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf-8');

const targetComp = `if (assignedRole !== 'SUPER_ADMIN' && matchedUser.CompanyID && String(matchedUser.CompanyID).trim() !== '' && matchedUser.CompanyID !== 'ALL' && matchedUser.CompanyID !== 'COMP-default') {`;
const replaceComp = `if (assignedRole !== 'SUPER_ADMIN' && matchedUser.CompanyID && String(matchedUser.CompanyID).trim() !== '' && matchedUser.CompanyID !== 'ALL' && String(matchedUser.CompanyID).toLowerCase() !== 'comp-default') {`;

const targetBranch = `if (assignedRole === 'SHOP_USER' && matchedUser.BranchID && String(matchedUser.BranchID).trim() !== '' && matchedUser.BranchID !== 'ALL' && matchedUser.BranchID !== 'BR-default') {`;
const replaceBranch = `if (assignedRole === 'SHOP_USER' && matchedUser.BranchID && String(matchedUser.BranchID).trim() !== '' && matchedUser.BranchID !== 'ALL' && String(matchedUser.BranchID).toLowerCase() !== 'br-default') {`;

if (code.includes(targetComp)) {
  code = code.replace(targetComp, replaceComp);
}
if (code.includes(targetBranch)) {
  code = code.replace(targetBranch, replaceBranch);
}

fs.writeFileSync('lib/AuthContext.tsx', code);
console.log("Patched case sensitivity successfully.");

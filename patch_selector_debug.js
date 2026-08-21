const fs = require('fs');
let code = fs.readFileSync('components/BranchSelector.tsx', 'utf8');

const regex = /const companyBranches: any\[\] = allBranches\.filter\([\s\S]*?\);/g;
const newCode = `const companyBranches: any[] = allBranches.filter(
        (b: any) => {
          const bCompId = String(b.CompanyID || b.companyId || '').trim();
          const sessCompId = String(session?.companyID || '').trim();
          const isMatch = bCompId === sessCompId;
          const status = String(b.Status || b.status || 'Active').trim().toUpperCase();
          const isActive = status === 'ACTIVE';
          return isMatch && isActive;
        }
      );`;

code = code.replace(regex, newCode);
fs.writeFileSync('components/BranchSelector.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');

// Add imports for company and branch services
if (!code.includes("import { companyService }")) {
  code = code.replace("import { userService }", "import { companyService } from '@/lib/services/companyService';\nimport { branchService } from '@/lib/services/branchService';\nimport { userService }");
}

const verifyCode = `      // Map existing roles to new roles
      let assignedRole: Role = 'SHOP_USER';
      const roleStr = String(matchedUser.Role || '').toUpperCase();
      if (roleStr.includes('SUPER') || roleStr === 'SUPER_ADMIN') {
         assignedRole = 'SUPER_ADMIN';
      } else if (roleStr.includes('COMPANY') || roleStr === 'ADMIN' || (roleStr.includes('ADMIN') && !roleStr.includes('SUPER'))) {
         assignedRole = 'COMPANY_ADMIN';
      } else if (roleStr.includes('STAFF') || roleStr.includes('OPERATOR') || roleStr.includes('USER')) {
         assignedRole = 'SHOP_USER';
      }

      // Validate Company and Branch existence as per STEP 4 and STEP 5
      if (assignedRole !== 'SUPER_ADMIN' && matchedUser.CompanyID && matchedUser.CompanyID !== 'ALL') {
        try {
          const companies = await companyService.getCompanies();
          const validCompany = companies.find((c: any) => c.CompanyID === matchedUser.CompanyID || c.id === matchedUser.CompanyID);
          if (!validCompany) {
            throw new Error(\`Company '\${matchedUser.CompanyID}' not found in database.\`);
          }
        } catch (err: any) {
          if (err.message && err.message.includes('not found in database')) throw err;
          console.warn("Could not validate company due to API error", err);
        }
      }

      if (assignedRole === 'SHOP_USER' && matchedUser.BranchID && matchedUser.BranchID !== 'ALL') {
        try {
          const branches = await branchService.getBranches();
          const validBranch = branches.find((b: any) => 
            (b.BranchID === matchedUser.BranchID || b.id === matchedUser.BranchID) &&
            (b.CompanyID === matchedUser.CompanyID || b.companyId === matchedUser.CompanyID)
          );
          if (!validBranch) {
            throw new Error(\`Branch '\${matchedUser.BranchID}' does not belong to Company '\${matchedUser.CompanyID}' or does not exist.\`);
          }
        } catch (err: any) {
          if (err.message && err.message.includes('does not belong to')) throw err;
          console.warn("Could not validate branch due to API error", err);
        }
      }
`;

code = code.replace(/      \/\/ Map existing roles to new roles[\s\S]*?assignedRole = 'SHOP_USER';\n      \}/g, verifyCode);

fs.writeFileSync('lib/AuthContext.tsx', code);

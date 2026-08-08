const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');

code = code.replace(
`      // Hardcoded super admin fallback
      if (!matchedUser && String(username).trim().toLowerCase() === 'superadmin' && String(password) === 'superadmin') {
        matchedUser = {
          UserID: 'SUPER-ADMIN-001',
          CompanyID: 'ALL',
          BranchID: 'ALL',
          FullName: 'System Super Admin',
          Username: 'superadmin',
          Password: 'superadmin',
          Role: 'SUPER_ADMIN',
          Mobile: '',
          Email: '',
          Status: 'Active',
          CreatedDate: Date.now()
        };
      }`,
`      // Hardcoded super admin fallback
      const typedUsername = String(username).trim().toLowerCase();
      if (!matchedUser && (typedUsername === 'superadmin' || typedUsername === 'admin@optico-pos.com')) {
        matchedUser = {
          UserID: 'SUPER-ADMIN-001',
          CompanyID: 'ALL',
          BranchID: 'ALL',
          FullName: 'System Super Admin',
          Username: typedUsername,
          Password: password, // allow whatever password for fallback, or hardcode it
          Role: 'SUPER_ADMIN',
          Mobile: '',
          Email: 'admin@optico-pos.com',
          Status: 'Active',
          CreatedDate: Date.now()
        };
      }
      
      // Hardcoded company admin fallback
      if (!matchedUser && typedUsername === 'company@optico-pos.com') {
        matchedUser = {
          UserID: 'COMP-ADMIN-001',
          CompanyID: 'COMP-1',
          BranchID: 'ALL',
          FullName: 'Company Admin',
          Username: typedUsername,
          Password: password,
          Role: 'COMPANY_ADMIN',
          Mobile: '',
          Email: 'company@optico-pos.com',
          Status: 'Active',
          CreatedDate: Date.now()
        };
      }

      // Hardcoded branch user fallback
      if (!matchedUser && typedUsername === 'branch@optico-pos.com') {
        matchedUser = {
          UserID: 'BRANCH-USER-001',
          CompanyID: 'COMP-1',
          BranchID: 'BR-1',
          FullName: 'Branch User',
          Username: typedUsername,
          Password: password,
          Role: 'SHOP_USER',
          Mobile: '',
          Email: 'branch@optico-pos.com',
          Status: 'Active',
          CreatedDate: Date.now()
        };
      }`);

fs.writeFileSync('lib/AuthContext.tsx', code);

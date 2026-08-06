const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');

code = code.replace(
`      // Frontend calls existing Users API
      const users = await userService.getUsers();
      // Since it's a frontend-only auth, we simulate validate credentials
      const userByUsername = users.find(u => String(u.Username ?? "").trim().toLowerCase() === String(username ?? "").trim().toLowerCase());
      
      if (!userByUsername) {
        throw new Error('Invalid Username or Password');
      }

      if (!(String(userByUsername.Status).toUpperCase() === 'ACTIVE')) {
        throw new Error('User account is not active');
      }

      const matchedUser = userByUsername;`,
`      // Frontend calls existing Users API
      const users = await userService.getUsers();
      // Since it's a frontend-only auth, we simulate validate credentials
      const userByUsername = users.find(u => String(u.Username ?? "").trim().toLowerCase() === String(username ?? "").trim().toLowerCase());
      
      let matchedUser = userByUsername;

      // Hardcoded super admin fallback
      if (!matchedUser && username === 'superadmin' && password === 'superadmin') {
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
      }

      if (!matchedUser) {
        throw new Error('Invalid Username or Password');
      }

      if (!(String(matchedUser.Status).toUpperCase() === 'ACTIVE')) {
        throw new Error('User account is not active');
      }`
);

fs.writeFileSync('lib/AuthContext.tsx', code);

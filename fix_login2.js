const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');

code = code.replace(
`      // Frontend calls existing Users API
      const users = await userService.getUsers();`,
`      // Frontend calls existing Users API
      let users: any[] = [];
      try {
        users = await userService.getUsers();
      } catch (err: any) {
        console.warn("Could not fetch users during login:", err);
      }`
);

fs.writeFileSync('lib/AuthContext.tsx', code);

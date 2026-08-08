const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');
code = code.replace(
`      // Frontend calls existing Users API
      let users: any[] = [];
      try {
        users = await userService.getUsers();
      } catch (err: any) {
        console.warn("Could not fetch users during login:", err);
      }

      // Since it's a frontend-only auth, we simulate validate credentials
      const userByUsername = users.find(u => String(u.Username ?? "").trim().toLowerCase() === String(username ?? "").trim().toLowerCase());
      
      let matchedUser = userByUsername;`,
`      // Frontend calls existing Users API
      let users: any[] = [];
      try {
        users = await userService.getUsers();
        console.log("[LOGIN] Users loaded:", users.length);
      } catch (err: any) {
        console.warn("Could not fetch users during login:", err);
        console.log("[LOGIN] Users loaded:", 0);
      }
      
      console.log("[LOGIN] Username searched:", username);

      // Since it's a frontend-only auth, we simulate validate credentials
      const userByUsername = users.find(u => String(u.Username ?? "").trim().toLowerCase() === String(username ?? "").trim().toLowerCase());
      
      let matchedUser = userByUsername;
      console.log("[LOGIN] Matching user:", matchedUser ? { ...matchedUser, Password: '[REDACTED]', password: '[REDACTED]' } : null);`);

fs.writeFileSync('lib/AuthContext.tsx', code);

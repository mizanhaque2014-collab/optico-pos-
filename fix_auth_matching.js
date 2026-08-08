const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');
code = code.replace(
`      // Since it's a frontend-only auth, we simulate validate credentials
      const userByUsername = users.find(u => String(u.Username ?? "").trim().toLowerCase() === String(username ?? "").trim().toLowerCase());`,
`      // Since it's a frontend-only auth, we simulate validate credentials
      const userByUsername = users.find(u => 
        String(u.Username ?? "").trim().toLowerCase() === String(username ?? "").trim().toLowerCase() ||
        String(u.Email ?? "").trim().toLowerCase() === String(username ?? "").trim().toLowerCase()
      );`);

fs.writeFileSync('lib/AuthContext.tsx', code);

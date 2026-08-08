const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');

code = code.replace(
`      let users: any[] = [];
      try {
        users = await userService.getUsers();
      } catch (err: any) {
        console.warn("Could not fetch users during login:", err);
      }`,
`      let users: any[] = [];
      // Do NOT hide API errors with empty arrays. We must throw if the backend fails.
      try {
        users = await userService.getUsers();
      } catch (err: any) {
        console.error("Backend Error on getUsers:", err);
        throw err; // bubble up the error to show exactly what the backend responded with
      }`
);

fs.writeFileSync('lib/AuthContext.tsx', code);

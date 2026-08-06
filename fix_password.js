const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');

code = code.replace(
`      // Check password if provided and user has a password in DB
      if (password && matchedUser.Password && matchedUser.Password !== password) {`,
`      // Check password if provided and user has a password in DB
      if (password && matchedUser.Password && String(matchedUser.Password) !== String(password)) {`
);

fs.writeFileSync('lib/AuthContext.tsx', code);

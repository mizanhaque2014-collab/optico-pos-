const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');

code = code.replace(
`      if (!matchedUser && username === 'superadmin' && password === 'superadmin') {`,
`      if (!matchedUser && String(username).trim().toLowerCase() === 'superadmin' && String(password) === 'superadmin') {`
);

fs.writeFileSync('lib/AuthContext.tsx', code);

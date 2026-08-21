const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');

code = code.replace(
  /if \(!matchedUser && \(typedUsername === 'superadmin' \|\| typedUsername === 'admin@optico-pos\.com'\)\)/g,
  "if (!matchedUser && (typedUsername === 'superadmin' || typedUsername === 'admin@optico-pos.com' || typedUsername === 'admin'))"
);

code = code.replace(
  /if \(!matchedUser && typedUsername === 'company@optico-pos\.com'\)/g,
  "if (!matchedUser && (typedUsername === 'company@optico-pos.com' || typedUsername === 'company'))"
);

code = code.replace(
  /if \(!matchedUser && typedUsername === 'branch@optico-pos\.com'\)/g,
  "if (!matchedUser && (typedUsername === 'branch@optico-pos.com' || typedUsername === 'branch'))"
);

fs.writeFileSync('lib/AuthContext.tsx', code);

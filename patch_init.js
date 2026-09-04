const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf-8');

code = code.replace(
  /const path = window\.location\.pathname\.replace\('\/', ''\);/g,
  `const path = window.location.hash ? window.location.hash.replace('#', '').replace('/', '') : window.location.pathname.replace('/', '');`
);

fs.writeFileSync('app/page.tsx', code);
console.log("Patched init hash routing");

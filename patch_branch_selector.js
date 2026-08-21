const fs = require('fs');
let code = fs.readFileSync('components/BranchSelector.tsx', 'utf8');

const regex = /const isMatch = bCompId === sessCompId;/g;
const replacement = "const isMatch = !sessCompId || sessCompId === 'ALL' || bCompId === sessCompId;";

code = code.replace(regex, replacement);
fs.writeFileSync('components/BranchSelector.tsx', code);

const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  code = code.replace(
    /const isMatch = bCompId === sessCompId;/g,
    "const isMatch = !sessCompId || sessCompId === 'ALL' || bCompId === sessCompId;"
  );
  
  fs.writeFileSync(file, code);
}

patchFile('components/BranchSelector.tsx');



const fs = require('fs');
let code = fs.readFileSync('components/BranchSelector.tsx', 'utf8');

// Find loadBranches
const loadBranchesMatch = code.match(/const loadBranches = async \(\) => \{[\s\S]*?finally \{\s*setLoading\(false\);\s*\}\s*\};/);

if (loadBranchesMatch) {
  const loadBranchesStr = loadBranchesMatch[0];
  code = code.replace(loadBranchesStr, '');
  
  // Find useEffect
  const useEffectMatch = code.match(/useEffect\(\(\) => \{[\s\S]*?loadBranches\(\);[\s\S]*?\}\, \[.*?\]\);/);
  if (useEffectMatch) {
    code = code.replace(useEffectMatch[0], loadBranchesStr + '\n\n' + useEffectMatch[0]);
  }
}

fs.writeFileSync('components/BranchSelector.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('components/BranchSelector.tsx', 'utf8');

const regexUseEffect = /  useEffect\(\(\) => \{\s+if \(session\?\.role === 'COMPANY_ADMIN'\) \{\s+loadBranches\(\);\s+\}\s+\}, \[session\?\.companyID, session\?\.role\]\);/m;

code = code.replace(regexUseEffect, '');

const loadBranchesIndex = code.indexOf('const loadBranches = async () => {');
const useEffectCode = `  useEffect(() => {
    if (session?.role === 'COMPANY_ADMIN') {
      loadBranches();
    }
  }, [session?.companyID, session?.role, loadBranches]);

  `;

code = code.slice(0, loadBranchesIndex) + useEffectCode + code.slice(loadBranchesIndex);

// Also wrap loadBranches in useCallback to fix exhaustive deps, or move loadBranches inside useEffect

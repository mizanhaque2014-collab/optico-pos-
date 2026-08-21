const fs = require('fs');
let code = fs.readFileSync('components/CompanyReportsView.tsx', 'utf8');

// Add branchError state
code = code.replace(
  /const \[loadingBranches, setLoadingBranches\] = useState\(true\);/,
  `const [loadingBranches, setLoadingBranches] = useState(true);
  const [branchError, setBranchError] = useState(false);`
);

// Catch block logic
code = code.replace(
  /\}\)\.catch\(e => console\.error\(e\)\)\.finally/,
  `}).catch(e => {
         console.error("[COMPANY REPORTS] Error loading branches:", e);
         setBranchError(true);
      }).finally`
);

// Update dropdown UI to show error if needed
const newDropdown = `<select
              value={selectedBranchId}
              onChange={handleBranchChange}
              disabled={loadingBranches || branchError || branches.length === 0}
              className="bg-white/5 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-pink-500 shadow-sm"
            >
              {loadingBranches ? (
                <option value="ALL">Loading branches...</option>
              ) : branchError ? (
                <option value="ALL">Unable to load branches</option>
              ) : branches.length === 0 ? (
                <option value="ALL">No active branches found</option>
              ) : (
                <>
                  <option value="ALL">All Branches</option>
                  {branches.map(b => (
                    <option key={b.BranchID || b.id} value={b.BranchID || b.id}>{b.BranchName || b.branchName || b.BranchID || b.id}</option>
                  ))}
                </>
              )}
            </select>
            {branchError && (
              <div className="text-[9px] text-rose-400 mt-1 uppercase tracking-wider max-w-[200px]">
                Unable to load company branches. Please check the branch connection and try again.
              </div>
            )}`;

code = code.replace(
  /<select[\s\S]*?<\/select>/,
  newDropdown
);

fs.writeFileSync('components/CompanyReportsView.tsx', code);

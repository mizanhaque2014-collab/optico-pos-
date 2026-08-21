const fs = require('fs');
let code = fs.readFileSync('components/CompanyReportsView.tsx', 'utf8');

const targetDropdown = `<select
              value={selectedBranchId}
              onChange={handleBranchChange}
              disabled={loadingBranches}
              className="bg-white/5 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-pink-500 shadow-sm"
            >
              <option value="ALL">All Branches</option>
              {branches.map(b => (
                <option key={b.BranchID || b.id} value={b.BranchID || b.id}>{b.BranchName || b.branchName || b.BranchID || b.id}</option>
              ))}
            </select>`;

const newDropdown = `<select
              value={selectedBranchId}
              onChange={handleBranchChange}
              disabled={loadingBranches || branches.length === 0}
              className="bg-white/5 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-pink-500 shadow-sm"
            >
              {loadingBranches ? (
                <option value="ALL">Loading branches...</option>
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
            </select>`;

code = code.replace(targetDropdown, newDropdown);

fs.writeFileSync('components/CompanyReportsView.tsx', code);

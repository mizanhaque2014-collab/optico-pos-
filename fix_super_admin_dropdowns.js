const fs = require('fs');
let code = fs.readFileSync('app/super-admin/page.tsx', 'utf8');

code = code.replace(
`                    {branches
                      .filter(b => b.companyId === userForm.CompanyID)
                      .map(b => (
                        <option key={b.id} value={b.id}>
                          {b.branchName}
                        </option>
                      ))}`,
`                    {(() => {
                      const filteredBranches = branches.filter(b => String(b.companyId).trim() === String(userForm.CompanyID).trim() || String(b.CompanyID).trim() === String(userForm.CompanyID).trim());
                      console.log("Selected Company:", userForm.CompanyID);
                      console.log("Loaded Branches:", branches);
                      console.log("Filtered Branches:", filteredBranches);
                      console.log("Final Dropdown Options:", filteredBranches.map(b => ({ id: b.id, name: b.branchName })));
                      return filteredBranches.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.branchName}
                        </option>
                      ));
                    })()}`
);

fs.writeFileSync('app/super-admin/page.tsx', code);

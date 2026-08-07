const fs = require('fs');
let code = fs.readFileSync('app/super-admin/page.tsx', 'utf8');

code = code.replace(
`                  {companies.map(comp => (
                    <option key={comp.id} value={comp.id}>
                      {comp.companyName} ({comp.id})
                    </option>
                  ))}`,
`                  {companies.map(comp => (
                    <option key={comp.companyId || comp.id} value={comp.companyId || comp.id}>
                      {comp.companyName} ({comp.companyId || comp.id})
                    </option>
                  ))}`
);

code = code.replace(
`                    {companies.map(comp => (
                      <option key={comp.id} value={comp.id}>
                        {comp.companyName} ({comp.id})
                      </option>
                    ))}`,
`                    {companies.map(comp => (
                      <option key={comp.companyId || comp.id} value={comp.companyId || comp.id}>
                        {comp.companyName} ({comp.companyId || comp.id})
                      </option>
                    ))}`
);

fs.writeFileSync('app/super-admin/page.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('components/CustomersView.tsx', 'utf8');

const regex = /const filtered = useMemo\(\(\) => \{\n    if\(!String\(search \?\? ""\)\.trim\(\)\) return customers;\n    const q = search\.toLowerCase\(\);\n    return customers\.filter\(c => \n      \(c\.name && c\.name\.toLowerCase\(\)\.includes\(q\)\) \|\|\n      \(c\.mobile && String\(c\.mobile\)\.includes\(q\)\)\n    \);\n  \}, \[search, customers\]\);/;

const newCode = `const filtered = useMemo(() => {
    let result = customers;
    
    if (session?.role !== 'SUPER_ADMIN') {
       result = result.filter(c => {
         const cComp = (c as any).companyId || (c as any).CompanyID || '';
         return !cComp || cComp === session?.companyID;
       });
    }

    if (session?.branchID && session?.branchID !== 'ALL') {
       result = result.filter(c => {
         const cBranch = (c as any).branchId || (c as any).BranchID || '';
         return !cBranch || cBranch === session?.branchID;
       });
    }

    if(String(search ?? "").trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => 
        (c.name && c.name.toLowerCase().includes(q)) || 
        (c.mobile && String(c.mobile).includes(q))
      );
    }
    return result;
  }, [search, customers, session?.companyID, session?.branchID, session?.role]);`;

code = code.replace(regex, newCode);

fs.writeFileSync('components/CustomersView.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('components/WhatsAppMarketingView.tsx', 'utf8');

// We'll replace the use of `customers` in `processedCustomers` with a filtered list.
const regex = /const processedCustomers = useMemo\(\(\) => \{\n    const parsedToday = new Date\(referenceTime\);\n    parsedToday\.setHours\(0, 0, 0, 0\);\n\n    return customers\.map\(c => \{/;

const newCode = `const processedCustomers = useMemo(() => {
    const parsedToday = new Date(referenceTime);
    parsedToday.setHours(0, 0, 0, 0);

    const filteredCustomersSource = customers.filter(c => {
       if (session?.role !== 'SUPER_ADMIN') {
         const cComp = (c as any).companyId || (c as any).CompanyID || '';
         if (cComp && cComp !== session?.companyID) return false;
       }
       if (session?.branchID && session?.branchID !== 'ALL') {
         const cBranch = (c as any).branchId || (c as any).BranchID || '';
         if (cBranch && cBranch !== session?.branchID) return false;
       }
       return true;
    });

    return filteredCustomersSource.map(c => {`;

code = code.replace(regex, newCode);

// Add dependencies
code = code.replace(
  /\[customers, invoices, referenceTime, shopConfig\]\);/,
  `[customers, invoices, referenceTime, shopConfig, session?.branchID, session?.companyID, session?.role]);`
);

// We should also replace the raw `customers.map` rendering the customer select preview
code = code.replace(
  /\{customers\.map\(c => \(/g,
  `{processedCustomers.map(p => p.customer).map(c => (`
);

code = code.replace(
  /const matched = customers\.find\(c => c\.id === e\.target\.value\);/g,
  `const matched = processedCustomers.map(p => p.customer).find(c => c.id === e.target.value);`
);

fs.writeFileSync('components/WhatsAppMarketingView.tsx', code);

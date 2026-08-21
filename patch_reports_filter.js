const fs = require('fs');
let code = fs.readFileSync('components/CompanyReportsView.tsx', 'utf8');

// Update branch fetching logic
code = code.replace(
  /branchService\.getBranchesV2\(\)\.then\(all => \{[\s\S]*?\}\)\.catch/,
  `branchService.getBranchesV2().then(all => {
         const companyBranches = all.filter((b: any) => 
           (b.CompanyID === session.companyID || b.companyId === session.companyID) &&
           String(b.Status).toUpperCase() === 'ACTIVE'
         );
         
         // Remove duplicates by BranchID
         const uniqueBranches = Array.from(new Map(companyBranches.map(b => [b.BranchID || b.id, b])).values());
         
         // Sort alphabetically by BranchName
         uniqueBranches.sort((a: any, b: any) => {
           const nameA = a.BranchName || a.branchName || '';
           const nameB = b.BranchName || b.branchName || '';
           return nameA.localeCompare(nameB);
         });
         
         setBranches(uniqueBranches);
      }).catch`
);

// Update filteredInvoices logic to include branchId filter and companyId filter!
code = code.replace(
  /const filteredInvoices = useMemo\(\(\) => \{\n    return reactiveInvoices\.filter\(inv => \{\n      \/\/ Branch filter[\s\S]*?\/\/ Date Filter/,
  `const filteredInvoices = useMemo(() => {
    return reactiveInvoices.filter(inv => {
      // Company filter - Ensure invoice belongs to this company
      const invCompanyId = (inv as any).companyId || (inv as any).CompanyID || '';
      if (session?.role !== 'SUPER_ADMIN' && invCompanyId && invCompanyId !== session?.companyID) {
        return false;
      }

      // Branch filter
      if (selectedBranchId !== 'ALL') {
        const invBranchId = (inv as any).branchId || (inv as any).BranchID || '';
        if (invBranchId !== selectedBranchId) {
          return false;
        }
      }
      
      // Date Filter`
);

code = code.replace(
  /\} else if \(inv\.type === 'Sales Order'\) \{/,
  `} else if (inv.type === 'Sales Order') {`
);

// Update Customers filter
// Oh wait, reactiveCustomers is used raw! We need to filter it.
code = code.replace(
  /const reactiveCustomers = store\.getCustomers\(\);/,
  `const reactiveCustomersRaw = store.getCustomers();
  const reactiveCustomers = useMemo(() => {
    return reactiveCustomersRaw.filter(c => {
      const custCompanyId = (c as any).companyId || (c as any).CompanyID || '';
      if (session?.role !== 'SUPER_ADMIN' && custCompanyId && custCompanyId !== session?.companyID) return false;
      if (selectedBranchId !== 'ALL') {
         const custBranchId = (c as any).branchId || (c as any).BranchID || '';
         if (custBranchId && custBranchId !== selectedBranchId) return false;
      }
      return true;
    });
  }, [reactiveCustomersRaw, session?.companyID, session?.role, selectedBranchId]);`
);

// Update Stock filter
code = code.replace(
  /const reactiveStock = store\.getStockInventory\(\);/,
  `const reactiveStockRaw = store.getStockInventory();
  const reactiveStock = useMemo(() => {
    return reactiveStockRaw.filter(s => {
      const stockCompanyId = (s as any).companyId || (s as any).CompanyID || '';
      if (session?.role !== 'SUPER_ADMIN' && stockCompanyId && stockCompanyId !== session?.companyID) return false;
      if (selectedBranchId !== 'ALL') {
         const stockBranchId = (s as any).branch || (s as any).branchId || (s as any).BranchID || '';
         if (stockBranchId && stockBranchId !== selectedBranchId) return false;
      }
      return true;
    });
  }, [reactiveStockRaw, session?.companyID, session?.role, selectedBranchId]);`
);

// Update useMemo dependencies for filteredInvoices
code = code.replace(
  /\[reactiveInvoices, dateRange, customStartDate, customEndDate, dateBoundaries\]\);/,
  `[reactiveInvoices, dateRange, customStartDate, customEndDate, dateBoundaries, selectedBranchId, session?.companyID, session?.role]);`
);

fs.writeFileSync('components/CompanyReportsView.tsx', code);

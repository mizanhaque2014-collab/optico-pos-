const fs = require('fs');
const files = [
  'components/DeliveryCollectionView.tsx',
  'components/InvoiceDetailCard.tsx',
  'components/SalesOrderDetailCard.tsx'
];

files.forEach(f => {
  let code = fs.readFileSync(f, 'utf8');
  if (!code.includes("import { useAuth } from '@/lib/AuthContext';")) {
     code = code.replace(
       "import React",
       "import React, { useState, useEffect } from 'react';\nimport { useAuth } from '@/lib/AuthContext';\nimport { companyService } from '@/lib/services/companyService';\nimport { branchService } from '@/lib/services/branchService';"
     );
     // some might not have import React.
     if (!code.includes("import React, { useState, useEffect } from 'react';")) {
        code = "import React, { useState, useEffect } from 'react';\nimport { useAuth } from '@/lib/AuthContext';\nimport { companyService } from '@/lib/services/companyService';\nimport { branchService } from '@/lib/services/branchService';\n" + code;
     }
  }

  // Find component declaration
  const compRegex = /export function (DeliveryCollectionView|InvoiceDetailCard|SalesOrderDetailCard)[^{]*\{/;
  const match = code.match(compRegex);
  if (match) {
     const startIdx = match.index + match[0].length;
     const hookCode = `
  const { session } = useAuth();
  const [customShopName, setCustomShopName] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadShopName() {
      try {
        const invAny = (typeof inv !== 'undefined' ? inv : typeof completedInvoice !== 'undefined' ? completedInvoice : null) as any;
        if (!invAny) return;
        const cId = invAny?.companyId || invAny?.CompanyID || session?.companyID;
        const bId = invAny?.branchId || invAny?.BranchID || session?.branchID;
        
        let loadedCompanyName = '';
        let loadedBranchName = '';

        if (cId && cId !== 'ALL' && cId !== 'COMP-default') {
          try {
             const companies = await companyService.getCompanies();
             const comp = companies.find(c => (c as any).CompanyID === cId || c.companyId === cId || c.id === cId);
             if (comp) {
               loadedCompanyName = (comp as any).CompanyName || comp.companyName || '';
             }
          } catch(e) {}
        }
        if (bId && bId !== 'ALL' && bId !== 'BR-default') {
          try {
             const branches = await branchService.getBranchesV2();
             const br = branches.find(b => (b as any).BranchID === bId || b.branchId === bId || b.id === bId);
             if (br) {
               loadedBranchName = (br as any).BranchName || br.branchName || '';
             }
          } catch(e) {}
        }
        
        if (isMounted) {
           const finalShopName = loadedBranchName || loadedCompanyName || 'Shop Name Not Configured';
           setCustomShopName(finalShopName.toLowerCase().includes('optico pos') ? 'Shop Name Not Configured' : finalShopName);
        }
      } catch (err) {
         if (isMounted) setCustomShopName('Shop Name Not Configured');
      }
    }
    loadShopName();
    return () => { isMounted = false; };
  }, [typeof inv !== 'undefined' ? inv : typeof completedInvoice !== 'undefined' ? completedInvoice : null, session?.companyID, session?.branchID]);
`;
     code = code.slice(0, startIdx) + hookCode + code.slice(startIdx);
  }

  // Replace generateWhatsAppInvoiceText calls
  code = code.replace(/generateWhatsAppInvoiceText\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/g, 'generateWhatsAppInvoiceText($1, $2, $3, $4, customShopName)');
  
  fs.writeFileSync(f, code);
});

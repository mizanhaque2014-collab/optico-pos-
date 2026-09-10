const fs = require('fs');

function addImports(file) {
  let code = fs.readFileSync(file, 'utf8');
  const imp = `import React, { useEffect } from 'react';\nimport { useAuth } from '@/lib/AuthContext';\nimport { companyService } from '@/lib/services/companyService';\nimport { branchService } from '@/lib/services/branchService';\n`;
  
  if (code.includes('"use client";')) {
     code = code.replace('"use client";', '"use client";\n' + imp);
  } else {
     code = imp + code;
  }
  
  fs.writeFileSync(file, code);
}

['components/DeliveryCollectionView.tsx', 'components/InvoiceDetailCard.tsx', 'components/SalesOrderDetailCard.tsx'].forEach(addImports);

const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Fix imports in InvoiceDetailCard
  if (file.includes('InvoiceDetailCard')) {
    code = code.replace("import { branchService } from '@/lib/services/branchService';, { useState } from 'react';", "import { branchService } from '@/lib/services/branchService';\n");
  }
  
  // Fix injection point
  const injectionStart = "  const { session } = useAuth();";
  const injectionEnd = "loadShopName();\n    return () => { isMounted = false; };\n  }, [typeof inv !== 'undefined' ? inv : typeof completedInvoice !== 'undefined' ? completedInvoice : null, session?.companyID, session?.branchID]);\n";
  
  if (code.includes(injectionStart)) {
    const hookCode = code.substring(code.indexOf(injectionStart), code.indexOf(injectionEnd) + injectionEnd.length);
    code = code.replace(hookCode, '');
    
    // Find the real start of the component body.
    const realBodyMatch = code.match(/export function [^\(]+\(\s*\{[^\}]+\}\s*:\s*[^\)]+\)\s*\{|export function [^\(]+\([^)]*\)\s*\{/);
    if (realBodyMatch) {
       const startIdx = realBodyMatch.index + realBodyMatch[0].length;
       code = code.slice(0, startIdx) + "\n" + hookCode + code.slice(startIdx);
    }
  }

  // Remove duplicate imports
  code = code.replace(/import React, \{ useState, useEffect \} from 'react';\nimport \{ useAuth \} from '@\/lib\/AuthContext';\nimport \{ companyService \} from '@\/lib\/services\/companyService';\nimport \{ branchService \} from '@\/lib\/services\/branchService';\n"use client";\n'use client';\nimport \{ useState( as [^,]+)?, useMemo \} from 'react';/, 
    `"use client";\n'use client';\nimport React, { useState, useEffect, useMemo } from 'react';\nimport { useAuth } from '@/lib/AuthContext';\nimport { companyService } from '@/lib/services/companyService';\nimport { branchService } from '@/lib/services/branchService';\n`);

  fs.writeFileSync(file, code);
}

['components/DeliveryCollectionView.tsx', 'components/InvoiceDetailCard.tsx', 'components/SalesOrderDetailCard.tsx'].forEach(fixFile);

const fs = require('fs');

['components/DeliveryCollectionView.tsx', 'components/InvoiceDetailCard.tsx', 'components/SalesOrderDetailCard.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // Remove all 'use client' variants
  code = code.replace(/"use client";/g, '');
  code = code.replace(/'use client';/g, '');
  
  // Remove all duplicate imports
  code = code.replace(/import React[^;]+;/g, '');
  code = code.replace(/import \{ useAuth \}[^;]+;/g, '');
  code = code.replace(/import \{ companyService \}[^;]+;/g, '');
  code = code.replace(/import \{ branchService \}[^;]+;/g, '');
  
  // Also clean up duplicate useState / useEffect imports (from next line after use client)
  code = code.replace(/import \{ useState[^;]+;/g, '');
  code = code.replace(/import \{ useMemo \}[^;]+;/g, '');

  // Let's just restore the basic imports we need.
  const header = `"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { companyService } from '@/lib/services/companyService';
import { branchService } from '@/lib/services/branchService';
`;

  fs.writeFileSync(file, header + code);
});

const fs = require('fs');

let code = fs.readFileSync('components/DeliveryCollectionView.tsx', 'utf8');

// 1. Add refreshInvoices to useStore destructuring
code = code.replace(
  /const { getInvoices, saveInvoice, getCustomers } = useStore\(\);/,
  'const { getInvoices, refreshInvoices, saveInvoice, getCustomers } = useStore();'
);

// 2. Add useEffect to refresh invoices on mount
const refreshEffect = `
  useEffect(() => {
    refreshInvoices();
  }, []);
`;
code = code.replace(
  /const \[customShopName, setCustomShopName\] = useState\(''\);/,
  "const [customShopName, setCustomShopName] = useState('');\n" + refreshEffect
);

// 3. Fix pendingOrders filtering
const pendingOrdersFix = `
  const pendingOrders = useMemo(() => {
    return invoices.filter(i => {
      const t = String(i.type || (i as any).InvoiceType || (i as any).invoiceType || '').trim().toLowerCase();
      const s = String(i.status || (i as any).Status || '').trim().toLowerCase();
      
      const isSalesOrder = t === 'sales order' || t === 'salesorder';
      const isDelivered = s === 'delivered';
      const isCancelled = s === 'cancelled';
      
      const cId = (i as any).companyId || (i as any).CompanyID || '';
      const bId = (i as any).branchId || (i as any).BranchID || '';
      
      const companyMatch = !session?.companyID || session.companyID === 'ALL' || session.companyID === 'COMP-default' || String(cId).trim() === '' || String(cId).trim() === 'COMP-default' || cId === session.companyID;
      const branchMatch = !session?.branchID || session.branchID === 'ALL' || session.branchID === 'BR-default' || String(bId).trim() === '' || String(bId).trim() === 'BR-default' || bId === session.branchID;

      return isSalesOrder && !isDelivered && !isCancelled && companyMatch && branchMatch;
    });
  }, [invoices, session]);
`;

code = code.replace(
  /const pendingOrders = useMemo\(\(\) => \{[\s\S]*?\}, \[invoices\]\);/,
  pendingOrdersFix.trim()
);

fs.writeFileSync('components/DeliveryCollectionView.tsx', code);

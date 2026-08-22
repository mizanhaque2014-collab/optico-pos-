const fs = require('fs');
let code = fs.readFileSync('components/DailySalesReportView.tsx', 'utf8');

const loadDataReplace = `
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDsrData = async () => {
      setIsLoading(true);
      let start = 0;
      let end = Number.MAX_SAFE_INTEGER;
      
      if (dateRange === 'custom') {
        start = customStartDate ? new Date(customStartDate).getTime() : 0;
        end = customEndDate ? new Date(customEndDate).getTime() : Number.MAX_SAFE_INTEGER;
      } else if (dateBoundaries[dateRange]) {
        start = dateBoundaries[dateRange].start;
        end = dateBoundaries[dateRange].end;
      }
      
      const compId = session?.companyID || 'ALL';
      const brId = session?.branchID || 'ALL';
      
      try {
        if (store.getDailySalesReport) {
          const fetchedInvoices = await store.getDailySalesReport(compId, brId, new Date(start).toISOString(), new Date(end).toISOString());
          setInvoices(fetchedInvoices);
        } else {
          setInvoices(store.getInvoices());
        }
      } catch(e) {
        setInvoices(store.getInvoices());
      }
      
      setCustomers(store.getCustomers());
      setIsLoading(false);
    };

    fetchDsrData();
  }, [dateRange, customStartDate, customEndDate, session?.companyID, session?.branchID, dateBoundaries]);
`;

code = code.replace(
  /const loadData = \(\) => {[\s\S]*?}, \[\]\);/m,
  loadDataReplace
);

fs.writeFileSync('components/DailySalesReportView.tsx', code);
console.log("Patched DailySalesReportView.tsx");

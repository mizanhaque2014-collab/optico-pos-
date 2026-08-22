const fs = require('fs');
let code = fs.readFileSync('components/DailySalesReportView.tsx', 'utf8');

const syncFunction = `
  const [isSyncing, setIsSyncing] = useState(false);
  const handleSyncToSheet = async () => {
    if (!store.saveDSRRecord) return;
    setIsSyncing(true);
    try {
      const dsrData = {
        ReportDate: new Date().toISOString().split('T')[0],
        CompanyID: session?.companyID || 'ALL',
        BranchID: session?.branchID || 'ALL',
        DirectSales: reportStats.directSalesAmount,
        SalesOrders: reportStats.salesOrdersAmount,
        DeliveryCollections: reportStats.deliveryCollectionAmount,
        TotalBusiness: reportStats.totalBusinessAmount,
        CashCollected: reportStats.cashCollected,
        UpiCollected: reportStats.upiCollected,
        CardCollected: reportStats.cardCollected,
        PendingOrdersCount: reportStats.pendingOrdersCount,
        PendingOrdersValue: reportStats.pendingOrdersValue,
        PendingPaymentsCount: reportStats.pendingPaymentsCount,
        PendingPaymentsValue: reportStats.pendingPaymentsValue,
        GeneratedAt: new Date().toISOString()
      };
      
      const success = await store.saveDSRRecord(dsrData);
      if (success) {
        alert("Success: End-of-Day DSR synced to Google Sheets 'DSR' tab!");
      } else {
        alert("Failed to sync DSR to Google Sheets. Check backend deployment.");
      }
    } catch(e) {
      alert("Error syncing DSR to Google Sheets.");
    } finally {
      setIsSyncing(false);
    }
  };
`;

if (!code.includes('handleSyncToSheet')) {
  // insert function inside component
  code = code.replace(
    /const handlePrintPDFReport = \(\) => \{/,
    syncFunction + "\n  const handlePrintPDFReport = () => {"
  );
  
  // insert button next to print button
  const buttonHtml = `
            <button 
              onClick={handleSyncToSheet}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
              {isSyncing ? 'Syncing...' : 'Sync to Sheet'}
            </button>
            <button 
              onClick={handlePrintPDFReport}`;
              
  code = code.replace(
    /<button[^>]*onClick=\{handlePrintPDFReport\}/,
    buttonHtml
  );
  
  fs.writeFileSync('components/DailySalesReportView.tsx', code);
  console.log("UI patched successfully.");
}

const fs = require('fs');

let code = fs.readFileSync('app/page.tsx', 'utf8');

const search = `  const [currentView, setCurrentView] = useState<ViewState>('dashboard');`;

const replace = `  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace('/', '');
      if (['dashboard', 'sales_order', 'direct_sale', 'delivery_collection', 'customers', 'stock_inventory', 'daily_sales_report', 'whatsapp_marketing', 'eye_test'].includes(path)) {
        setCurrentView(path as ViewState);
      } else if (path === 'prescriptions') {
        setCurrentView('sales_order');
      } else if (path === 'invoices') {
        setCurrentView('delivery_collection');
      } else if (path === 'inventory') {
        setCurrentView('stock_inventory');
      } else if (path === 'reports') {
        setCurrentView('daily_sales_report');
      } else if (path === 'settings') {
         // handle settings?
      }
    }
  }, []);

  // Sync route when view changes
  useEffect(() => {
    if (typeof window !== 'undefined' && currentView !== 'dashboard') {
      // Don't pushState if it's already there to avoid infinite loop
      if (window.location.pathname !== '/' + currentView) {
        window.history.pushState(null, '', '/' + currentView);
      }
    } else if (typeof window !== 'undefined' && currentView === 'dashboard') {
      if (window.location.pathname !== '/' && window.location.pathname !== '/dashboard') {
        window.history.pushState(null, '', '/');
      }
    }
  }, [currentView]);`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('app/page.tsx', code);
  console.log('Patched page view sync');
}

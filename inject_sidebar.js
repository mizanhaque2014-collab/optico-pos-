const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

const sidebarDef = `
  const role = session?.role || 'SHOP_USER';

  const comingSoonAction = (title: string) => {
    alert(title + " module is currently under development (Backend Integration Pending).");
  };

  let sidebarItems: any[] = [];

  const commonItems = {
    customers: { id: 'customers', label: 'Customers', icon: <Users size={16} />, action: () => navigateTo('customers') },
    inventory: { id: 'stock_inventory', label: 'Inventory', icon: <Package size={16} />, action: () => navigateTo('stock_inventory') },
    prescriptions: { id: 'prescriptions', label: 'Prescriptions', icon: <FileText size={16} />, action: () => comingSoonAction('Prescriptions') },
    direct_sale: { id: 'direct_sale', label: 'Direct Sale', icon: <ShoppingCart size={16} />, action: () => navigateTo('direct_sale') },
    sales_order: { id: 'sales_order', label: 'Sales Order', icon: <FileText size={16} />, action: () => navigateTo('sales_order') },
    delivery_collection: { id: 'delivery_collection', label: 'Delivery Collection', icon: <CheckCircle size={16} />, action: () => navigateTo('delivery_collection') },
    payments: { id: 'payments', label: 'Payments', icon: <CreditCard size={16} />, action: () => comingSoonAction('Payments') },
  };

  if (role === 'SUPER_ADMIN') {
    sidebarItems = [
      { id: 'companies', label: 'Companies', icon: <Building size={16} />, action: () => comingSoonAction('Companies') },
      { id: 'branches', label: 'Branches', icon: <Server size={16} />, action: () => comingSoonAction('Branches') },
      { id: 'users', label: 'Users', icon: <Users size={16} />, action: () => comingSoonAction('Users') },
      commonItems.customers,
      commonItems.inventory,
      commonItems.prescriptions,
      commonItems.direct_sale,
      commonItems.sales_order,
      commonItems.delivery_collection,
      commonItems.payments,
      { id: 'reports', label: 'Reports', icon: <BarChart3 size={16} />, action: () => comingSoonAction('Reports') },
      { id: 'dashboard_analytics', label: 'Dashboard Analytics', icon: <BarChart3 size={16} />, action: () => comingSoonAction('Dashboard Analytics') },
      { id: 'shop_settings', label: 'Shop Settings', icon: <Settings size={16} />, action: () => comingSoonAction('Shop Settings') },
      { id: 'system_settings', label: 'System Settings', icon: <Settings size={16} />, action: () => comingSoonAction('System Settings') },
      { id: 'license_management', label: 'License Management', icon: <ShieldAlert size={16} />, action: () => comingSoonAction('License Management') },
      { id: 'api_config', label: 'API Configuration', icon: <Key size={16} />, action: () => comingSoonAction('API Configuration') },
      { id: 'global_search', label: 'Global Search', icon: <Search size={16} />, action: () => comingSoonAction('Global Search') },
    ];
  } else if (role === 'COMPANY_ADMIN') {
    sidebarItems = [
      commonItems.customers,
      commonItems.inventory,
      commonItems.prescriptions,
      commonItems.direct_sale,
      commonItems.sales_order,
      commonItems.delivery_collection,
      commonItems.payments,
      { id: 'company_reports', label: 'Company Reports', icon: <BarChart3 size={16} />, action: () => comingSoonAction('Company Reports') },
      { id: 'company_users', label: 'Company Users', icon: <Users size={16} />, action: () => comingSoonAction('Company Users') },
      { id: 'company_branches', label: 'Company Branches', icon: <Server size={16} />, action: () => comingSoonAction('Company Branches') },
      { id: 'company_settings', label: 'Company Settings', icon: <Settings size={16} />, action: () => comingSoonAction('Company Settings') },
    ];
  } else {
    sidebarItems = [
      commonItems.direct_sale,
      commonItems.sales_order,
      commonItems.delivery_collection,
      commonItems.customers,
      commonItems.prescriptions,
      commonItems.inventory,
      commonItems.payments,
    ];
  }

  // Security check: if current view is not allowed for SHOP_USER or COMPANY_ADMIN, redirect to dashboard
  useEffect(() => {
    if (role === 'SHOP_USER' && !['dashboard', 'direct_sale', 'sales_order', 'delivery_collection', 'customers', 'stock_inventory', 'eye_test'].includes(currentView)) {
      setCurrentView('dashboard');
    }
  }, [currentView, role]);
`;

// Insert after `const navigateTo...`
code = code.replace(
  `  const navigateTo = (view: ViewState, customer?: any, eyeTest?: any) => {
    setSelectedCustomer(customer || null);
    setPreloadedEyeTest(eyeTest || null);
    setCurrentView(view);
  };`,
  `  const navigateTo = (view: ViewState, customer?: any, eyeTest?: any) => {
    setSelectedCustomer(customer || null);
    setPreloadedEyeTest(eyeTest || null);
    setCurrentView(view);
  };
${sidebarDef}`
);

// Insert sidebar HTML
const sidebarHtml = `
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-[#0A0F1D] border-r border-white/5 flex flex-col p-4 gap-2 shrink-0 overflow-y-auto">
          <button
            onClick={() => navigateTo('dashboard')}
            className={\`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 \${
              currentView === 'dashboard'
                ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }\`}
          >
            <LayoutDashboard size={16} />
            <span className="text-sm tracking-wide">Dashboard Home</span>
          </button>
          
          <div className="mt-4 mb-2 px-4 text-[10px] font-black text-white/30 uppercase tracking-widest">
            Modules
          </div>

          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={item.action}
              className={\`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 \${
                currentView === item.id
                  ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }\`}
            >
              {item.icon}
              <span className="text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </aside>
`;

code = code.replace(
  '<div className="flex flex-1 overflow-hidden">',
  sidebarHtml
);

fs.writeFileSync('app/page.tsx', code);

const fs = require('fs');

let pageCode = fs.readFileSync('app/page.tsx', 'utf8');

const oldCommonPage = `  const commonItems = {
    customers: { id: 'customers', label: 'Customers', icon: <Users size={16} />, action: () => navigateTo('customers') },
    inventory: { id: 'stock_inventory', label: 'Inventory', icon: <Package size={16} />, action: () => navigateTo('stock_inventory') },
    prescriptions: { id: 'prescriptions', label: 'Prescriptions', icon: <FileText size={16} />, action: () => comingSoonAction('Prescriptions') },
    direct_sale: { id: 'direct_sale', label: 'Direct Sale', icon: <ShoppingCart size={16} />, action: () => navigateTo('direct_sale') },
    sales_order: { id: 'sales_order', label: 'Sales Order', icon: <FileText size={16} />, action: () => navigateTo('sales_order') },
    delivery_collection: { id: 'delivery_collection', label: 'Delivery Collection', icon: <CheckCircle size={16} />, action: () => navigateTo('delivery_collection') },
    payments: { id: 'payments', label: 'Payments', icon: <CreditCard size={16} />, action: () => comingSoonAction('Payments') },
  };`;

const newCommonPage = `  const commonItems = {
    customers: { id: 'customers', label: 'Customers', icon: <Users size={16} />, action: () => navigateTo('customers') },
    inventory: { id: 'stock_inventory', label: 'Inventory', icon: <Package size={16} />, action: () => navigateTo('stock_inventory') },
    prescriptions: { id: 'prescriptions', label: 'Prescriptions', icon: <FileText size={16} />, action: () => comingSoonAction('Prescriptions') },
    direct_sale: { id: 'direct_sale', label: 'Direct Sale', icon: <ShoppingCart size={16} />, action: () => navigateTo('direct_sale') },
    sales_order: { id: 'sales_order', label: 'Sales Order', icon: <FileText size={16} />, action: () => navigateTo('sales_order') },
    delivery_collection: { id: 'delivery_collection', label: 'Delivery Collection', icon: <CheckCircle size={16} />, action: () => navigateTo('delivery_collection') },
    payments: { id: 'payments', label: 'Payments', icon: <CreditCard size={16} />, action: () => comingSoonAction('Payments') },
    daily_sales_report: { id: 'daily_sales_report', label: 'Daily Sales Report', icon: <BarChart3 size={16} />, action: () => navigateTo('daily_sales_report') },
    whatsapp_marketing: { id: 'whatsapp_marketing', label: 'WhatsApp Marketing', icon: <MessageSquare size={16} />, action: () => navigateTo('whatsapp_marketing') },
  };`;

pageCode = pageCode.replace(oldCommonPage, newCommonPage);

const oldShopUserPage = `  } else {
    sidebarItems = [
      commonItems.direct_sale,
      commonItems.sales_order,
      commonItems.delivery_collection,
      commonItems.customers,
      commonItems.prescriptions,
      commonItems.inventory,
      commonItems.payments,
    ];
  }`;

const newShopUserPage = `  } else {
    sidebarItems = [
      commonItems.direct_sale,
      commonItems.sales_order,
      commonItems.delivery_collection,
      commonItems.customers,
      commonItems.inventory,
      commonItems.daily_sales_report,
      commonItems.whatsapp_marketing,
    ];
  }`;

pageCode = pageCode.replace(oldShopUserPage, newShopUserPage);

const oldUseEffectPage = `if (role === 'SHOP_USER' && !['dashboard', 'direct_sale', 'sales_order', 'delivery_collection', 'customers', 'stock_inventory', 'eye_test'].includes(currentView)) {`;
const newUseEffectPage = `if (role === 'SHOP_USER' && !['dashboard', 'direct_sale', 'sales_order', 'delivery_collection', 'customers', 'stock_inventory', 'eye_test', 'daily_sales_report', 'whatsapp_marketing'].includes(currentView)) {`;
pageCode = pageCode.replace(oldUseEffectPage, newUseEffectPage);

fs.writeFileSync('app/page.tsx', pageCode);

let dashCode = fs.readFileSync('components/DashboardView.tsx', 'utf8');

const oldCommonDash = `  const commonItems = {
    customers: { title: 'Customers', subtitle: 'Manage client database', icon: <Users size={48} className="text-orange-400" />, color: 'bg-orange-900/30 border-orange-800 hover:bg-orange-850/40 hover:border-orange-500', action: () => onViewChange('customers') },
    inventory: { title: 'Inventory', subtitle: 'Stock & Analytics', icon: <Package size={48} className="text-cyan-400" />, color: 'bg-cyan-900/30 border-cyan-800 hover:bg-cyan-800/40 hover:border-cyan-500', action: () => onViewChange('stock_inventory') },
    prescriptions: { title: 'Prescriptions', subtitle: 'Global Records', icon: <FileText size={48} className="text-yellow-400" />, color: 'bg-yellow-900/30 border-yellow-800 hover:bg-yellow-800/40 hover:border-yellow-500', action: () => comingSoonAction('Prescriptions') },
    direct_sale: { title: 'Direct Sale', subtitle: 'Quick checkout for OTC items', icon: <ShoppingCart size={48} className="text-emerald-400" />, color: 'bg-emerald-900/30 border-emerald-800 hover:bg-emerald-800/40 hover:border-emerald-500', action: () => onViewChange('direct_sale') },
    sales_order: { title: 'Sales Order', subtitle: 'Create order with prescription', icon: <FileText size={48} className="text-blue-400" />, color: 'bg-blue-900/30 border-blue-800 hover:bg-blue-800/40 hover:border-blue-500', action: () => onViewChange('sales_order') },
    delivery_collection: { title: 'Delivery Collection', subtitle: 'Complete order & collect balance', icon: <CheckCircle size={48} className="text-purple-400" />, color: 'bg-purple-900/30 border-purple-800 hover:bg-purple-800/40 hover:border-purple-500', action: () => onViewChange('delivery_collection') },
    payments: { title: 'Payments', subtitle: 'Payment Tracking', icon: <CreditCard size={48} className="text-green-400" />, color: 'bg-green-900/30 border-green-800 hover:bg-green-800/40 hover:border-green-500', action: () => comingSoonAction('Payments') },
  };`;

const newCommonDash = `  const commonItems = {
    customers: { title: 'Customers', subtitle: 'Manage client database', icon: <Users size={48} className="text-orange-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-orange-950/80 to-orange-900/40 border-orange-800/50 hover:bg-orange-900/60 hover:border-orange-500/80 shadow-lg shadow-orange-900/20', action: () => onViewChange('customers') },
    inventory: { title: 'Stock Inventory', subtitle: 'Stock & Analytics', icon: <Package size={48} className="text-cyan-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-cyan-950/80 to-cyan-900/40 border-cyan-800/50 hover:bg-cyan-900/60 hover:border-cyan-500/80 shadow-lg shadow-cyan-900/20', action: () => onViewChange('stock_inventory') },
    prescriptions: { title: 'Prescriptions', subtitle: 'Global Records', icon: <FileText size={48} className="text-yellow-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-yellow-950/80 to-yellow-900/40 border-yellow-800/50 hover:bg-yellow-900/60 hover:border-yellow-500/80 shadow-lg shadow-yellow-900/20', action: () => comingSoonAction('Prescriptions') },
    direct_sale: { title: 'Direct Sale', subtitle: 'Quick checkout for OTC items', icon: <ShoppingCart size={48} className="text-emerald-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-emerald-950/80 to-emerald-900/40 border-emerald-800/50 hover:bg-emerald-900/60 hover:border-emerald-500/80 shadow-lg shadow-emerald-900/20', action: () => onViewChange('direct_sale') },
    sales_order: { title: 'Sales Order', subtitle: 'Create order with prescription', icon: <FileText size={48} className="text-blue-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-blue-950/80 to-blue-900/40 border-blue-800/50 hover:bg-blue-900/60 hover:border-blue-500/80 shadow-lg shadow-blue-900/20', action: () => onViewChange('sales_order') },
    delivery_collection: { title: 'Delivery Collection', subtitle: 'Complete order & collect balance', icon: <CheckCircle size={48} className="text-purple-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-purple-950/80 to-purple-900/40 border-purple-800/50 hover:bg-purple-900/60 hover:border-purple-500/80 shadow-lg shadow-purple-900/20', action: () => onViewChange('delivery_collection') },
    payments: { title: 'Payments', subtitle: 'Payment Tracking', icon: <CreditCard size={48} className="text-green-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-green-950/80 to-green-900/40 border-green-800/50 hover:bg-green-900/60 hover:border-green-500/80 shadow-lg shadow-green-900/20', action: () => comingSoonAction('Payments') },
    daily_sales_report: { title: 'Daily Sales Report', subtitle: 'View daily transactions', icon: <BarChart3 size={48} className="text-pink-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-pink-950/80 to-pink-900/40 border-pink-800/50 hover:bg-pink-900/60 hover:border-pink-500/80 shadow-lg shadow-pink-900/20', action: () => onViewChange('daily_sales_report') },
    whatsapp_marketing: { title: 'WhatsApp Marketing & Campaign', subtitle: 'Broadcasts & Offers', icon: <MessageSquare size={48} className="text-emerald-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-emerald-950/80 to-emerald-900/40 border-emerald-800/50 hover:bg-emerald-900/60 hover:border-emerald-500/80 shadow-lg shadow-emerald-900/20', action: () => onViewChange('whatsapp_marketing') },
  };`;

dashCode = dashCode.replace(oldCommonDash, newCommonDash);

const oldSuperDash = `  if (role === 'SUPER_ADMIN') {
    menuItems = [
      { title: 'Companies', subtitle: 'Manage Tenant Companies', icon: <Building size={48} className="text-purple-400" />, color: 'bg-purple-900/30 border-purple-800 hover:bg-purple-800/40 hover:border-purple-500', action: () => comingSoonAction('Companies') },
      { title: 'Branches', subtitle: 'Manage Store Branches', icon: <Server size={48} className="text-cyan-400" />, color: 'bg-cyan-900/30 border-cyan-800 hover:bg-cyan-800/40 hover:border-cyan-500', action: () => comingSoonAction('Branches') },
      { title: 'Users', subtitle: 'Manage Role Based Users', icon: <Users size={48} className="text-emerald-400" />, color: 'bg-emerald-900/30 border-emerald-800 hover:bg-emerald-800/40 hover:border-emerald-500', action: () => comingSoonAction('Users') },
      commonItems.customers,
      commonItems.inventory,
      commonItems.prescriptions,
      commonItems.direct_sale,
      commonItems.sales_order,
      commonItems.delivery_collection,
      commonItems.payments,
      { title: 'Reports', subtitle: 'Global Reports', icon: <BarChart3 size={48} className="text-pink-400" />, color: 'bg-pink-900/30 border-pink-800 hover:bg-pink-800/40 hover:border-pink-500', action: () => comingSoonAction('Reports') },
      { title: 'Dashboard Analytics', subtitle: 'Advanced Analytics', icon: <BarChart3 size={48} className="text-indigo-400" />, color: 'bg-indigo-900/30 border-indigo-800 hover:bg-indigo-800/40 hover:border-indigo-500', action: () => comingSoonAction('Dashboard Analytics') },
      { title: 'Shop Settings', subtitle: 'Configure Shop', icon: <Settings size={48} className="text-slate-400" />, color: 'bg-slate-900/30 border-slate-800 hover:bg-slate-800/40 hover:border-slate-500', action: () => comingSoonAction('Shop Settings') },
      { title: 'System Settings', subtitle: 'Global System Config', icon: <Settings size={48} className="text-gray-400" />, color: 'bg-gray-900/30 border-gray-800 hover:bg-gray-800/40 hover:border-gray-500', action: () => comingSoonAction('System Settings') },
      { title: 'License Management', subtitle: 'Manage Licenses', icon: <ShieldAlert size={48} className="text-rose-400" />, color: 'bg-rose-900/30 border-rose-800 hover:bg-rose-800/40 hover:border-rose-500', action: () => comingSoonAction('License Management') },
      { title: 'API Configuration', subtitle: 'Manage Endpoint URLs', icon: <Key size={48} className="text-cyan-400" />, color: 'bg-cyan-900/30 border-cyan-800 hover:bg-cyan-800/40 hover:border-cyan-500', action: () => comingSoonAction('API Configuration') },
      { title: 'Global Search', subtitle: 'Search System', icon: <Search size={48} className="text-yellow-400" />, color: 'bg-yellow-900/30 border-yellow-800 hover:bg-yellow-800/40 hover:border-yellow-500', action: () => comingSoonAction('Global Search') },
    ];
  }`;

const newSuperDash = `  if (role === 'SUPER_ADMIN') {
    menuItems = [
      { title: 'Companies', subtitle: 'Manage Tenant Companies', icon: <Building size={48} className="text-purple-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-purple-950/80 to-purple-900/40 border-purple-800/50 hover:bg-purple-900/60 hover:border-purple-500/80 shadow-lg shadow-purple-900/20', action: () => comingSoonAction('Companies') },
      { title: 'Branches', subtitle: 'Manage Store Branches', icon: <Server size={48} className="text-cyan-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-cyan-950/80 to-cyan-900/40 border-cyan-800/50 hover:bg-cyan-900/60 hover:border-cyan-500/80 shadow-lg shadow-cyan-900/20', action: () => comingSoonAction('Branches') },
      { title: 'Users', subtitle: 'Manage Role Based Users', icon: <Users size={48} className="text-emerald-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-emerald-950/80 to-emerald-900/40 border-emerald-800/50 hover:bg-emerald-900/60 hover:border-emerald-500/80 shadow-lg shadow-emerald-900/20', action: () => comingSoonAction('Users') },
      commonItems.customers,
      commonItems.inventory,
      commonItems.prescriptions,
      commonItems.direct_sale,
      commonItems.sales_order,
      commonItems.delivery_collection,
      commonItems.payments,
      { title: 'Reports', subtitle: 'Global Reports', icon: <BarChart3 size={48} className="text-pink-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-pink-950/80 to-pink-900/40 border-pink-800/50 hover:bg-pink-900/60 hover:border-pink-500/80 shadow-lg shadow-pink-900/20', action: () => comingSoonAction('Reports') },
      commonItems.whatsapp_marketing,
      { title: 'License Management', subtitle: 'Manage Licenses', icon: <ShieldAlert size={48} className="text-rose-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-rose-950/80 to-rose-900/40 border-rose-800/50 hover:bg-rose-900/60 hover:border-rose-500/80 shadow-lg shadow-rose-900/20', action: () => comingSoonAction('License Management') },
      { title: 'System Settings', subtitle: 'Global System Config', icon: <Settings size={48} className="text-gray-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-gray-950/80 to-gray-900/40 border-gray-800/50 hover:bg-gray-900/60 hover:border-gray-500/80 shadow-lg shadow-gray-900/20', action: () => comingSoonAction('System Settings') },
      { title: 'Dashboard Analytics', subtitle: 'Advanced Analytics', icon: <BarChart3 size={48} className="text-indigo-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-indigo-950/80 to-indigo-900/40 border-indigo-800/50 hover:bg-indigo-900/60 hover:border-indigo-500/80 shadow-lg shadow-indigo-900/20', action: () => comingSoonAction('Dashboard Analytics') },
    ];
  }`;
dashCode = dashCode.replace(oldSuperDash, newSuperDash);

const oldCompanyDash = `  } else if (role === 'COMPANY_ADMIN') {
    menuItems = [
      commonItems.customers,
      commonItems.inventory,
      commonItems.prescriptions,
      commonItems.direct_sale,
      commonItems.sales_order,
      commonItems.delivery_collection,
      commonItems.payments,
      { title: 'Company Reports', subtitle: 'Analytics', icon: <BarChart3 size={48} className="text-pink-400" />, color: 'bg-pink-900/30 border-pink-800 hover:bg-pink-800/40 hover:border-pink-500', action: () => comingSoonAction('Company Reports') },
      { title: 'Company Users', subtitle: 'Manage Role Based Users', icon: <Users size={48} className="text-emerald-400" />, color: 'bg-emerald-900/30 border-emerald-800 hover:bg-emerald-800/40 hover:border-emerald-500', action: () => comingSoonAction('Company Users') },
      { title: 'Company Branches', subtitle: 'Manage Store Branches', icon: <Server size={48} className="text-cyan-400" />, color: 'bg-cyan-900/30 border-cyan-800 hover:bg-cyan-800/40 hover:border-cyan-500', action: () => comingSoonAction('Company Branches') },
      { title: 'Company Settings', subtitle: 'Company Config', icon: <Settings size={48} className="text-slate-400" />, color: 'bg-slate-900/30 border-slate-800 hover:bg-slate-800/40 hover:border-slate-500', action: () => comingSoonAction('Company Settings') },
    ];
  }`;

const newCompanyDash = `  } else if (role === 'COMPANY_ADMIN') {
    menuItems = [
      { title: 'Company Reports', subtitle: 'Analytics', icon: <BarChart3 size={48} className="text-pink-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-pink-950/80 to-pink-900/40 border-pink-800/50 hover:bg-pink-900/60 hover:border-pink-500/80 shadow-lg shadow-pink-900/20', action: () => comingSoonAction('Company Reports') },
      commonItems.whatsapp_marketing,
      commonItems.daily_sales_report,
      commonItems.inventory,
      commonItems.payments,
      commonItems.customers,
      commonItems.sales_order,
      commonItems.direct_sale,
      commonItems.delivery_collection,
    ];
  }`;
dashCode = dashCode.replace(oldCompanyDash, newCompanyDash);

const oldShopDash = `  } else {
    menuItems = [
      commonItems.direct_sale,
      commonItems.sales_order,
      commonItems.delivery_collection,
      commonItems.customers,
      commonItems.prescriptions,
      commonItems.inventory,
      commonItems.payments,
    ];
  }`;

const newShopDash = `  } else {
    menuItems = [
      commonItems.direct_sale,
      commonItems.sales_order,
      commonItems.delivery_collection,
      commonItems.customers,
      commonItems.inventory,
      commonItems.daily_sales_report,
      commonItems.whatsapp_marketing,
    ];
  }`;

dashCode = dashCode.replace(oldShopDash, newShopDash);

const oldCardRender = `        {menuItems.map((item) => (
          <button
            key={item.title}
            onClick={item.action}
            className={\`flex flex-col items-center justify-center p-6 rounded-2xl border-b-4 transition-all duration-200 group text-center shadow-lg \${item.color}\`}
          >
            <div className="mb-4 transform group-hover:scale-110 transition-transform duration-200">
              {item.icon}
            </div>
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{item.title}</h3>
            <p className="text-white/60 font-bold text-[10px] uppercase tracking-widest">{item.subtitle}</p>
          </button>
        ))}`;

const newCardRender = `        {menuItems.map((item) => (
          <button
            key={item.title}
            onClick={item.action}
            className={\`flex flex-col items-center justify-center p-8 rounded-3xl border transition-all duration-300 group text-center backdrop-blur-xl relative overflow-hidden \${item.color}\`}
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 mb-6 p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 group-hover:bg-white/10 transition-colors duration-300">
              {item.icon}
            </div>
            <h3 className="relative z-10 text-2xl font-black text-white mb-3 tracking-tight group-hover:text-cyan-300 transition-colors duration-300">{item.title}</h3>
            <p className="relative z-10 text-white/50 font-semibold text-xs tracking-widest uppercase">{item.subtitle}</p>
          </button>
        ))}`;
dashCode = dashCode.replace(oldCardRender, newCardRender);

fs.writeFileSync('components/DashboardView.tsx', dashCode);

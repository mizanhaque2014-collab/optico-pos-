const fs = require('fs');
let code = fs.readFileSync('components/DashboardView.tsx', 'utf8');

// I need to redefine the menuItems inside DashboardView.tsx
const search = `  let menuItems = [`;
const replace = `  let menuItems: any[] = [`;

code = code.replace(search, replace);

const replaceFilter = `
  // Filter based on roles
  if (role === 'SHOP_USER') {
    menuItems = menuItems.filter(item => 
      ['Direct Sale', 'Sales Order', 'Delivery Collection', 'Customers', 'Stock Inventory'].includes(item.title)
    );
  }

  return (`;

const newFilter = `
  const comingSoonAction = (title: string) => {
    alert(title + " module is currently under development (Backend Integration Pending).");
  };

  const superAdminMenus = [
    { title: 'Companies', subtitle: 'Manage Tenant Companies', icon: <Users size={48} className="text-purple-400" />, color: 'bg-purple-900/30 border-purple-800', action: () => comingSoonAction('Companies') },
    { title: 'Branches', subtitle: 'Manage Store Branches', icon: <Users size={48} className="text-cyan-400" />, color: 'bg-cyan-900/30 border-cyan-800', action: () => comingSoonAction('Branches') },
    { title: 'Users', subtitle: 'Manage Role Based Users', icon: <Users size={48} className="text-emerald-400" />, color: 'bg-emerald-900/30 border-emerald-800', action: () => comingSoonAction('Users') },
    { title: 'Prescriptions', subtitle: 'Global Prescription Records', icon: <FileText size={48} className="text-yellow-400" />, color: 'bg-yellow-900/30 border-yellow-800', action: () => comingSoonAction('Prescriptions') },
    { title: 'Invoices', subtitle: 'All Generated Invoices', icon: <FileText size={48} className="text-blue-400" />, color: 'bg-blue-900/30 border-blue-800', action: () => comingSoonAction('Invoices') },
    { title: 'Payments', subtitle: 'Global Payment Tracking', icon: <FileText size={48} className="text-green-400" />, color: 'bg-green-900/30 border-green-800', action: () => comingSoonAction('Payments') },
    { title: 'Reports', subtitle: 'Advanced Analytics', icon: <BarChart3 size={48} className="text-pink-400" />, color: 'bg-pink-900/30 border-pink-800', action: () => comingSoonAction('Reports') },
    { title: 'Subscriptions', subtitle: 'Manage SaaS Subscriptions', icon: <Package size={48} className="text-indigo-400" />, color: 'bg-indigo-900/30 border-indigo-800', action: () => comingSoonAction('Subscriptions') },
    { title: 'License', subtitle: 'License Management', icon: <CheckCircle size={48} className="text-rose-400" />, color: 'bg-rose-900/30 border-rose-800', action: () => comingSoonAction('License') },
    { title: 'Settings', subtitle: 'System Settings', icon: <Settings size={48} className="text-slate-400" />, color: 'bg-slate-900/30 border-slate-800', action: () => comingSoonAction('Settings') },
    { title: 'System Logs', subtitle: 'Audit Logs', icon: <FileText size={48} className="text-orange-400" />, color: 'bg-orange-900/30 border-orange-800', action: () => comingSoonAction('System Logs') },
    { title: 'API Configuration', subtitle: 'Manage Endpoint URLs', icon: <MessageSquare size={48} className="text-cyan-400" />, color: 'bg-cyan-900/30 border-cyan-800', action: () => comingSoonAction('API Configuration') },
  ];

  const companyAdminMenus = [
    { title: 'Branches', subtitle: 'Manage Store Branches', icon: <Users size={48} className="text-cyan-400" />, color: 'bg-cyan-900/30 border-cyan-800', action: () => comingSoonAction('Branches') },
    { title: 'Users', subtitle: 'Manage Role Based Users', icon: <Users size={48} className="text-emerald-400" />, color: 'bg-emerald-900/30 border-emerald-800', action: () => comingSoonAction('Users') },
    { title: 'Prescriptions', subtitle: 'Global Prescription Records', icon: <FileText size={48} className="text-yellow-400" />, color: 'bg-yellow-900/30 border-yellow-800', action: () => comingSoonAction('Prescriptions') },
    { title: 'Invoices', subtitle: 'All Generated Invoices', icon: <FileText size={48} className="text-blue-400" />, color: 'bg-blue-900/30 border-blue-800', action: () => comingSoonAction('Invoices') },
    { title: 'Payments', subtitle: 'Payment Tracking', icon: <FileText size={48} className="text-green-400" />, color: 'bg-green-900/30 border-green-800', action: () => comingSoonAction('Payments') },
    { title: 'Reports', subtitle: 'Analytics', icon: <BarChart3 size={48} className="text-pink-400" />, color: 'bg-pink-900/30 border-pink-800', action: () => comingSoonAction('Reports') },
    { title: 'Settings', subtitle: 'Company Settings', icon: <Settings size={48} className="text-slate-400" />, color: 'bg-slate-900/30 border-slate-800', action: () => comingSoonAction('Settings') },
  ];

  if (role === 'SUPER_ADMIN') {
    const existingTitles = menuItems.map(m => m.title);
    const newItems = superAdminMenus.filter(m => !existingTitles.includes(m.title));
    menuItems = [...menuItems, ...newItems];
  } else if (role === 'COMPANY_ADMIN') {
    const existingTitles = menuItems.map(m => m.title);
    const newItems = companyAdminMenus.filter(m => !existingTitles.includes(m.title));
    menuItems = [...menuItems, ...newItems];
  } else if (role === 'SHOP_USER') {
    menuItems = menuItems.filter(item => 
      ['Customers', 'Direct Sale', 'Sales Order', 'Delivery Collection', 'Stock Inventory'].includes(item.title)
    );
  }

  return (`;

code = code.replace(replaceFilter, newFilter);

fs.writeFileSync('components/DashboardView.tsx', code);

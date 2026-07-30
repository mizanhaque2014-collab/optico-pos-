const fs = require('fs');

let dashCode = fs.readFileSync('components/DashboardView.tsx', 'utf8');

const oldSuperDash = `  if (role === 'SUPER_ADMIN') {
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
      { title: 'Dashboard Analytics', subtitle: 'Advanced Analytics', icon: <BarChart3 size={48} className="text-indigo-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-indigo-950/80 to-indigo-900/40 border-indigo-800/50 hover:bg-indigo-900/60 hover:border-indigo-500/80 shadow-lg shadow-indigo-900/20', action: () => comingSoonAction('Dashboard Analytics') },
      { title: 'Shop Settings', subtitle: 'Configure Shop', icon: <Settings size={48} className="text-slate-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-slate-950/80 to-slate-900/40 border-slate-800/50 hover:bg-slate-900/60 hover:border-slate-500/80 shadow-lg shadow-slate-900/20', action: () => comingSoonAction('Shop Settings') },
      { title: 'System Settings', subtitle: 'Global System Config', icon: <Settings size={48} className="text-gray-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-gray-950/80 to-gray-900/40 border-gray-800/50 hover:bg-gray-900/60 hover:border-gray-500/80 shadow-lg shadow-gray-900/20', action: () => comingSoonAction('System Settings') },
      { title: 'API Configuration', subtitle: 'Manage Endpoint URLs', icon: <Key size={48} className="text-cyan-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-cyan-950/80 to-cyan-900/40 border-cyan-800/50 hover:bg-cyan-900/60 hover:border-cyan-500/80 shadow-lg shadow-cyan-900/20', action: () => comingSoonAction('API Configuration') },
      { title: 'License Management', subtitle: 'Manage Licenses', icon: <ShieldAlert size={48} className="text-rose-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-rose-950/80 to-rose-900/40 border-rose-800/50 hover:bg-rose-900/60 hover:border-rose-500/80 shadow-lg shadow-rose-900/20', action: () => comingSoonAction('License Management') },
    ];
  }`;

dashCode = dashCode.replace(oldSuperDash, newSuperDash);
fs.writeFileSync('components/DashboardView.tsx', dashCode);

let pageCode = fs.readFileSync('app/page.tsx', 'utf8');

const oldSuperSidebar = `  if (role === 'SUPER_ADMIN') {
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
      commonItems.whatsapp_marketing,
      { id: 'license_management', label: 'License Management', icon: <ShieldAlert size={16} />, action: () => comingSoonAction('License Management') },
      { id: 'system_settings', label: 'System Settings', icon: <Settings size={16} />, action: () => comingSoonAction('System Settings') },
      { id: 'dashboard_analytics', label: 'Dashboard Analytics', icon: <BarChart3 size={16} />, action: () => comingSoonAction('Dashboard Analytics') },
    ];
  }`;

const newSuperSidebar = `  if (role === 'SUPER_ADMIN') {
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
      { id: 'api_config', label: 'API Configuration', icon: <Key size={16} />, action: () => comingSoonAction('API Configuration') },
      { id: 'license_management', label: 'License Management', icon: <ShieldAlert size={16} />, action: () => comingSoonAction('License Management') },
    ];
  }`;

pageCode = pageCode.replace(oldSuperSidebar, newSuperSidebar);
fs.writeFileSync('app/page.tsx', pageCode);

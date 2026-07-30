const fs = require('fs');
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
      { id: 'dashboard_analytics', label: 'Dashboard Analytics', icon: <BarChart3 size={16} />, action: () => comingSoonAction('Dashboard Analytics') },
      { id: 'shop_settings', label: 'Shop Settings', icon: <Settings size={16} />, action: () => comingSoonAction('Shop Settings') },
      { id: 'system_settings', label: 'System Settings', icon: <Settings size={16} />, action: () => comingSoonAction('System Settings') },
      { id: 'license_management', label: 'License Management', icon: <ShieldAlert size={16} />, action: () => comingSoonAction('License Management') },
      { id: 'api_config', label: 'API Configuration', icon: <Key size={16} />, action: () => comingSoonAction('API Configuration') },
      { id: 'global_search', label: 'Global Search', icon: <Search size={16} />, action: () => comingSoonAction('Global Search') },
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
      commonItems.whatsapp_marketing,
      { id: 'license_management', label: 'License Management', icon: <ShieldAlert size={16} />, action: () => comingSoonAction('License Management') },
      { id: 'system_settings', label: 'System Settings', icon: <Settings size={16} />, action: () => comingSoonAction('System Settings') },
      { id: 'dashboard_analytics', label: 'Dashboard Analytics', icon: <BarChart3 size={16} />, action: () => comingSoonAction('Dashboard Analytics') },
    ];
  }`;

pageCode = pageCode.replace(oldSuperSidebar, newSuperSidebar);
fs.writeFileSync('app/page.tsx', pageCode);

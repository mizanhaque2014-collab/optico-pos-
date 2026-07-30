const fs = require('fs');

let pageCode = fs.readFileSync('app/page.tsx', 'utf8');

const oldCompanySidebar = `  } else if (role === 'COMPANY_ADMIN') {
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
  }`;

const newCompanySidebar = `  } else if (role === 'COMPANY_ADMIN') {
    sidebarItems = [
      { id: 'company_reports', label: 'Company Reports', icon: <BarChart3 size={16} />, action: () => comingSoonAction('Company Reports') },
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

pageCode = pageCode.replace(oldCompanySidebar, newCompanySidebar);

fs.writeFileSync('app/page.tsx', pageCode);

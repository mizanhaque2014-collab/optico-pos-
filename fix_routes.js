const fs = require('fs');

// Fix components/DashboardView.tsx
let dashboardCode = fs.readFileSync('components/DashboardView.tsx', 'utf8');
dashboardCode = dashboardCode.replace(
  `action: () => comingSoonAction('Companies')`,
  `action: () => window.location.href = '/super-admin?tab=companies'`
).replace(
  `action: () => comingSoonAction('Branches')`,
  `action: () => window.location.href = '/super-admin?tab=branches'`
).replace(
  `action: () => comingSoonAction('Users')`,
  `action: () => window.location.href = '/super-admin?tab=users'`
).replace(
  `action: () => comingSoonAction('Shop Settings')`,
  `action: () => window.location.href = '/super-admin?tab=settings'`
).replace(
  `action: () => comingSoonAction('System Settings')`,
  `action: () => window.location.href = '/super-admin?tab=settings'`
).replace(
  `action: () => comingSoonAction('API Configuration')`,
  `action: () => window.location.href = '/super-admin?tab=api_status'`
).replace(
  `action: () => comingSoonAction('License Management')`,
  `action: () => window.location.href = '/super-admin?tab=security'`
).replace(
  `action: () => comingSoonAction('Dashboard Analytics')`,
  `action: () => window.location.href = '/super-admin?tab=analytics'`
).replace(
  `action: () => comingSoonAction('Reports')`,
  `action: () => window.location.href = '/super-admin?tab=analytics'`
);
fs.writeFileSync('components/DashboardView.tsx', dashboardCode);

// Fix app/page.tsx
let pageCode = fs.readFileSync('app/page.tsx', 'utf8');
pageCode = pageCode.replace(
  `action: () => comingSoonAction('Companies')`,
  `action: () => window.location.href = '/super-admin?tab=companies'`
).replace(
  `action: () => comingSoonAction('Branches')`,
  `action: () => window.location.href = '/super-admin?tab=branches'`
).replace(
  `action: () => comingSoonAction('Users')`,
  `action: () => window.location.href = '/super-admin?tab=users'`
).replace(
  `action: () => comingSoonAction('Shop Settings')`,
  `action: () => window.location.href = '/super-admin?tab=settings'`
).replace(
  `action: () => comingSoonAction('System Settings')`,
  `action: () => window.location.href = '/super-admin?tab=settings'`
).replace(
  `action: () => comingSoonAction('API Configuration')`,
  `action: () => window.location.href = '/super-admin?tab=api_status'`
).replace(
  `action: () => comingSoonAction('License Management')`,
  `action: () => window.location.href = '/super-admin?tab=security'`
).replace(
  `action: () => comingSoonAction('Dashboard Analytics')`,
  `action: () => window.location.href = '/super-admin?tab=analytics'`
).replace(
  `action: () => comingSoonAction('Reports')`,
  `action: () => window.location.href = '/super-admin?tab=analytics'`
);
fs.writeFileSync('app/page.tsx', pageCode);

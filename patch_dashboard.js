const fs = require('fs');
let code = fs.readFileSync('components/DashboardView.tsx', 'utf8');
code = code.replace(
  /action: \(\) => comingSoonAction\('Company Reports'\)/,
  "action: () => onViewChange('reports')"
);
fs.writeFileSync('components/DashboardView.tsx', code);

let appCode = fs.readFileSync('app/page.tsx', 'utf8');
appCode = appCode.replace(
  /action: \(\) => comingSoonAction\('Company Reports'\)/,
  "action: () => navigateTo('reports')"
);

appCode = appCode.replace(
  /\} else if \(path === 'reports'\) \{\n        setCurrentView\('daily_sales_report'\);/,
  `} else if (path === 'reports') {\n        setCurrentView('reports');`
);

// We also need to add CompanyReportsView to the imports and render it in app/page.tsx
if (!appCode.includes('CompanyReportsView')) {
  appCode = appCode.replace(
    /import \{ DailySalesReportView \} from '@\/components\/DailySalesReportView';/,
    `import { DailySalesReportView } from '@/components/DailySalesReportView';\nimport { CompanyReportsView } from '@/components/CompanyReportsView';`
  );
  
  appCode = appCode.replace(
    /\{currentView === 'daily_sales_report' && <DailySalesReportView onBack=\{\(\) => navigateTo\('dashboard'\)\} \/>\}/,
    `{currentView === 'daily_sales_report' && <DailySalesReportView onBack={() => navigateTo('dashboard')} />}\n          {currentView === 'reports' && <CompanyReportsView onBack={() => navigateTo('dashboard')} />}`
  );
}

fs.writeFileSync('app/page.tsx', appCode);

const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// We can just add a simple check inside handleNavigate
const search = `  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
  };`;

const replace = `  const handleNavigate = (view: ViewState) => {
    if (session?.role === 'SHOP_USER' && ['daily_sales_report', 'whatsapp_marketing'].includes(view)) {
      alert("Access Denied. You do not have permission to view this section.");
      return;
    }
    setCurrentView(view);
  };`;

code = code.replace(search, replace);

// And we can update the dashboard title based on role
// wait, we don't have dashboard title here.

fs.writeFileSync('app/page.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf-8');

code = code.replace(
  `{currentView === 'whatsapp_marketing' && <WhatsAppMarketingView onBack={() => navigateTo('dashboard')} />}`,
  `{currentView === 'whatsapp_marketing' && <WhatsAppMarketingView onBack={() => navigateTo('dashboard')} />}
          {currentView === 'payments' && <PaymentsView />}`
);

fs.writeFileSync('app/page.tsx', code);
console.log("Patched app/page.tsx successfully.");

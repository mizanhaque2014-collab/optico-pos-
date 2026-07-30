const fs = require('fs');
let code = fs.readFileSync('components/SalesOrderDetailCard.tsx', 'utf-8');

code = code.replace("import { generateWhatsAppMessage, getWhatsAppUrl } from '@/lib/whatsapp';", "");
code = code.replace(`  const handleShareWhatsApp = () => {
    const msg = generateWhatsAppMessage(inv, customer);
    const url = getWhatsAppUrl(customer?.mobile || '', msg);
    window.open(url, '_blank');
  };`, `  const handleShareWhatsApp = () => {
    const msg = encodeURIComponent(\`Order Invoice: \${inv.invoiceNumber}\\nTotal: ₹\${grandTotal}\\nStatus: \${inv.status}\`);
    const url = \`https://wa.me/\${customer?.mobile || ''}?text=\${msg}\`;
    window.open(url, '_blank');
  };`);

fs.writeFileSync('components/SalesOrderDetailCard.tsx', code);

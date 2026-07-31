const fs = require('fs');
let code = fs.readFileSync('components/InvoiceFormView.tsx', 'utf8');

const injection = `
      if (type === 'Sales Order') {
        const payload = {
          invoiceId: newInvoice.id,
          items: newInvoice.items
        };
        const { apiCall } = await import('@/lib/apiClient');
        await apiCall('saveSalesOrderItems', payload);
        
        // Read back to verify
        const savedItems = await apiCall('getSalesOrderItems', { invoiceId: newInvoice.id });
        if (!savedItems || !Array.isArray(savedItems) || savedItems.length === 0) {
          throw new Error('Sales Order Items were not saved.');
        }
      }
`;

if (code.includes(injection)) {
  code = code.replace(injection, '');
  fs.writeFileSync('components/InvoiceFormView.tsx', code);
  console.log("Removed saveSalesOrderItems block from frontend");
} else {
  console.log("Could not find saveSalesOrderItems block");
}

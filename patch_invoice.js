const fs = require('fs');
let code = fs.readFileSync('components/InvoiceFormView.tsx', 'utf8');

const target = `    try {
      await invoiceService.createInvoice(newInvoice as any);
      setIsInvoiceSaved(true);
      setSavedInvoice(newInvoice);
    } catch (err) {
      console.error(err);
      alert('Failed to save Sales Order');
    } finally {`;

const replacement = `    try {
      await invoiceService.createInvoice(newInvoice as any);
      
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

      setIsInvoiceSaved(true);
      setSavedInvoice(newInvoice);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to save Sales Order');
    } finally {`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('components/InvoiceFormView.tsx', code);
  console.log('Patched successfully');
} else {
  console.log('Target not found');
}

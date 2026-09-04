const fs = require('fs');
let code = fs.readFileSync('lib/services/paymentService.ts', 'utf-8');

code = code.replace(
  `const data = await apiCall<PaymentRecord[]>('getPayments', { customerId });
      if (Array.isArray(data)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        return data;
      }`,
  `const data = await apiCall<any[]>('getPayments', { customerId });
      if (Array.isArray(data)) {
        const mapped = data.map(p => ({
          id: p.PaymentID || p.id,
          invoiceId: p.InvoiceID || p.invoiceId,
          invoiceNumber: p.InvoiceNumber || p.invoiceNumber || 'N/A',
          customerId: p.CustomerID || p.customerId,
          amount: parseFloat(p.Amount || p.amount || 0),
          date: p.PaymentDate || p.CreatedAt || p.createdAt || p.date,
          mode: p.PaymentMode || p.mode || 'Cash',
          remarks: p.Remarks || p.remarks
        }));
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
        }
        return mapped;
      }`
);

fs.writeFileSync('lib/services/paymentService.ts', code);
console.log("Patched paymentService.ts mapped array successfully.");

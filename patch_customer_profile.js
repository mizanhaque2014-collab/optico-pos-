const fs = require('fs');
let code = fs.readFileSync('components/CustomerProfileView.tsx', 'utf8');

// We need to fetch items for Sales Orders
const injection = `
        // Execute both major API calls simultaneously
        const [invs, history] = await Promise.all([
          invoiceService.getInvoicesByCustomer(customer.id).catch(e => {
            console.error("Failed to load invoices:", e);
            return [];
          }),
          customerService.loadCustomerHistory(customer.id).catch(async (e) => {
`;

const replacement = `
        // Execute both major API calls simultaneously
        let [invs, history] = await Promise.all([
          invoiceService.getInvoicesByCustomer(customer.id).catch(e => {
            console.error("Failed to load invoices:", e);
            return [];
          }),
          customerService.loadCustomerHistory(customer.id).catch(async (e) => {
`;

if (code.includes(injection)) {
  code = code.replace(injection, replacement);
  
  const fetchItemsInjection = `
        setInvoices(invs.sort((a,b) => b.createdAt - a.createdAt));
`;

  const fetchItemsReplacement = `
        // Load SalesOrderItems for each Sales Order
        try {
          const { apiCall } = await import('@/lib/apiClient');
          await Promise.all(invs.map(async (inv) => {
            if (inv.type === 'Sales Order' && (!inv.items || inv.items.length === 0)) {
              try {
                const items = await apiCall('getSalesOrderItems', { invoiceId: inv.id });
                if (items && Array.isArray(items) && items.length > 0) {
                  inv.items = items;
                }
              } catch (e) {
                console.error("Failed to load SalesOrderItems for " + inv.id, e);
              }
            }
          }));
        } catch (e) {
           console.error("Error fetching sales order items", e);
        }

        setInvoices(invs.sort((a,b) => b.createdAt - a.createdAt));
`;
  code = code.replace(fetchItemsInjection, fetchItemsReplacement);
}

fs.writeFileSync('components/CustomerProfileView.tsx', code);

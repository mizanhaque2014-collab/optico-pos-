const fs = require('fs');
const path = './components/CustomerProfileView.tsx';
let code = fs.readFileSync(path, 'utf8');

const newFetchBlock = `        const history = await customerService.loadCustomerHistory(customer.id).catch(async (e) => {
            console.error("Failed to load customer profile history via loadCustomerHistory, running fallbacks:", e);
            try {
              const etList = await eyeTestService.loadEyeTestHistory(customer.id);
              const pList = await prescriptionService.loadPrescriptionHistory(customer.id);
              return { eyeTests: etList, prescriptions: pList, invoices: [] };
            } catch (fallbackError) {
              console.error("Profile history fallback loading failed:", fallbackError);
              return { eyeTests: [], prescriptions: [], invoices: [] };
            }
        });
        
        let finalInvoices = history.invoices || [];`;

const oldFetchBlock = `        let [invs, history] = await Promise.all([
          invoiceService.getInvoicesByCustomer(customer.id).catch(e => {
            console.error("Failed to load invoices:", e);
            return [];
          }),
          customerService.loadCustomerHistory(customer.id).catch(async (e) => {
            console.error("Failed to load customer profile history via loadCustomerHistory, running fallbacks:", e);
            try {
              const etList = await eyeTestService.loadEyeTestHistory(customer.id);
              const pList = await prescriptionService.loadPrescriptionHistory(customer.id);
              return { eyeTests: etList, prescriptions: pList, invoices: [] };
            } catch (fallbackError) {
              console.error("Profile history fallback loading failed:", fallbackError);
              return { eyeTests: [], prescriptions: [], invoices: [] };
            }
          })
        ]);
        
        let finalInvoices = (invs && invs.length > 0) ? invs : (history.invoices || []);`;

code = code.replace(newFetchBlock, oldFetchBlock);

code = code.replace(
  '        console.log("Final Invoices", finalInvoices);',
  `        console.log("Final Invoices", finalInvoices);

        // Load SalesOrderItems for each Sales Order
        try {
          const { apiCall } = await import('@/lib/apiClient');
          await Promise.all(finalInvoices.map(async (inv: any) => {
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
        }`
);

fs.writeFileSync(path, code);

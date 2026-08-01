const fs = require('fs');
const path = './components/CustomerProfileView.tsx';
let code = fs.readFileSync(path, 'utf8');

// Remove the getSalesOrderItems block entirely
code = code.replace(/\s*\/\/ Load SalesOrderItems for each Sales Order[\s\S]*?\}\s*catch\s*\(e\)\s*\{\s*console\.error\("Error fetching sales order items",\s*e\);\s*\}/, '');

// Also avoid calling getInvoicesByCustomer AND loadCustomerHistory since loadCustomerHistory returns invoices anyway.
const fetchBlock = `        let [invs, history] = await Promise.all([
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

code = code.replace(fetchBlock, newFetchBlock);

fs.writeFileSync(path, code);

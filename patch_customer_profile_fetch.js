const fs = require('fs');
const path = './components/CustomerProfileView.tsx';
let code = fs.readFileSync(path, 'utf8');

const target = `        const history = await customerService.loadCustomerHistory(customer.id).catch(async (e) => {
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

const replacement = `        let [invs, history] = await Promise.all([
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

code = code.replace(target, replacement);
fs.writeFileSync(path, code);

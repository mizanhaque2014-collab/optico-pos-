const fs = require('fs');
let code = fs.readFileSync('components/CustomerProfileView.tsx', 'utf-8');

// I will completely replace loadHistory function body
const startIdx = code.indexOf('async function loadHistory() {');
const endIdx = code.indexOf('loadHistory();', startIdx);

const newLoadHistory = `async function loadHistory() {
      try {
        console.log("[PROFILE DEBUG] Loading full customer history for customerId:", customer.id);
        
        // Execute both major API calls simultaneously
        const [invs, history] = await Promise.all([
          invoiceService.getInvoicesByCustomer(customer.id).catch(e => {
            console.error("Failed to load invoices:", e);
            return [];
          }),
          customerService.loadCustomerHistory(customer.id).catch(async (e) => {
            console.error("Failed to load customer profile history via loadCustomerHistory, running fallbacks:", e);
            try {
              const etList = await eyeTestService.loadEyeTestHistory(customer.id);
              const pList = await prescriptionService.loadPrescriptionHistory(customer.id);
              return { eyeTests: etList, prescriptions: pList };
            } catch (fallbackError) {
              console.error("Profile history fallback loading failed:", fallbackError);
              return { eyeTests: [], prescriptions: [] };
            }
          })
        ]);
        
        setInvoices(invs.sort((a,b) => b.createdAt - a.createdAt));
        
        // Update eye tests and prescriptions with fetched results
        setEyeTests(history.eyeTests || []);
        
        // Map any PascalCase prescriptions to standard objects if needed
        const mappedPrescriptions = (history.prescriptions || []).map((p: any) => {
          return p.PrescriptionID ? mapPascalToStandard(p) : p;
        });
        setPrescriptions(mappedPrescriptions);
        
      } finally {
        setLoadingHistory(false);
      }
    }
    `;

code = code.substring(0, startIdx) + newLoadHistory + code.substring(endIdx);
fs.writeFileSync('components/CustomerProfileView.tsx', code);

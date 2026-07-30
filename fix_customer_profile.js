const fs = require('fs');
let code = fs.readFileSync('components/CustomerProfileView.tsx', 'utf-8');

const oldLoad = `  useEffect(() => {
    async function loadHistory() {
      try {
        const invs = await invoiceService.getInvoicesByCustomer(customer.id);
        setInvoices(invs.sort((a,b) => b.createdAt - a.createdAt));
      } catch (e) {
        console.error("Failed to load invoices:", e);
      }
      try {
        console.log("[PROFILE DEBUG] Loading full customer history for customerId:", customer.id);
        const history = await customerService.loadCustomerHistory(customer.id);
        console.log("[PROFILE DEBUG] Full customer history response:", history);
        
        // Update eye tests and prescriptions with fetched results
        setEyeTests(history.eyeTests || []);
        
        // Map any PascalCase prescriptions to standard objects if needed
        const mappedPrescriptions = (history.prescriptions || []).map((p: any) => {
          return p.PrescriptionID ? mapPascalToStandard(p) : p;
        });
        setPrescriptions(mappedPrescriptions);
      } catch (e) {`;

const newLoad = `  useEffect(() => {
    async function loadHistory() {
      try {
        console.log("[PROFILE DEBUG] Loading full customer history for customerId:", customer.id);
        
        const [invs, history] = await Promise.all([
          invoiceService.getInvoicesByCustomer(customer.id).catch(e => {
            console.error("Failed to load invoices:", e);
            return [];
          }),
          customerService.loadCustomerHistory(customer.id).catch(e => {
            console.error("Failed to load customer profile history via loadCustomerHistory, running fallbacks:", e);
            return { eyeTests: [], prescriptions: [] };
          })
        ]);
        
        setInvoices(invs.sort((a,b) => b.createdAt - a.createdAt));
        
        console.log("[PROFILE DEBUG] Full customer history response:", history);
        
        // Update eye tests and prescriptions with fetched results
        setEyeTests(history.eyeTests || []);
        
        // Map any PascalCase prescriptions to standard objects if needed
        const mappedPrescriptions = (history.prescriptions || []).map((p: any) => {
          return p.PrescriptionID ? mapPascalToStandard(p) : p;
        });
        setPrescriptions(mappedPrescriptions);
        
      } catch (e) {`;

code = code.replace(oldLoad, newLoad);

// We need to also check if the catch block of loadCustomerHistory fallback is still there and correct it, but the fallback catch was for loadCustomerHistory only. 
// Let's just do a regex replace to handle it properly.

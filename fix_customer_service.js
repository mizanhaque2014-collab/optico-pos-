const fs = require('fs');
const path = './lib/services/customerService.ts';
let code = fs.readFileSync(path, 'utf8');

const regex = /async loadCustomerHistory\(customerId: string\): Promise<\{[\s\S]*?\}\> \{[\s\S]*?return \{\s*customer: sanitizeCustomer\(res.customer\),\s*prescriptions: Array.isArray\(res.prescriptions\) \? res.prescriptions.map\(normalizePrescription\) : \[\],\s*eyeTests: Array.isArray\(res.eyeTests\) \? res.eyeTests.map\(normalizeEyeTest\) : \[\],\s*invoices: Array.isArray\(res.invoices\) \? res.invoices.map\(normalizeInvoice\) : \[\],\s*payments: Array.isArray\(res.payments\) \? res.payments : \[\],\s*\};\s*\}\s*\} catch \(e\) \{/m;

const replacement = `async loadCustomerHistory(customerId: string): Promise<{
    customer: Customer | null;
    prescriptions: any[];
    eyeTests: any[];
    invoices: any[];
    payments: any[];
  }> {
    
    // Function to safely merge
    const mergeData = (remote: any[], local: any[], idKey = 'id') => {
       const merged = [...remote];
       local.forEach(lItem => {
         if (!merged.find(rItem => (rItem.id === lItem.id) || (rItem.PrescriptionID === lItem.id) || (rItem.EyeTestID === lItem.id))) {
           merged.push(lItem);
         }
       });
       return merged;
    };

    try {
      const res = await apiCall<any>('loadCustomerHistory', { customerId });
      if (res && res.customer) {
        let localEyeTests: any[] = [];
        if (typeof window !== 'undefined') {
           try {
             const stored = localStorage.getItem('opt_eyetests');
             if (stored) {
               localEyeTests = JSON.parse(stored).filter((e: any) => e.customerId === customerId);
             }
           } catch(e) {}
        }
        
        let localPrescriptions: any[] = [];
        const customers = await this.getCustomers();
        const localCust = customers.find(c => c.id === customerId);
        if (localCust && localCust.prescriptions) {
           localPrescriptions = localCust.prescriptions;
        }
        
        const backendEyeTests = Array.isArray(res.eyeTests) ? res.eyeTests.map(normalizeEyeTest) : [];
        const backendPrescriptions = Array.isArray(res.prescriptions) ? res.prescriptions.map(normalizePrescription) : [];
        
        let localInvoices: any[] = [];
        if (typeof window !== 'undefined') {
          const storedInv = localStorage.getItem('opt_invoices');
          localInvoices = storedInv ? JSON.parse(storedInv).filter((i: any) => i.customerId === customerId) : [];
        }
        const backendInvoices = Array.isArray(res.invoices) ? res.invoices.map(normalizeInvoice) : [];

        return {
          customer: sanitizeCustomer(res.customer),
          prescriptions: mergeData(backendPrescriptions, localPrescriptions).sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0)),
          eyeTests: mergeData(backendEyeTests, localEyeTests).sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0)),
          invoices: mergeData(backendInvoices, localInvoices),
          payments: Array.isArray(res.payments) ? res.payments : [],
        };
      }
    } catch (e) {`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync(path, code);
    console.log("Success");
} else {
    console.log("Failed to match regex");
}

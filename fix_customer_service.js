const fs = require('fs');
const path = './lib/services/customerService.ts';
let code = fs.readFileSync(path, 'utf8');

const regex = /async loadCustomerHistory\(customerId: string\): Promise<\{[\s\S]*?\}\> \{[\s\S]*?return \{\s*customer,\s*prescriptions,\s*eyeTests: eyeTests\.sort[\s\S]*?\}\s*\};\s*\}\};/m;

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
        const backendPrescriptions = Array.isArray(res.prescriptions) ? res.prescriptions.map((p: any) => p) : [];
        
        return {
          customer: sanitizeCustomer(res.customer),
          prescriptions: mergeData(backendPrescriptions, localPrescriptions),
          eyeTests: mergeData(backendEyeTests, localEyeTests).sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0)),
          invoices: Array.isArray(res.invoices) ? res.invoices.map((i: any) => i) : [],
          payments: Array.isArray(res.payments) ? res.payments : [],
        };
      }
    } catch (e) {
      console.warn('loadCustomerHistory API failed, resolving via parallel fallbacks:', e);
    }

    // Fallback: load customer from local memory or sheets
    const customers = await this.getCustomers();
    const customer = customers.find(c => c.id === customerId) || null;

    // Fallback: load prescriptions
    let prescriptions: any[] = [];
    try {
      const res = await apiCall<any>('getPrescriptionsByCustomer', { customerId });
      const data = res?.data || res;
      if (Array.isArray(data)) {
        prescriptions = data;
      }
    } catch (e) {
      console.warn('loadCustomerHistory fallback: getPrescriptionsByCustomer failed:', e);
    }
    const localPrescriptions = customer?.prescriptions || [];
    prescriptions = mergeData(prescriptions, localPrescriptions);

    // Fallback: load eye tests
    let eyeTests: any[] = [];
    try {
      const res = await apiCall<any[]>('loadEyeTests', { customerId });
      if (Array.isArray(res)) {
        eyeTests = res.map(normalizeEyeTest);
      }
    } catch (e) {
      console.warn('loadCustomerHistory fallback: loadEyeTests failed:', e);
    }
    
    if (typeof window !== 'undefined') {
      try {
        const storedEt = localStorage.getItem('opt_eyetests');
        const localEt = storedEt ? JSON.parse(storedEt) : [];
        const customerLocalEt = localEt.filter((et: any) => et.customerId === customerId);
        eyeTests = mergeData(eyeTests, customerLocalEt);
      } catch (err) {
        console.error('Error loading local eye tests:', err);
      }
    }
    
    // Map prescriptions to eye tests if no explicit eye test records exist
    if (eyeTests.length === 0 && prescriptions.length > 0) {
      prescriptions.forEach((p: any) => {
        if (p) {
          const etExists = eyeTests.find((et: any) => et.id === \`et-p-\${p.PrescriptionID || p.id}\`);
          if (!etExists) {
            eyeTests.push({
              id: \`et-p-\${p.PrescriptionID || p.id}\`,
              customerId: customerId,
              eyeTestDate: p.ExamDate || p.eyeTestDate || new Date(Number(p.CreatedDate || p.createdAt || Date.now())).toISOString().split('T')[0],
              optometristName: p.DoctorName || p.optometristName || 'Optometrist',
              sphOd: p.OD_Distance_SPH || p.sphOd || '',
              cylOd: p.OD_Distance_CYL || p.cylOd || '',
              axisOd: p.OD_Distance_AXIS || p.axisOd || '',
              sphOs: p.OS_Distance_SPH || p.sphOs || '',
              cylOs: p.OS_Distance_CYL || p.cylOs || '',
              axisOs: p.OS_Distance_AXIS || p.axisOs || '',
              addPower: p.AddPower || p.addPower || '',
              pdDistance: p.PD_Distance || p.pdDistance || '',
              pdNear: p.PD_Near || p.pdNear || '',
              remarks: p.Remarks || p.remarks || '',
              lensRecommendation: p.Advice || p.lensRecommendation || '',
              createdAt: Number(p.CreatedDate || p.createdAt || Date.now())
            });
          }
        }
      });
    }

    // Fallback: load invoices
    let localInvoices: any[] = [];
    if (typeof window !== 'undefined') {
      const storedInv = localStorage.getItem('opt_invoices');
      localInvoices = storedInv ? JSON.parse(storedInv) : [];
    }
    const customerInvoices = localInvoices.filter((inv: any) => inv.customerId === customerId);

    // Fallback: load payments
    const payments = customerInvoices.map((inv: any) => ({
      id: \`pay-\${inv.id}\`,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      amount: inv.advanceAmount,
      date: inv.createdAt,
      mode: inv.paymentMode,
      detail: inv.paymentDetail,
    })).filter((p: any) => p.amount > 0);

    return {
      customer,
      prescriptions,
      eyeTests: eyeTests.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0)),
      invoices: customerInvoices,
      payments,
    };
  }
};`;

code = code.replace(regex, replacement);
fs.writeFileSync(path, code);

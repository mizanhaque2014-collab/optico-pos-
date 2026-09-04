const fs = require('fs');

async function test() {
  const res = await fetch("https://script.google.com/macros/s/AKfycbwMpyF1V9imrg4yUhnhqaPy6KzKD2ZTzQu918dnnAgSnn49S4PpLFvzRJzbwYO-WM8tNA/exec", {
    method: "POST",
    body: JSON.stringify({ action: "getInvoices" })
  });
  const json = await res.json();
  const sample = json.data.slice(0, 3);
  
  const resolveDate = (val) => {
    if (!val) return 0;
    const n = Number(val);
    if (!isNaN(n) && n > 0) return n;
    
    let strVal = String(val);
    if (strVal.match(/^\d{4}-\d{2}-\d{2}$/)) {
      strVal += "T00:00:00";
    }
    const d = new Date(strVal).getTime();
    return isNaN(d) ? 0 : d;
  };
  
  const norm = sample.map(inv => {
    return {
      id: String(inv.InvoiceID || inv.id || inv.Id || inv.ID || ''),
      companyId: String(inv.companyId || inv.CompanyID || ''),
      branchId: String(inv.branchId || inv.BranchID || ''),
      createdAt: resolveDate(inv.CreatedDate || inv.InvoiceDate || inv.createdAt || inv.CreatedAt),
    };
  });
  console.log(norm);
}
test();

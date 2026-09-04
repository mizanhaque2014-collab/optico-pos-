const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbwMpyF1V9imrg4yUhnhqaPy6KzKD2ZTzQu918dnnAgSnn49S4PpLFvzRJzbwYO-WM8tNA/exec';
async function test() {
  const res = await fetch(DEFAULT_API_URL, {
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

  const norm = sample.map(inv => ({
    rawDate1: inv.CreatedDate,
    rawDate2: inv.InvoiceDate,
    rawDate3: inv.createdAt,
    rawDate4: inv.CreatedAt,
    resolved: resolveDate(inv.CreatedDate || inv.InvoiceDate || inv.createdAt || inv.CreatedAt)
  }));
  console.log(norm);
}
test();

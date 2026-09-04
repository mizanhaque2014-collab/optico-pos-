const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbwMpyF1V9imrg4yUhnhqaPy6KzKD2ZTzQu918dnnAgSnn49S4PpLFvzRJzbwYO-WM8tNA/exec';
async function test() {
  try {
    const res = await fetch(DEFAULT_API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "getInvoices" }),
      headers: { "Content-Type": "text/plain;charset=utf-8" }
    });
    const json = await res.json();
    console.log(json.data.map(i => ({ type: i.InvoiceType, status: i.Status, grandTotal: i.GrandTotal, date: i.CreatedDate })).slice(0,5));
  } catch (e) {
    console.error(e);
  }
}
test();

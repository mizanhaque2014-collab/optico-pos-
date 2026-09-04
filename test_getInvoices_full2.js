const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbwMpyF1V9imrg4yUhnhqaPy6KzKD2ZTzQu918dnnAgSnn49S4PpLFvzRJzbwYO-WM8tNA/exec';
async function test() {
  const res = await fetch(DEFAULT_API_URL, { method: "POST", body: JSON.stringify({ action: "getInvoices" }) });
  const json = await res.json();
  console.log(json.data.map(i => ({ date: i.InvoiceDate, created: i.CreatedDate })).slice(0,5));
}
test();

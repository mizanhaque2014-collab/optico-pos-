const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbwMpyF1V9imrg4yUhnhqaPy6KzKD2ZTzQu918dnnAgSnn49S4PpLFvzRJzbwYO-WM8tNA/exec';
async function test() {
  const res = await fetch(DEFAULT_API_URL, {
    method: "POST",
    body: JSON.stringify({ action: "getInvoices" })
  });
  const json = await res.json();
  console.log("Invoices count:", json.data ? json.data.length : 'undefined');
  if (json.data && json.data.length > 0) {
    console.log("Sample:", JSON.stringify(json.data[0]).substring(0, 200));
  }
}
test();

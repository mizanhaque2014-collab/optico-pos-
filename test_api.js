const fs = require('fs');
async function test() {
  const url = "https://script.google.com/macros/s/AKfycbwMpyF1V9imrg4yUhnhqaPy6KzKD2ZTzQu918dnnAgSnn49S4PpLFvzRJzbwYO-WM8tNA/exec?action=getInvoices";
  const res = await fetch(url, { method: "POST", body: JSON.stringify({ action: "getInvoices" }) });
  const text = await res.text();
  console.log(text.substring(0, 500));
}
test();

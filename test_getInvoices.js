const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbwMpyF1V9imrg4yUhnhqaPy6KzKD2ZTzQu918dnnAgSnn49S4PpLFvzRJzbwYO-WM8tNA/exec';

async function test() {
  try {
    const res = await fetch(DEFAULT_API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "getInvoices" }),
      headers: { "Content-Type": "text/plain;charset=utf-8" }
    });
    const text = await res.text();
    console.log(text.substring(0, 500));
  } catch (e) {
    console.error(e);
  }
}
test();

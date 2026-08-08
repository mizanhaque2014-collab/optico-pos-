async function run() {
  const API_URL = 'https://script.google.com/macros/s/AKfycbwMpyF1V9imrg4yUhnhqaPy6KzKD2ZTzQu918dnnAgSnn49S4PpLFvzRJzbwYO-WM8tNA/exec?action=getUsers';
  const res = await fetch(API_URL, {
    method: 'GET'
  });
  const text = await res.text();
  console.log("RESPONSE:", text.substring(0, 500));
}
run().catch(console.error);

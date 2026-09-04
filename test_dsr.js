const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbwMpyF1V9imrg4yUhnhqaPy6KzKD2ZTzQu918dnnAgSnn49S4PpLFvzRJzbwYO-WM8tNA/exec';
async function test() {
  const res = await fetch(DEFAULT_API_URL, {
    method: "POST",
    body: JSON.stringify({ action: "getDailySalesReport", companyId: "ALL", branchId: "ALL", startDate: "2020-01-01", endDate: "2030-01-01" })
  });
  const text = await res.text();
  console.log("Raw Response:");
  console.log(text.substring(0, 300));
}
test();

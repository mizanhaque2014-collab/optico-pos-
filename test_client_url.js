const url = "https://script.google.com/macros/s/AKfycbyNn9b0CIgLFIjPXJn4MY4dc_4ZqqghLLscQrEvuO_iQSuwY2xiu1i2hQ24tAsbLVyW9g/exec";

async function testApi(action, payload = {}) {
  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({ action, ...payload })
    });
    const text = await res.text();
    console.log(`--- Test ${action} ---`);
    console.log(text.substring(0, 300));
  } catch (e) {
    console.error(`Error testing ${action}:`, e.message);
  }
}

async function run() {
  await testApi("getDailySalesReport", { companyId: "ALL", branchId: "ALL", startDate: "2020-01-01", endDate: "2030-01-01" });
  await testApi("searchCompany", { query: "test" });
  await testApi("getInvoices", {});
}
run();

async function run() {
  const API_URL_2 = 'https://script.google.com/macros/s/AKfycbyNn9b0CIgLFIjPXJn4MY4dc_4ZqqghLLscQrEvuO_iQSuwY2xiu1i2hQ24tAsbLVyW9g/exec';
  
  let res = await fetch(API_URL_2, { method: 'POST', body: JSON.stringify({action: 'getCompanies'}) });
  console.log("URL2 Companies:", (await res.text()).substring(0, 500));
}
run();

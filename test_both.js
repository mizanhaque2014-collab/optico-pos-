async function run() {
  const API_URL_1 = 'https://script.google.com/macros/s/AKfycbwMpyF1V9imrg4yUhnhqaPy6KzKD2ZTzQu918dnnAgSnn49S4PpLFvzRJzbwYO-WM8tNA/exec';
  const API_URL_2 = 'https://script.google.com/macros/s/AKfycbyNn9b0CIgLFIjPXJn4MY4dc_4ZqqghLLscQrEvuO_iQSuwY2xiu1i2hQ24tAsbLVyW9g/exec';
  
  let res = await fetch(API_URL_1, { method: 'POST', body: JSON.stringify({action: 'getUsers'}) });
  console.log("URL1 Users:", (await res.text()).substring(0, 500));
  
  res = await fetch(API_URL_2, { method: 'POST', body: JSON.stringify({action: 'getUsers'}) });
  console.log("URL2 Users:", (await res.text()).substring(0, 500));
}
run();

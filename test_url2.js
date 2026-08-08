async function run() {
  const API_URL = 'https://script.google.com/macros/s/AKfycbyNn9b0CIgLFIjPXJn4MY4dc_4ZqqghLLscQrEvuO_iQSuwY2xiu1i2hQ24tAsbLVyW9g/exec';
  
  const test = async (action) => {
    let res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({action}) });
    console.log(`${action}:`, await res.text());
  };
  
  await test('getUsers');
  await test('getCompanies');
  await test('getBranches');
}
run();

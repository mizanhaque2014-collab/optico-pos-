async function run() {
  const API_URL = 'https://script.google.com/macros/s/AKfycbyNn9b0CIgLFIjPXJn4MY4dc_4ZqqghLLscQrEvuO_iQSuwY2xiu1i2hQ24tAsbLVyW9g/exec';
  const res = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'getUsers' }),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
  });
  const text = await res.text();
  console.log("RESPONSE:", text.substring(0, 500));
}
run();

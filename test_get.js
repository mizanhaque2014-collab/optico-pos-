async function run() {
  const API_URL = 'https://script.google.com/macros/s/AKfycbzQR6mfwz6MRbvFKlK2cVsbahM5cX6e1S2ceonuNodFVY9be61dUsY--cdEDWo2L-NQdw/exec?action=getUsers';
  const res = await fetch(API_URL, {
    method: 'GET'
  });
  const text = await res.text();
  console.log("RESPONSE:", text.substring(0, 500));
}
run().catch(console.error);

async function run() {
  const API_URL = 'https://script.google.com/macros/s/AKfycbzQR6mfwz6MRbvFKlK2cVsbahM5cX6e1S2ceonuNodFVY9be61dUsY--cdEDWo2L-NQdw/exec';
  const res = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'getUsers' })
  });
  const data = await res.json();
  console.log("RESPONSE:", JSON.stringify(data).substring(0, 500));
}
run().catch(console.error);

const API_URL = 'https://script.google.com/macros/s/AKfycbzQR6mfwz6MRbvFKlK2cVsbahM5cX6e1S2ceonuNodFVY9be61dUsY--cdEDWo2L-NQdw/exec';
async function run() {
  const res = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'getUsers' })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();

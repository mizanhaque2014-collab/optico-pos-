const API_URL = 'https://script.google.com/macros/s/AKfycbw279jQdZtQPJEzDFxb1oC59Xn6OALuo6f8Z_I5IGaCsOz5Vu_vuP0HZis1yghgVeRc-g/exec';
async function run() {
  const res = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'getUsers' })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();

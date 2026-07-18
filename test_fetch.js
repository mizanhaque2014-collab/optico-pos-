const fs = require('fs');
async function run() {
  const url = 'https://script.google.com/macros/s/AKfycbw279jQdZtQPJEzDFxb1oC59Xn6OALuo6f8Z_I5IGaCsOz5Vu_vuP0HZis1yghgVeRc-g/exec';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getCustomers' })
  });
  const data = await res.text(); // get text since it's an apps script redirect sometimes
  console.log(data);
}
run();

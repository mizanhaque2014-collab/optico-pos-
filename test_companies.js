const API_URL = 'https://script.google.com/macros/s/AKfycbw279jQdZtQPJEzDFxb1oC59Xn6OALuo6f8Z_I5IGaCsOz5Vu_vuP0HZis1yghgVeRc-g/exec';
async function fetchCompanies() {
  const url = new URL(API_URL);
  url.searchParams.set('action', 'getCompanies');
  const res = await fetch(url.toString(), {
    method: 'POST',
    body: JSON.stringify({ action: 'getCompanies' })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2).substring(0, 1000));
}
fetchCompanies();

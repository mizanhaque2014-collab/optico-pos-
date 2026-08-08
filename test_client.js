async function run() {
  const API_URL = 'https://script.google.com/macros/s/AKfycbwMpyF1V9imrg4yUhnhqaPy6KzKD2ZTzQu918dnnAgSnn49S4PpLFvzRJzbwYO-WM8tNA/exec';
  
  console.log("1. Testing GET getUsers...");
  let res = await fetch(API_URL + "?action=getUsers");
  console.log(await res.text());
  
  console.log("\n2. Testing POST getUsers...");
  res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({action: 'getUsers'}) });
  console.log(await res.text());
  
  console.log("\n3. Testing GET getCompanies...");
  res = await fetch(API_URL + "?action=getCompanies");
  console.log(await res.text());
  
  console.log("\n4. Testing GET getBranches...");
  res = await fetch(API_URL + "?action=getBranches");
  console.log(await res.text());
}
run();

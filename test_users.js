const url = "https://script.google.com/macros/s/AKfycbyNn9b0CIgLFIjPXJn4MY4dc_4ZqqghLLscQrEvuO_iQSuwY2xiu1i2hQ24tAsbLVyW9g/exec";
async function run() {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify({ action: "getUsers" })
  });
  const text = await res.text();
  console.log(text.substring(0, 1500));
}
run();

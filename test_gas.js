fetch("https://script.google.com/macros/s/AKfycbw279jQdZtQPJEzDFxb1oC59Xn6OALuo6f8Z_I5IGaCsOz5Vu_vuP0HZis1yghgVeRc-g/exec", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ action: "saveEyeTest", eyeTestDetails: { customerId: "test", sphOd: "1" } })
})
.then(res => res.text())
.then(console.log)
.catch(console.error);

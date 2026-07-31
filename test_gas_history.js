fetch("https://script.google.com/macros/s/AKfycbw279jQdZtQPJEzDFxb1oC59Xn6OALuo6f8Z_I5IGaCsOz5Vu_vuP0HZis1yghgVeRc-g/exec", {
  method: "POST",
  headers: {
    "Content-Type": "text/plain;charset=utf-8",
  },
  body: JSON.stringify({ action: "loadCustomerHistory", customerId: "test" })
})
.then(res => res.text())
.then(console.log)
.catch(console.error);

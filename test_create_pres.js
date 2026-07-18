const fs = require('fs');
async function run() {
  const url = 'https://script.google.com/macros/s/AKfycbw279jQdZtQPJEzDFxb1oC59Xn6OALuo6f8Z_I5IGaCsOz5Vu_vuP0HZis1yghgVeRc-g/exec';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'createPrescription',
      prescription: {
        CustomerID: 'CUST-1784376019371449',
        CompanyID: 'comp-1',
        BranchID: 'branch-1',
        ExamDate: '2024-01-01',
        DoctorName: 'Dr. Test',
        Source: 'Testing API'
      }
    })
  });
  const data = await res.text();
  console.log("RESPONSE:", data);
}
run();

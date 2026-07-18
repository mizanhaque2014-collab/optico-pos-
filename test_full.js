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
        CompanyID: 'COMP-1',
        BranchID: 'BR-1',
        ExamDate: '2024-01-01',
        DoctorName: 'Dr. Test',
        Complaint: 'Blurry vision',
        Diagnosis: 'Myopia',
        Advice: 'Wear glasses',
        Remarks: 'Test remarks',
        OD_Distance_SPH: '-1.0',
        OD_Distance_CYL: '-0.5',
        OD_Distance_AXIS: '180',
        OS_Distance_SPH: '-1.25',
        OS_Distance_CYL: '-0.75',
        OS_Distance_AXIS: '170',
        PD_Distance: '62',
        AddPower: '+2.00',
        Source: 'API'
      }
    })
  });
  const data = await res.text();
  console.log("RESPONSE:", data);
}
run();

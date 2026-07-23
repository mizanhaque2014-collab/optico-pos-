async function run() {
  const url = 'https://script.google.com/macros/s/AKfycbw279jQdZtQPJEzDFxb1oC59Xn6OALuo6f8Z_I5IGaCsOz5Vu_vuP0HZis1yghgVeRc-g/exec';
  const payload = {
    action: 'createInvoice',
    invoice: {
      CustomerID: '123',
      CompanyID: 'COMP-1',
      BranchID: 'BR-1',
      PrescriptionID: 'P123',
      InvoiceDate: '2023-01-01',
      InvoiceType: 'Direct Sale',
      GrandTotal: 1000,
      Discount: 100,
      FinalAmount: 900,
      Advance: 900,
      Balance: 0,
      PaymentMode: 'Cash',
      CashAmount: 900,
      CardAmount: 0,
      UPIAmount: 0,
      CardReference: '',
      UPIReference: '',
      BillingRemarks: '',
      Status: 'Delivered',
      Items: '[]',
      InvoiceID: 'test-123',
      InvoiceNumber: 'INV-123'
    }
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });
  console.log(await res.text());
}
run();

const fs = require('fs');
let code = fs.readFileSync('Code.gs', 'utf8');

const doPostInjection = `
      case 'createInvoice':
      case 'saveInvoice':
        result = saveInvoice(payload.invoice || payload);
        break;
      case 'updateInvoice':
        result = saveInvoice(payload.invoice || payload);
        break;
      case 'deleteInvoice':
        result = deleteInvoice(payload.invoiceId || payload.InvoiceID || payload.id || e.parameter.invoiceId || e.parameter.id);
        break;
      case 'getInvoices':
        result = getInvoices();
        break;
      case 'getInvoiceById':
        result = getInvoiceById(payload.invoiceId || payload.InvoiceID || payload.id || e.parameter.invoiceId || e.parameter.id);
        break;
      case 'getInvoicesByCustomer':
        result = getInvoicesByCustomer(payload.customerId || payload.CustomerID || e.parameter.customerId);
        break;
      case 'searchInvoices':
        result = searchInvoices(payload.keyword || payload.search || payload.query || e.parameter.keyword || e.parameter.query);
        break;
      case 'getPrescriptionsByCustomer':
        result = getPrescriptionsByCustomer(payload.customerId || payload.CustomerID || e.parameter.customerId);
        break;
      case 'getPrescriptionById':
        result = getPrescriptionById(payload.prescriptionId || payload.PrescriptionID || payload.id || e.parameter.prescriptionId || e.parameter.id);
        break;
      case 'deletePrescription':
        result = deletePrescription(payload.prescriptionId || payload.PrescriptionID || payload.id || e.parameter.prescriptionId || e.parameter.id);
        break;
`;

if (!code.includes("case 'getInvoicesByCustomer':")) {
  code = code.replace("case 'saveInvoiceItem':", doPostInjection + "\n      case 'saveInvoiceItem':");
  fs.writeFileSync('Code.gs', code);
  console.log("Injected cases to doPost");
}

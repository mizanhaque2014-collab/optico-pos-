const fs = require('fs');

let code = fs.readFileSync('lib/services/invoiceService.ts', 'utf8');

const mapperFn = `
function mapInvoiceToPascalCase(invoice: any) {
  return {
    InvoiceID: invoice.id || invoice.InvoiceID,
    InvoiceNumber: invoice.invoiceNumber || invoice.InvoiceNumber,
    InvoiceType: invoice.type || invoice.InvoiceType,
    CustomerID: invoice.customerId || invoice.CustomerID,
    CompanyID: invoice.companyId || invoice.CompanyID || 'COMP-default',
    BranchID: invoice.branchId || invoice.BranchID || 'BR-default',
    PrescriptionID: invoice.prescriptionId || invoice.PrescriptionID || '',
    InvoiceDate: invoice.invoiceDate || (invoice.createdAt ? new Date(invoice.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
    GrandTotal: invoice.grandTotal ?? invoice.GrandTotal ?? 0,
    Discount: invoice.totalDiscount ?? invoice.discount ?? invoice.Discount ?? 0,
    FinalAmount: invoice.grandTotal ?? invoice.finalAmount ?? invoice.FinalAmount ?? 0,
    Advance: invoice.advanceAmount ?? invoice.advance ?? invoice.Advance ?? 0,
    Balance: invoice.balanceAmount ?? invoice.balance ?? invoice.Balance ?? 0,
    PaymentMode: invoice.paymentMode || invoice.PaymentMode || 'Cash',
    CashAmount: invoice.paymentDetail?.cash ?? invoice.cashAmount ?? invoice.CashAmount ?? 0,
    CardAmount: invoice.paymentDetail?.card ?? invoice.cardAmount ?? invoice.CardAmount ?? 0,
    UPIAmount: invoice.paymentDetail?.upi ?? invoice.upiAmount ?? invoice.UPIAmount ?? 0,
    CardReference: invoice.paymentDetail?.cardLast4 ?? invoice.cardReference ?? invoice.CardReference ?? '',
    UPIReference: invoice.paymentDetail?.upiTransactionId ?? invoice.upiReference ?? invoice.UPIReference ?? '',
    BillingRemarks: invoice.paymentDetail?.remarks ?? invoice.billingRemarks ?? invoice.BillingRemarks ?? '',
    Status: invoice.status || invoice.Status || 'Delivered',
    Items: typeof invoice.items === 'string' ? invoice.items : JSON.stringify(invoice.items || invoice.Items || [])
  };
}

function mapPascalCaseToInvoice(data: any): Invoice {
  // Try parsing items
  let parsedItems = [];
  try {
    parsedItems = typeof data.Items === 'string' ? JSON.parse(data.Items) : data.Items;
  } catch (e) {
    parsedItems = [];
  }
  
  return {
    id: data.InvoiceID || data.id,
    invoiceNumber: data.InvoiceNumber || data.invoiceNumber,
    type: data.InvoiceType || data.type,
    customerId: data.CustomerID || data.customerId,
    prescriptionId: data.PrescriptionID || data.prescriptionId,
    items: parsedItems || data.items || [],
    subTotal: data.SubTotal || data.subTotal || 0,
    totalDiscount: data.Discount || data.totalDiscount || 0,
    grandTotal: data.GrandTotal || data.grandTotal || 0,
    paymentMode: data.PaymentMode || data.paymentMode || 'Cash',
    paymentDetail: {
      cash: data.CashAmount || 0,
      upi: data.UPIAmount || 0,
      card: data.CardAmount || 0,
      total: (data.CashAmount || 0) + (data.UPIAmount || 0) + (data.CardAmount || 0),
      cardLast4: data.CardReference || '',
      upiTransactionId: data.UPIReference || '',
      remarks: data.BillingRemarks || ''
    },
    advanceAmount: data.Advance || data.advanceAmount || 0,
    balanceAmount: data.Balance || data.balanceAmount || 0,
    status: data.Status || data.status || 'Delivered',
    createdAt: data.CreatedAt ? new Date(data.CreatedAt).getTime() : Date.now(),
    updatedAt: data.UpdatedAt ? new Date(data.UpdatedAt).getTime() : Date.now(),
  } as Invoice;
}
`;

code = code.replace(/export const invoiceService = \{/, mapperFn + '\nexport const invoiceService = {');

code = code.replace(/async createInvoice\(invoice: Invoice\): Promise<Invoice> \{\n    const data = await apiCall<Invoice>\('createInvoice', \{ invoice \}\);\n    return data \|\| invoice;\n  \},/g, `async createInvoice(invoice: Invoice): Promise<Invoice> {
    const pascalInvoice = mapInvoiceToPascalCase(invoice);
    const data = await apiCall<any>('createInvoice', { invoice: pascalInvoice });
    return data && data.InvoiceID ? mapPascalCaseToInvoice(data) : invoice;
  },`);

code = code.replace(/async updateInvoice\(invoice: Invoice\): Promise<Invoice> \{\n    const data = await apiCall<Invoice>\('updateInvoice', \{ invoice \}\);\n    return data \|\| invoice;\n  \},/g, `async updateInvoice(invoice: Invoice): Promise<Invoice> {
    const pascalInvoice = mapInvoiceToPascalCase(invoice);
    const data = await apiCall<any>('updateInvoice', { invoice: pascalInvoice });
    return data && data.InvoiceID ? mapPascalCaseToInvoice(data) : invoice;
  },`);

code = code.replace(/const data = await apiCall<Invoice\[\]>\('getInvoices'\);\n      if \(Array\.isArray\(data\)\) \{\n        return data;\n      \}/, `const data = await apiCall<any[]>('getInvoices');
      if (Array.isArray(data)) {
        return data.map(mapPascalCaseToInvoice);
      }`);

code = code.replace(/const data = await apiCall<Invoice>\('getInvoiceById', \{ invoiceId \}\);\n      return data;/, `const data = await apiCall<any>('getInvoiceById', { invoiceId });
      return data ? mapPascalCaseToInvoice(data) : null;`);

code = code.replace(/const data = await apiCall<Invoice\[\]>\('getInvoicesByCustomer', \{ customerId \}\);\n      if \(Array\.isArray\(data\)\) \{\n        return data;\n      \}/, `const data = await apiCall<any[]>('getInvoicesByCustomer', { customerId });
      if (Array.isArray(data)) {
        return data.map(mapPascalCaseToInvoice);
      }`);

code = code.replace(/const data = await apiCall<Invoice\[\]>\('searchInvoices', \{ keyword \}\);\n      if \(Array\.isArray\(data\)\) \{\n        return data;\n      \}/, `const data = await apiCall<any[]>('searchInvoices', { keyword });
      if (Array.isArray(data)) {
        return data.map(mapPascalCaseToInvoice);
      }`);

fs.writeFileSync('lib/services/invoiceService.ts', code);

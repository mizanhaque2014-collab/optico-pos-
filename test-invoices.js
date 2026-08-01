import { invoiceService } from './lib/services/invoiceService.js';
console.log(await invoiceService.getInvoices());

const fs = require('fs');

function patchService(file) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes("import { clearCustomerHistoryCache }")) {
    code = code.replace("import { apiCall", "import { clearCustomerHistoryCache } from './customerService';\nimport { apiCall");
  }
  
  // Just clear it blindly for any operation
  code = code.replace(/try\s*\{/g, 'try { if (arguments[0] && arguments[0].customerId) { clearCustomerHistoryCache(arguments[0].customerId); } ');
  fs.writeFileSync(file, code);
}

patchService('./lib/services/invoiceService.ts');
patchService('./lib/services/eyeTestService.ts');
patchService('./lib/services/prescriptionService.ts');

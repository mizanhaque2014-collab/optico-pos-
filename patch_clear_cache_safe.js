const fs = require('fs');

function patchService(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Undo previous patch
  code = code.replace(/if \(arguments\[0\] && arguments\[0\]\.customerId\) \{ clearCustomerHistoryCache\(arguments\[0\]\.customerId\); \} /g, '');
  
  // Clear globally for now since we just want caching to invalidate when ANY save happens
  code = code.replace(/try\s*\{/g, 'try { clearCustomerHistoryCache(); ');
  fs.writeFileSync(file, code);
}

patchService('./lib/services/invoiceService.ts');
patchService('./lib/services/eyeTestService.ts');
patchService('./lib/services/prescriptionService.ts');

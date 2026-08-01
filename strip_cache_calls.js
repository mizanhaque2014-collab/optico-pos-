const fs = require('fs');

function stripCache(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/import \{ clearCustomerHistoryCache \} from '\.\/customerService';\n/g, '');
  code = code.replace(/try\s*\{\s*clearCustomerHistoryCache\(\);\s*/g, 'try {');
  fs.writeFileSync(file, code);
}

stripCache('./lib/services/invoiceService.ts');
stripCache('./lib/services/eyeTestService.ts');
stripCache('./lib/services/prescriptionService.ts');

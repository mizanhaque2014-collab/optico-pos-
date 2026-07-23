const fs = require('fs');
let code = fs.readFileSync('lib/services/invoiceService.ts', 'utf8');

code = code.replace(/const STORAGE_KEY = 'opt_invoices';\n\n/g, '');

code = code.replace(/    if \(typeof window !== 'undefined'\) \{\n      const stored = localStorage\.getItem\(STORAGE_KEY\);\n      const invoices: Invoice\[\] = stored \? JSON\.parse\(stored\) : \[\];\n      invoices\.push\(data \|\| invoice\);\n      localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(invoices\)\);\n    \}\n/g, '');

code = code.replace(/    if \(typeof window !== 'undefined'\) \{\n      const stored = localStorage\.getItem\(STORAGE_KEY\);\n      const invoices: Invoice\[\] = stored \? JSON\.parse\(stored\) : \[\];\n      const idx = invoices\.findIndex\(i => i\.id === invoice\.id\);\n      if \(idx >= 0\) \{\n        invoices\[idx\] = data \|\| invoice;\n      \} else \{\n        invoices\.push\(data \|\| invoice\);\n      \}\n      localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(invoices\)\);\n    \}\n/g, '');

code = code.replace(/    if \(typeof window !== 'undefined'\) \{\n      const stored = localStorage\.getItem\(STORAGE_KEY\);\n      if \(stored\) \{\n        const invoices: Invoice\[\] = JSON\.parse\(stored\);\n        const filtered = invoices\.filter\(i => i\.id !== invoiceId\);\n        localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(filtered\)\);\n      \}\n    \}\n/g, '');

code = code.replace(/      if \(Array\.isArray\(data\)\) \{\n        if \(typeof window !== 'undefined'\) \{\n          localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(data\)\);\n        \}\n        return data;\n      \}\n/g, `      if (Array.isArray(data)) {\n        return data;\n      }\n`);

code = code.replace(/    if \(typeof window !== 'undefined'\) \{\n      const stored = localStorage\.getItem\(STORAGE_KEY\);\n      return stored \? JSON\.parse\(stored\) : \[\];\n    \}\n/g, '');

fs.writeFileSync('lib/services/invoiceService.ts', code);

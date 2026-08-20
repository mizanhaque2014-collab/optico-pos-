const fs = require('fs');
let code = fs.readFileSync('lib/store.ts', 'utf8');

if (!code.includes('clearCache')) {
  code = code.replace(
    /const listeners = new Set<\(\) => void>\(\);/,
    `const listeners = new Set<() => void>();\n\nexport const clearCache = () => {\n  memoryCache.customers = null;\n  memoryCache.invoices = null;\n  memoryCache.stockInventory = null;\n  memoryCache.inventory = null;\n  listeners.forEach(l => l());\n};\n`
  );
  fs.writeFileSync('lib/store.ts', code);
}

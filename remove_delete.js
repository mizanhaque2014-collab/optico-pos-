const fs = require('fs');
let code = fs.readFileSync('/app/applet/lib/store.ts', 'utf8');
code = code.replace(/const deleteInventoryItem = async \(id: string\): Promise<void> => \{[\s\S]*?notify\(\);\n  \};\n/g, '');
code = code.replace(/deleteInventoryItem,/g, '');
fs.writeFileSync('/app/applet/lib/store.ts', code);

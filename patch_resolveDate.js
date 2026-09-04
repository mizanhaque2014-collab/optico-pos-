const fs = require('fs');
let code = fs.readFileSync('lib/dataMapping.ts', 'utf-8');

code = code.replace(
  `const resolveDate = (val: any) => {
    if (!val) return Date.now();
    const n = Number(val);
    if (!isNaN(n)) return n;
    
    let strVal = String(val);
    if (strVal.match(/^\\d{4}-\\d{2}-\\d{2}$/)) {
      strVal += "T00:00:00";
    }
    const d = new Date(strVal).getTime();
    return isNaN(d) ? Date.now() : d;
  };`,
  `const resolveDate = (val: any) => {
    if (!val) return 0; // Return epoch for missing dates instead of Date.now() to prevent false reporting
    const n = Number(val);
    if (!isNaN(n) && n > 0) return n;
    
    let strVal = String(val);
    if (strVal.match(/^\\d{4}-\\d{2}-\\d{2}$/)) {
      strVal += "T00:00:00";
    }
    const d = new Date(strVal).getTime();
    return isNaN(d) ? 0 : d;
  };`
);

fs.writeFileSync('lib/dataMapping.ts', code);
console.log("Patched resolveDate in dataMapping.ts successfully.");

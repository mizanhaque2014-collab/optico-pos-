const fs = require('fs');
let code = fs.readFileSync('lib/dataMapping.ts', 'utf-8');

const target = `  const resolveDate = (val: any) => {
    if (!val) return Date.now();
    const n = Number(val);
    if (!isNaN(n)) return n;
    const d = new Date(val).getTime();
    return isNaN(d) ? Date.now() : d;
  };`;

const replace = `  const resolveDate = (val: any) => {
    if (!val) return Date.now();
    const n = Number(val);
    if (!isNaN(n)) return n;
    
    let strVal = String(val);
    if (strVal.match(/^\\d{4}-\\d{2}-\\d{2}$/)) {
      strVal += "T00:00:00";
    }
    const d = new Date(strVal).getTime();
    return isNaN(d) ? Date.now() : d;
  };`;

if (code.includes(target)) {
  code = code.replace(target, replace);
  fs.writeFileSync('lib/dataMapping.ts', code);
  console.log("Patched resolveDate successfully.");
} else {
  console.log("Target not found.");
}

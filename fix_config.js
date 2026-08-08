const fs = require('fs');
let code = fs.readFileSync('lib/config.ts', 'utf8');

const OLD_URL = 'https://script.google.com/macros/s/AKfycbwMpyF1V9imrg4yUhnhqaPy6KzKD2ZTzQu918dnnAgSnn49S4PpLFvzRJzbwYO-WM8tNA/exec';
const NEW_URL = 'https://script.google.com/macros/s/AKfycbyNn9b0CIgLFIjPXJn4MY4dc_4ZqqghLLscQrEvuO_iQSuwY2xiu1i2hQ24tAsbLVyW9g/exec';

code = code.replace(new RegExp(OLD_URL, 'g'), NEW_URL);

fs.writeFileSync('lib/config.ts', code);

let code2 = fs.readFileSync('app/page.tsx', 'utf8');
code2 = code2.replace(new RegExp(OLD_URL, 'g'), NEW_URL);
fs.writeFileSync('app/page.tsx', code2);


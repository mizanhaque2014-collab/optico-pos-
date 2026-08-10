const fs = require('fs');

const OLD_URL = 'https://script.google.com/macros/s/AKfycbyNn9b0CIgLFIjPXJn4MY4dc_4ZqqghLLscQrEvuO_iQSuwY2xiu1i2hQ24tAsbLVyW9g/exec';
const NEW_URL = 'https://script.google.com/macros/s/AKfycbwMpyF1V9imrg4yUhnhqaPy6KzKD2ZTzQu918dnnAgSnn49S4PpLFvzRJzbwYO-WM8tNA/exec';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(new RegExp(OLD_URL, 'g'), NEW_URL);
  fs.writeFileSync(filePath, content);
}

replaceInFile('lib/config.ts');
replaceInFile('app/page.tsx');

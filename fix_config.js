const fs = require('fs');
let code = fs.readFileSync('lib/config.ts', 'utf8');

code = code.replace(
  "const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbzQR6mfwz6MRbvFKlK2cVsbahM5cX6e1S2ceonuNodFVY9be61dUsY--cdEDWo2L-NQdw/exec';",
  "const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbwMpyF1V9imrg4yUhnhqaPy6KzKD2ZTzQu918dnnAgSnn49S4PpLFvzRJzbwYO-WM8tNA/exec';"
);

fs.writeFileSync('lib/config.ts', code);

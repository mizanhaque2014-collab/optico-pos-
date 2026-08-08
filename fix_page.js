const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

const OLD_URL = 'https://script.google.com/macros/s/AKfycbw279jQdZtQPJEzDFxb1oC59Xn6OALuo6f8Z_I5IGaCsOz5Vu_vuP0HZis1yghgVeRc-g/exec';
const NEW_URL = 'https://script.google.com/macros/s/AKfycbwMpyF1V9imrg4yUhnhqaPy6KzKD2ZTzQu918dnnAgSnn49S4PpLFvzRJzbwYO-WM8tNA/exec';

code = code.replace(new RegExp(OLD_URL, 'g'), NEW_URL);

fs.writeFileSync('app/page.tsx', code);

const fs = require('fs');
const babel = require('@babel/core');
try {
  babel.transformSync(fs.readFileSync('components/DailySalesReportView.tsx', 'utf8'), {
    presets: ['@babel/preset-react', '@babel/preset-typescript'],
    filename: 'components/DailySalesReportView.tsx'
  });
  console.log("SUCCESS");
} catch(e) {
  console.log(e.message);
}

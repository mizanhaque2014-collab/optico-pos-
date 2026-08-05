const fs = require('fs');
const path = './components/InvoiceFormView.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldFn = /const addInventoryItemToInvoice = \(p: any\) => \{[\s\S]*?setStockQuery\(''\); \/\/ Clear search\s*\};/m;

const newFn = `const addInventoryItemToInvoice = (p: any) => {
    let itemType = 'manual';
    if (p.category === 'Optical Frame' || p.category === 'Sunglass' || p.category === 'Reading Glass') itemType = 'frame';
    else if (p.category === 'Optical Lenses') itemType = 'lens';

    const newItem = {
      id: crypto.randomUUID(),
      itemType: itemType,
      productType: (p.category || 'Other'),
      brand: p.brand || '',
      modelNumber: p.modelNumber || '',
      lensBrand: itemType === 'lens' ? p.brand : undefined,
      lensCategory: itemType === 'lens' ? p.category : undefined,
      itemName: itemType === 'manual' ? \`\${p.brand} \${p.modelNumber}\` : undefined,
      color: p.color || '',
      barcode: p.barcode || '', // The requested field
      quantity: 1,
      sellingPrice: p.sellingPrice || 0,
      discount: 0,
      finalAmount: p.sellingPrice || 0
    };
    handleAddItem(newItem as any);
    setStockQuery(''); // Clear search
  };`;

code = code.replace(oldFn, newFn);
fs.writeFileSync(path, code);

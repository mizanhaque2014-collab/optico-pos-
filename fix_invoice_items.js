const fs = require('fs');
const path = './components/InvoiceFormView.tsx';
let code = fs.readFileSync(path, 'utf8');

// Insert handleUpdateItem and addInventoryItemToInvoice after handleRemoveItem
const handleRemoveRegex = /const handleRemoveItem = \(id: string\) => \{\s*setItems\(items\.filter\(i => i\.id !== id\)\);\s*\};/m;
const addFns = `const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleUpdateItem = (id: string, field: 'quantity' | 'discount', value: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.finalAmount = (updated.sellingPrice * updated.quantity) - (updated.discount || 0);
        return updated;
      }
      return item;
    }));
  };

  const addInventoryItemToInvoice = (p: any) => {
    const newItem = {
      id: crypto.randomUUID(),
      itemType: 'frame', // Assume frame by default from inventory, or we can map based on category
      productType: (p.category === 'Optical Lenses' ? 'Other' : p.category) as any,
      brand: p.brand,
      modelNumber: p.modelNumber,
      color: p.color || '',
      quantity: 1,
      sellingPrice: p.sellingPrice || 0,
      discount: 0,
      finalAmount: p.sellingPrice || 0
    };
    handleAddItem(newItem as any);
    setStockQuery(''); // Clear search
  };`;

code = code.replace(handleRemoveRegex, addFns);

// Update table rows to allow editing quantity and discount
const qtyCellRegex = /<td className="px-4 py-3 text-center text-white\/80 font-bold">\{item\.quantity\}<\/td>/m;
const qtyCellReplacement = `<td className="px-4 py-3 text-center text-white/80 font-bold">
  <input 
    type="number" 
    value={item.quantity} 
    onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
    className="w-16 bg-black/35 border border-white/10 rounded px-2 py-1 text-xs text-center text-white focus:outline-none focus:border-cyan-500" 
    min="1"
  />
</td>`;
code = code.replace(qtyCellRegex, qtyCellReplacement);

const discCellRegex = /<td className="px-4 py-3 text-right text-rose-400 font-bold">\{item\.discount > 0 \? `-₹\$\{item\.discount\}` : '-'\}<\/td>/m;
const discCellReplacement = `<td className="px-4 py-3 text-right text-rose-400 font-bold">
  <input 
    type="number" 
    value={item.discount} 
    onChange={(e) => handleUpdateItem(item.id, 'discount', Number(e.target.value))}
    className="w-16 bg-black/35 border border-white/10 rounded px-2 py-1 text-xs text-right text-white focus:outline-none focus:border-cyan-500"
    min="0"
  />
</td>`;
code = code.replace(discCellRegex, discCellReplacement);

// Make inventory search result clickable
const inventoryRowRegex = /<div key=\{p\.id\} className="flex items-center justify-between py-2\.5 text-xs">/g;
const inventoryRowReplacement = `<div key={p.id} className="flex items-center justify-between py-2.5 text-xs hover:bg-white/5 cursor-pointer transition-colors px-2 rounded-lg" onClick={() => p.quantity > 0 && addInventoryItemToInvoice(p)}>`;
code = code.replace(inventoryRowRegex, inventoryRowReplacement);

fs.writeFileSync(path, code);
console.log("Success");

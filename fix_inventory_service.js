const fs = require('fs');
const path = './lib/services/inventoryService.ts';
let code = fs.readFileSync(path, 'utf8');

const regex = /async saveInventoryItem\(item: StockItem\): Promise<void> \{[\s\S]*?try \{[\s\S]*?await apiCall\('saveInventory', \{ inventoryItem: item \}\);/m;

const replacement = `async saveInventoryItem(item: StockItem): Promise<void> {
    const payloadItem = {
      ...item,
      StockID: item.id,
      InventoryID: item.id,
      Model: item.modelNumber
    };
    try {
      await apiCall('saveInventory', { inventoryItem: payloadItem });`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync(path, code);
    console.log("Success");
} else {
    console.log("Failed to match regex");
}

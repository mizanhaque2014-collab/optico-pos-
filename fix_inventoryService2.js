const fs = require('fs');
const path = './lib/services/inventoryService.ts';
let code = fs.readFileSync(path, 'utf8');

// Update saveInventoryItem to include BranchID and Quantity
const saveRegex = /async saveInventoryItem\(item: StockItem\): Promise<void> \{[\s\S]*?try \{/m;
const saveReplacement = `async saveInventoryItem(item: StockItem): Promise<void> {
    const payloadItem = {
      ...item,
      StockID: item.id,
      InventoryID: item.id,
      Model: item.modelNumber,
      BranchID: item.branch,
      Quantity: item.quantity
    };
    try {`;

if (code.match(saveRegex)) {
    code = code.replace(saveRegex, saveReplacement);
}

// Update getInventory to merge with local data
const getRegex = /async getInventory\(\): Promise<StockItem\[\]> \{[\s\S]*?try \{[\s\S]*?const data = await apiCall<any\[\]>\('getInventory'\);[\s\S]*?if \(Array\.isArray\(data\)\) \{[\s\S]*?const normalized = data\.map\(normalizeStockItem\);[\s\S]*?if \(typeof window !== 'undefined'\) \{[\s\S]*?localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(normalized\)\);[\s\S]*?\}[\s\S]*?return normalized;[\s\S]*?\}[\s\S]*?\} catch \(e\) \{[\s\S]*?console\.warn\('getInventory API failed, loading from local cache:', e\);[\s\S]*?\}[\s\S]*?if \(typeof window !== 'undefined'\) \{[\s\S]*?const stored = localStorage\.getItem\(STORAGE_KEY\);[\s\S]*?return stored \? JSON\.parse\(stored\)\.map\(normalizeStockItem\) : \[\];[\s\S]*?\}[\s\S]*?return \[\];[\s\S]*?\}/m;

const getReplacement = `async getInventory(): Promise<StockItem[]> {
    let localStock: StockItem[] = [];
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) localStock = JSON.parse(stored).map(normalizeStockItem);
    }

    try {
      const data = await apiCall<any[]>('getInventory');
      if (Array.isArray(data)) {
        const normalized = data.map(item => {
          const norm = normalizeStockItem(item);
          // Merge missing fields from local cache if backend dropped them (e.g. missing sheet columns)
          const localItem = localStock.find(l => l.id === norm.id);
          if (localItem) {
             if (norm.quantity === 0 && localItem.quantity > 0) norm.quantity = localItem.quantity;
             if (!norm.branch && localItem.branch) norm.branch = localItem.branch;
          }
          return norm;
        });
        
        // Also include any items that are ONLY in local storage (in case backend sync is lagging or failed)
        localStock.forEach(localItem => {
          if (!normalized.find(n => n.id === localItem.id)) {
            normalized.push(localItem);
          }
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        }
        return normalized;
      }
    } catch (e) {
      console.warn('getInventory API failed, loading from local cache:', e);
    }
    
    return localStock;
  }`;

if (code.match(getRegex)) {
    code = code.replace(getRegex, getReplacement);
}

fs.writeFileSync(path, code);
console.log("Success");

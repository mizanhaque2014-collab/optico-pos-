import { apiCall } from '../apiClient';
import { StockItem } from '../types';

const STORAGE_KEY = 'opt_stock_inventory';

export const inventoryService = {
  async saveInventoryItem(item: StockItem): Promise<void> {
    try {
      await apiCall('saveInventory', { inventoryItem: item });
    } catch (e) {
      console.warn('saveInventory API failed, falling back to local:', e);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      const stock: StockItem[] = stored ? JSON.parse(stored) : [];
      const idx = stock.findIndex(s => s.id === item.id);
      if (idx >= 0) {
        stock[idx] = item;
      } else {
        stock.push(item);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stock));
    }
  },

  async updateInventoryItem(item: StockItem): Promise<void> {
    return this.saveInventoryItem(item);
  },

  async getInventory(): Promise<StockItem[]> {
    try {
      const data = await apiCall<StockItem[]>('getInventory');
      if (Array.isArray(data)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        return data;
      }
    } catch (e) {
      console.warn('getInventory API failed, loading from local cache:', e);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  },

  async searchInventory(query: string): Promise<StockItem[]> {
    const list = await this.getInventory();
    const q = query.toLowerCase().trim();
    if (!q) return list;
    return list.filter(item => 
      item.brand.toLowerCase().includes(q) || 
      item.modelNumber.toLowerCase().includes(q) ||
      item.barcode.includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  },

  async findByBarcode(barcode: string): Promise<StockItem | null> {
    const list = await this.getInventory();
    return list.find(item => item.barcode === barcode) || null;
  },

  async findByModel(modelNumber: string): Promise<StockItem[]> {
    const list = await this.getInventory();
    return list.filter(item => item.modelNumber.toLowerCase().includes(modelNumber.toLowerCase()));
  },

  async findByBrand(brand: string): Promise<StockItem[]> {
    const list = await this.getInventory();
    return list.filter(item => item.brand.toLowerCase().includes(brand.toLowerCase()));
  }
};

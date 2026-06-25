'use client';

import { Customer, Invoice, InventoryItem, StockItem, StockAdjustment, BranchTransfer, OrderItem } from './types';
import { customerService } from './services/customerService';
import { prescriptionService } from './services/prescriptionService';
import { eyeTestService } from './services/eyeTestService';
import { invoiceService } from './services/invoiceService';
import { invoiceItemService } from './services/invoiceItemService';
import { salesOrderService } from './services/salesOrderService';
import { deliveryCollectionService } from './services/deliveryCollectionService';
import { inventoryService } from './services/inventoryService';
import { paymentService } from './services/paymentService';
import { userService } from './services/userService';
import { branchService } from './services/branchService';

// Helper to handle localStorage safely
const getLocalData = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const setLocalData = <T>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, value, error);
  }
};

const defaultStockItems: StockItem[] = [
  {
    id: 's-1',
    category: 'Frames',
    brand: 'Ray-Ban',
    modelNumber: 'RB-5154',
    barcode: '8053672195822',
    purchasePrice: 4200,
    sellingPrice: 7500,
    quantity: 15,
    supplierName: 'Luxottica India',
    purchaseDate: '2026-06-01',
    remarks: 'Premium Acetate Clubmaster',
    branch: 'Main Branch',
    createdAt: 1782024000000
  },
  {
    id: 's-2',
    category: 'Sunglasses',
    brand: 'Oakley',
    modelNumber: 'OO-9013',
    barcode: '721205166299',
    purchasePrice: 5100,
    sellingPrice: 8900,
    quantity: 2,
    supplierName: 'Luxottica India',
    purchaseDate: '2026-06-10',
    remarks: 'Frogskins classic fit - low stock',
    branch: 'Main Branch',
    createdAt: 1782024000000
  },
  {
    id: 's-3',
    category: 'Optical Lenses',
    brand: 'Essilor',
    modelNumber: 'Crizal Alize SV',
    barcode: 'ES-SV-091',
    purchasePrice: 800,
    sellingPrice: 1800,
    quantity: 50,
    supplierName: 'Essilor India',
    purchaseDate: '2026-05-15',
    remarks: 'High quality AR coating',
    branch: 'Main Branch',
    lensType: 'Single Vision',
    createdAt: 1782024000000
  },
  {
    id: 's-4',
    category: 'Optical Lenses',
    brand: 'Zeiss',
    modelNumber: 'DuraVision Prog',
    barcode: 'ZE-PR-112',
    purchasePrice: 3500,
    sellingPrice: 7000,
    quantity: 0,
    supplierName: 'Carl Zeiss Vision',
    purchaseDate: '2026-06-05',
    remarks: 'Out of Stock progressive trial',
    branch: 'Main Branch',
    lensType: 'Progressive',
    createdAt: 1782024000000
  },
  {
    id: 's-5',
    category: 'Contact Lenses',
    brand: 'Acuvue',
    modelNumber: 'Moist 1-Day',
    barcode: 'AC-MO-021',
    purchasePrice: 1100,
    sellingPrice: 1950,
    quantity: 24,
    supplierName: 'Johnson & Johnson',
    purchaseDate: '2026-06-11',
    remarks: 'Daily disposable bulk pack',
    branch: 'City Center Branch',
    createdAt: 1782024000000
  },
  {
    id: 's-6',
    category: 'Accessories',
    brand: 'Bellwood',
    modelNumber: 'BW-CASE-01',
    barcode: 'BW-CS-401',
    purchasePrice: 90,
    sellingPrice: 250,
    quantity: 40,
    supplierName: 'Local Supplier',
    purchaseDate: '2026-06-01',
    remarks: 'Hard shell magnetic case',
    branch: 'Metro Mall Branch',
    createdAt: 1782024000000
  },
  {
    id: 's-7',
    category: 'Eye Drops',
    brand: 'Systane',
    modelNumber: 'Ultra 10ml',
    barcode: 'SYST-ULT-10',
    purchasePrice: 220,
    sellingPrice: 380,
    quantity: 30,
    supplierName: 'Alcon Laboratories',
    purchaseDate: '2026-06-12',
    remarks: 'Dry eye relief drops',
    branch: 'Main Branch',
    createdAt: 1782024000000
  },
  {
    id: 's-8',
    category: 'Cleaning Solutions',
    brand: 'Zeiss',
    modelNumber: 'Wipes x50',
    barcode: 'ZE-WP-50',
    purchasePrice: 150,
    sellingPrice: 320,
    quantity: 18,
    supplierName: 'Carl Zeiss Vision',
    purchaseDate: '2026-06-05',
    remarks: 'Individually wrapped pre-moistened wipes',
    branch: 'City Center Branch',
    createdAt: 1782024000000
  }
];

export const useStore = () => {
  const getCustomers = () => {
    // Background sync to ensure offline-first hydration
    customerService.getCustomers().catch(() => {});
    return getLocalData<Customer[]>('opt_customers', []);
  };

  const saveCustomer = (customer: Customer) => {
    // 1. Immediate saving in local cache
    const customers = getLocalData<Customer[]>('opt_customers', []);
    const existingIndex = customers.findIndex(c => c.id === customer.id);
    if (existingIndex >= 0) {
      customers[existingIndex] = customer;
    } else {
      customers.push(customer);
    }
    setLocalData('opt_customers', customers);

    // 2. Propagate saving to Sheets API with precise audit logging tracing
    customerService.saveCustomer(customer).catch((err) => {
      console.error("Failed to propagate save to Google Sheets:", err);
    });
  };

  const getInvoices = () => {
    invoiceService.getInvoices().catch(() => {});
    return getLocalData<Invoice[]>('opt_invoices', []);
  };
  
  // Custom inventory managers
  const getStockInventory = () => {
    inventoryService.getInventory().catch(() => {});
    const data = getLocalData<StockItem[]>('opt_stock_inventory', []);
    if (data.length === 0) {
      setLocalData('opt_stock_inventory', defaultStockItems);
      return defaultStockItems;
    }
    return data;
  };

  const saveStockItem = (item: StockItem) => {
    const stock = getStockInventory();
    const existingIndex = stock.findIndex(s => s.id === item.id);
    if (existingIndex >= 0) {
      stock[existingIndex] = item;
    } else {
      stock.push(item);
    }
    setLocalData('opt_stock_inventory', stock);
    inventoryService.saveInventoryItem(item).catch(() => {});
  };

  const saveStockItemsBulk = (items: StockItem[]) => {
    const stock = getStockInventory();
    items.forEach(item => {
      const existingIndex = stock.findIndex(s => s.id === item.id);
      if (existingIndex >= 0) {
        stock[existingIndex] = item;
      } else {
        stock.push(item);
      }
      inventoryService.saveInventoryItem(item).catch(() => {});
    });
    setLocalData('opt_stock_inventory', stock);
  };

  const getStockAdjustments = () => getLocalData<StockAdjustment[]>('opt_stock_adjustments', []);
  
  const saveStockAdjustment = (adj: StockAdjustment) => {
    const adjustments = getStockAdjustments();
    adjustments.push(adj);
    setLocalData('opt_stock_adjustments', adjustments);

    // Apply change to stock quantity
    const stock = getStockInventory();
    const itemIndex = stock.findIndex(s => s.id === adj.productId);
    if (itemIndex >= 0) {
      if (adj.type === 'Add') {
        stock[itemIndex].quantity += adj.quantity;
      } else {
        stock[itemIndex].quantity = Math.max(0, stock[itemIndex].quantity - adj.quantity);
      }
      setLocalData('opt_stock_inventory', stock);
    }
  };

  const getBranchTransfers = () => getLocalData<BranchTransfer[]>('opt_branch_transfers', []);

  const saveBranchTransfer = (transfer: BranchTransfer) => {
    const transfers = getBranchTransfers();
    transfers.push(transfer);
    setLocalData('opt_branch_transfers', transfers);

    // Apply the transfer in stock inventory
    const stock = getStockInventory();
    const sourceIndex = stock.findIndex(s => s.id === transfer.productId);
    if (sourceIndex >= 0) {
      const sourceItem = stock[sourceIndex];
      // Subtract from source
      sourceItem.quantity = Math.max(0, sourceItem.quantity - transfer.quantity);

      // Check if the destination branch already has this product model
      const destIndex = stock.findIndex(s => 
        s.branch === transfer.toBranch && 
        s.brand.toLowerCase() === sourceItem.brand.toLowerCase() && 
        s.modelNumber.toLowerCase() === sourceItem.modelNumber.toLowerCase() &&
        s.category === sourceItem.category
      );

      if (destIndex >= 0) {
        stock[destIndex].quantity += transfer.quantity;
      } else {
        // Create duplicate item in destination branch
        const newItem: StockItem = {
          ...sourceItem,
          id: `s-trans-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          quantity: transfer.quantity,
          branch: transfer.toBranch,
          createdAt: Date.now()
        };
        stock.push(newItem);
      }
      setLocalData('opt_stock_inventory', stock);
    }
  };

  // Reduce stock based on items in an invoice (called when status is Delivered)
  const reduceStockForInvoice = (invoice: Invoice) => {
    const reducedInvoiceIds = getLocalData<string[]>('opt_reduced_invoice_ids', []);
    if (reducedInvoiceIds.includes(invoice.id)) {
      // Already reduced, avoid duplicate reductions
      return;
    }

    const stock = getStockInventory();
    let updated = false;

    invoice.items.forEach((item: OrderItem) => {
      // Find matching item in stock
      // We can compare brand/model or barcode
      const searchBrand = item.brand || '';
      const searchModel = item.modelNumber || '';

      // Let's run a check: search by exact barcode or match brand + model
      const matchedIndex = stock.findIndex(s => {
        // First try barcode if somehow present on item description/details, or frame model match
        if (searchBrand && searchModel) {
          return s.brand.toLowerCase() === searchBrand.toLowerCase() && 
                 s.modelNumber.toLowerCase() === searchModel.toLowerCase() &&
                 s.quantity > 0;
        }
        // Fallback for custom or lens category
        if (item.itemType === 'lens' && item.lensCategory) {
          return s.category === 'Optical Lenses' && 
                 s.lensType === item.lensCategory &&
                 s.quantity > 0;
        }
        return false;
      });

      if (matchedIndex >= 0) {
        stock[matchedIndex].quantity = Math.max(0, stock[matchedIndex].quantity - item.quantity);
        updated = true;
      } else {
        // Broad search: first one where brand matches and quantity > 0
        const genericIndex = stock.findIndex(s => {
          if (searchBrand) {
            return s.brand.toLowerCase() === searchBrand.toLowerCase() && s.quantity > 0;
          }
          return false;
        });
        if (genericIndex >= 0) {
          stock[genericIndex].quantity = Math.max(0, stock[genericIndex].quantity - item.quantity);
          updated = true;
        }
      }
    });

    if (updated) {
      setLocalData('opt_stock_inventory', stock);
    }

    // Keep track of which invoices have reduced stock
    reducedInvoiceIds.push(invoice.id);
    setLocalData('opt_reduced_invoice_ids', reducedInvoiceIds);
  };

  const saveInvoice = (invoice: Invoice) => {
    const invoices = getInvoices();
    const existingIndex = invoices.findIndex(i => i.id === invoice.id);
    if (existingIndex >= 0) {
      invoices[existingIndex] = invoice;
    } else {
      invoices.push(invoice);
    }
    setLocalData('opt_invoices', invoices);

    // If direct sale or completed delivered sales order, reduce stock!
    if (invoice.status === 'Delivered') {
      reduceStockForInvoice(invoice);
    }

    // Sync to Sheets
    invoiceService.saveInvoice(invoice).catch(() => {});
  };

  const getInventory = () => {
    inventoryService.getInventory().catch(() => {});
    return getLocalData<InventoryItem[]>('opt_inventory', []);
  };

  const saveInventoryItem = (item: InventoryItem) => {
    const inv = getInventory();
    const existingIndex = inv.findIndex(i => i.id === item.id);
    if (existingIndex >= 0) {
      inv[existingIndex] = item;
    } else {
      inv.push(item);
    }
    setLocalData('opt_inventory', inv);

    // Sync to Sheets
    const stockItem: StockItem = {
      id: item.id,
      category: item.itemType === 'frame' ? 'Frames' : 'Optical Lenses',
      brand: item.brand,
      modelNumber: item.modelNumber,
      barcode: item.id, // fallback or id
      purchasePrice: item.price * 0.6, // estimate cost margin as 60% of sale
      sellingPrice: item.price,
      quantity: item.stock,
      supplierName: 'System Inventory Supplier',
      purchaseDate: new Date().toISOString().slice(0, 10),
      remarks: 'Sync main inventory item',
      branch: 'Main Branch',
      createdAt: Date.now()
    };
    inventoryService.saveInventoryItem(stockItem).catch(() => {});
  };

  const generateInvoiceNumber = () => {
    const invoices = getInvoices();
    const prefix = 'INV-';
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const todayInvoices = invoices.filter(i => i.invoiceNumber.includes(dateStr));
    const nextNum = (todayInvoices.length + 1).toString().padStart(3, '0');
    return `${prefix}${dateStr}-${nextNum}`;
  };

  return {
    getCustomers,
    saveCustomer,
    getInvoices,
    saveInvoice,
    getInventory,
    saveInventoryItem,
    generateInvoiceNumber,
    getStockInventory,
    saveStockItem,
    saveStockItemsBulk,
    getStockAdjustments,
    saveStockAdjustment,
    getBranchTransfers,
    saveBranchTransfer,
    reduceStockForInvoice
  };
};

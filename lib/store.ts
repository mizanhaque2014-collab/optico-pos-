import { useState, useEffect } from 'react';
import { Customer, Invoice, StockItem, StockAdjustment, BranchTransfer, InventoryItem } from './types';
import { customerService } from './services/customerService';
import { invoiceService } from './services/invoiceService';
import { inventoryService } from './services/inventoryService';

const memoryCache = {
  customers: null as Customer[] | null,
  invoices: null as Invoice[] | null,
  stockInventory: null as StockItem[] | null,
  inventory: null as InventoryItem[] | null,
  stockAdjustments: [] as StockAdjustment[],
  branchTransfers: [] as BranchTransfer[]
};

const listeners = new Set<() => void>();

export const useStore = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const trigger = () => setTick(t => t + 1);
    listeners.add(trigger);
    return () => { listeners.delete(trigger); };
  }, []);

  const notify = () => listeners.forEach(l => l());

  const getCustomers = (): Customer[] => {
    if (!memoryCache.customers) {
      memoryCache.customers = [];
      customerService.getCustomers().then(data => {
        memoryCache.customers = data;
        notify();
      }).catch(() => {});
    }
    return memoryCache.customers;
  };

  const saveCustomer = async (customer: Customer): Promise<Customer> => {
    const saved = await customerService.saveCustomer(customer);
    memoryCache.customers = await customerService.getCustomers();
    notify();
    return saved;
  };

  const getInvoices = (): Invoice[] => {
    if (!memoryCache.invoices) {
      memoryCache.invoices = [];
      invoiceService.getInvoices().then(data => {
        memoryCache.invoices = data;
        notify();
      }).catch(() => {});
    }
    return memoryCache.invoices;
  };

  const saveInvoice = async (invoice: Invoice): Promise<void> => {
    await invoiceService.saveInvoice(invoice);
    memoryCache.invoices = await invoiceService.getInvoices();
    notify();
  };

  const getStockInventory = (): StockItem[] => {
    if (!memoryCache.stockInventory) {
      memoryCache.stockInventory = [];
      inventoryService.getInventory().then(data => {
        memoryCache.stockInventory = data as any;
        notify();
      }).catch(() => {});
    }
    return memoryCache.stockInventory;
  };

  const saveStockItem = async (item: StockItem): Promise<void> => {
    await inventoryService.saveInventoryItem(item as any);
    memoryCache.stockInventory = (await inventoryService.getInventory()) as any;
    notify();
  };

  const getStockAdjustments = (): StockAdjustment[] => {
    return memoryCache.stockAdjustments;
  };

  const saveStockAdjustment = async (adj: StockAdjustment): Promise<void> => {
    memoryCache.stockAdjustments.push(adj);
    notify();
  };

  const getBranchTransfers = (): BranchTransfer[] => {
    return memoryCache.branchTransfers;
  };

  const saveBranchTransfer = async (transfer: BranchTransfer): Promise<void> => {
    memoryCache.branchTransfers.push(transfer);
    notify();
  };

  const reduceStockForInvoice = async (invoice: Invoice): Promise<void> => {
    // This should ideally call an API, but for now we just keep the signature
  };

  const getInventory = (): InventoryItem[] => {
    if (!memoryCache.inventory) {
      memoryCache.inventory = [];
      inventoryService.getInventory().then(data => {
        memoryCache.inventory = data as any;
        notify();
      }).catch(() => {});
    }
    return memoryCache.inventory;
  };

  const saveInventoryItem = async (item: InventoryItem): Promise<void> => {
    await inventoryService.saveInventoryItem(item as any);
    memoryCache.inventory = await inventoryService.getInventory() as any;
    notify();
  };

  
  const saveStockItemsBulk = async (items: StockItem[]): Promise<void> => {
    for (const item of items) {
      await saveStockItem(item);
    }
  };

  const generateInvoiceNumber = (): string => {
    return `INV-${Date.now()}`;
  };

  return {
    getCustomers,
    saveCustomer,
    getInvoices,
    saveInvoice,
    getStockInventory,
    saveStockItem,
    saveStockItemsBulk,
    getStockAdjustments,
    saveStockAdjustment,
    getBranchTransfers,
    saveBranchTransfer,
    reduceStockForInvoice,
    getInventory,
    saveInventoryItem,
    
    generateInvoiceNumber
  };
};

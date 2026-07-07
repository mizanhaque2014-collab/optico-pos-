const fs = require('fs');

const code = `
import { Customer, Invoice, StockItem, StockAdjustment, BranchTransfer, InventoryItem } from './types';
import { customerService } from './services/customerService';
import { invoiceService } from './services/invoiceService';
import { inventoryService } from './services/inventoryService';

export const useStore = () => {
  const getCustomers = async (): Promise<Customer[]> => {
    return await customerService.getCustomers();
  };

  const saveCustomer = async (customer: Customer): Promise<void> => {
    await customerService.saveCustomer(customer);
  };

  const getInvoices = async (): Promise<Invoice[]> => {
    return await invoiceService.getInvoices();
  };

  const saveInvoice = async (invoice: Invoice): Promise<void> => {
    await invoiceService.saveInvoice(invoice);
  };

  const getStockInventory = async (): Promise<StockItem[]> => {
    return await inventoryService.getInventory() as any; // Map if needed
  };

  const saveStockItem = async (item: StockItem): Promise<void> => {
    await inventoryService.saveInventoryItem(item as any);
  };

  const getStockAdjustments = async (): Promise<StockAdjustment[]> => {
    return []; // Fetch from service if it exists
  };

  const saveStockAdjustment = async (adj: StockAdjustment): Promise<void> => {
    // Save adjustment
  };

  const getBranchTransfers = async (): Promise<BranchTransfer[]> => {
    return [];
  };

  const saveBranchTransfer = async (transfer: BranchTransfer): Promise<void> => {
    // Save transfer
  };

  const reduceStockForInvoice = async (invoice: Invoice): Promise<void> => {
    // Implement stock reduction via backend
  };

  const getInventory = async (): Promise<InventoryItem[]> => {
    return await inventoryService.getInventory();
  };

  const saveInventoryItem = async (item: InventoryItem): Promise<void> => {
    await inventoryService.saveInventoryItem(item);
  };

  const deleteInventoryItem = async (id: string): Promise<void> => {
    await inventoryService.deleteInventoryItem(id);
  };

  const generateInvoiceNumber = (): string => {
    return \`INV-\${Date.now()}\`;
  };

  return {
    getCustomers,
    saveCustomer,
    getInvoices,
    saveInvoice,
    getStockInventory,
    saveStockItem,
    getStockAdjustments,
    saveStockAdjustment,
    getBranchTransfers,
    saveBranchTransfer,
    reduceStockForInvoice,
    getInventory,
    saveInventoryItem,
    deleteInventoryItem,
    generateInvoiceNumber
  };
};
`;

fs.writeFileSync('/app/applet/lib/store.ts', code);

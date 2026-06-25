'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { 
  StockItem, 
  StockCategory, 
  LensType, 
  StockAdjustment, 
  StockAdjustmentReason,
  BranchTransfer 
} from '@/lib/types';
import { 
  ArrowLeft, Search, PlusCircle, MinusCircle, ArrowRightLeft, 
  FileSpreadsheet, ClipboardList, Package, Info, Upload, AlertTriangle, 
  CheckCircle2, Download, RefreshCw, Barcode, ShieldAlert, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onBack: () => void;
}

const BRANCHES = ['Main Branch', 'City Center Branch', 'Metro Mall Branch'];

const CATEGORY_ICONS: Record<StockCategory, string> = {
  'Frames': '👓',
  'Sunglasses': '🕶',
  'Optical Lenses': '🔍',
  'Contact Lenses': '👁',
  'Accessories': '📦',
  'Eye Drops': '💧',
  'Cleaning Solutions': '🧪',
  'Other Products': '✨'
};

export function StockInventoryView({ onBack }: Props) {
  const store = useStore();
  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'adjustments' | 'transfers' | 'imports'>('dashboard');
  
  // Selection/filter states
  const [selectedBranch, setSelectedBranch] = useState<string>('Main Branch');
  const [selectedCategory, setSelectedCategory] = useState<StockCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Real-time stock data from our custom store
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [transfers, setTransfers] = useState<BranchTransfer[]>([]);
  
  // Create / Form states
  const [bulkExcelText, setBulkExcelText] = useState<string>('');
  const [bulkImportSuccess, setBulkImportSuccess] = useState<string | null>(null);
  
  // Manual product state
  const [newProduct, setNewProduct] = useState({
    category: 'Frames' as StockCategory,
    brand: '',
    modelNumber: '',
    barcode: '',
    purchasePrice: 0,
    sellingPrice: 0,
    quantity: 1,
    supplierName: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    remarks: '',
    lensType: 'Single Vision' as LensType
  });
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Barcode entry simulation
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [barcodeScanMode, setBarcodeScanMode] = useState<boolean>(false);

  // Adjustment form state
  const [selectedAdjProduct, setSelectedAdjProduct] = useState<string>('');
  const [adjType, setAdjType] = useState<'Add' | 'Remove'>('Add');
  const [adjQuantity, setAdjQuantity] = useState<number>(1);
  const [adjReason, setAdjReason] = useState<StockAdjustmentReason>('Purchase');
  const [adjRemarks, setAdjRemarks] = useState<string>('');
  const [adjSuccess, setAdjSuccess] = useState<string | null>(null);

  // Transfer form state
  const [selectedTransferProduct, setSelectedTransferProduct] = useState<string>('');
  const [transferToBranch, setTransferToBranch] = useState<string>('City Center Branch');
  const [transferQty, setTransferQty] = useState<number>(1);
  const [transferReason, setTransferReason] = useState<string>('');
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  // Load state on mount/action
  const loadData = () => {
    if (typeof window !== 'undefined') {
      setStockItems(store.getStockInventory());
      setAdjustments(store.getStockAdjustments());
      setTransfers(store.getBranchTransfers());
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtered Stock Items for active branch, category, and search query
  const filteredStock = useMemo(() => {
    return stockItems.filter(item => {
      const matchBranch = !selectedBranch || item.branch === selectedBranch;
      const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
      
      const q = searchQuery.toLowerCase();
      const matchQuery = !searchQuery || 
        item.brand.toLowerCase().includes(q) ||
        item.modelNumber.toLowerCase().includes(q) ||
        item.barcode.includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.lensType && item.lensType.toLowerCase().includes(q));

      return matchBranch && matchCategory && matchQuery;
    });
  }, [stockItems, selectedBranch, selectedCategory, searchQuery]);

  // Statistics summaries
  const stats = useMemo(() => {
    const branchStock = stockItems.filter(i => !selectedBranch || i.branch === selectedBranch);
    
    // Total Unique Products
    const uniqueProducts = branchStock.length;
    
    // Total Stock Quantity
    const totalQuantity = branchStock.reduce((acc, curr) => acc + curr.quantity, 0);

    // Total Stock Valuation (Purchase value & Sale value)
    const totalValuation = branchStock.reduce((acc, curr) => acc + (curr.purchasePrice * curr.quantity), 0);
    const saleValuation = branchStock.reduce((acc, curr) => acc + (curr.sellingPrice * curr.quantity), 0);

    // Count low stock (<3 but >0) and out of stock (0)
    const lowStockCount = branchStock.filter(i => i.quantity > 0 && i.quantity <= 3).length;
    const outOfStockCount = branchStock.filter(i => i.quantity === 0).length;

    // Categories Breakdown
    const categoriesCount = branchStock.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.quantity;
      return acc;
    }, {} as Record<StockCategory, number>);

    return {
      uniqueProducts,
      totalQuantity,
      totalValuation,
      saleValuation,
      lowStockCount,
      outOfStockCount,
      categoriesCount
    };
  }, [stockItems, selectedBranch]);

  // Lens Inventory Breakdown
  const lensInventoryBreakdown = useMemo(() => {
    const branchStock = stockItems.filter(i => (!selectedBranch || i.branch === selectedBranch) && i.category === 'Optical Lenses');
    const lookup: Record<string, number> = {
      'Single Vision': 0,
      'Bifocal': 0,
      'Progressive': 0,
      'Blue Cut': 0,
      'Photochromic': 0,
      'Anti Glare': 0,
      'High Index': 0,
      'Other': 0
    };
    
    branchStock.forEach(item => {
      const type = item.lensType || 'Other';
      lookup[type] = (lookup[type] || 0) + item.quantity;
    });

    return lookup;
  }, [stockItems, selectedBranch]);

  // Helper function to return availability style and label
  const getAvailability = (quantity: number) => {
    if (quantity === 0) {
      return { label: 'Out Of Stock', color: 'text-red-400 bg-red-950/40 border border-red-900/50', dot: '🔴' };
    }
    if (quantity <= 3) {
      return { label: 'Low Stock', color: 'text-amber-400 bg-amber-950/40 border border-amber-900/50', dot: '🟡' };
    }
    return { label: 'In Stock', color: 'text-emerald-400 bg-emerald-950/40 border border-emerald-900/50', dot: '🟢' };
  };

  // 1. Save Manual Entry
  const handleSaveManualProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.brand || !newProduct.modelNumber) {
      alert('Brand and Model Number are required.');
      return;
    }

    const itemToAdd: StockItem = {
      id: `s-${Date.now()}`,
      category: newProduct.category,
      brand: newProduct.brand,
      modelNumber: newProduct.modelNumber,
      barcode: newProduct.barcode || `BC-${Date.now().toString().slice(-6)}`,
      purchasePrice: Number(newProduct.purchasePrice) || 0,
      sellingPrice: Number(newProduct.sellingPrice) || 0,
      quantity: Number(newProduct.quantity) || 0,
      supplierName: newProduct.supplierName || 'Self',
      purchaseDate: newProduct.purchaseDate,
      remarks: newProduct.remarks,
      branch: selectedBranch,
      createdAt: Date.now()
    };

    if (newProduct.category === 'Optical Lenses') {
      itemToAdd.lensType = newProduct.lensType;
    }

    store.saveStockItem(itemToAdd);
    setFormSuccess(`Successfully saved manual product "${newProduct.brand} ${newProduct.modelNumber}" to stock.`);
    
    // Reset product input
    setNewProduct({
      category: 'Frames',
      brand: '',
      modelNumber: '',
      barcode: '',
      purchasePrice: 0,
      sellingPrice: 0,
      quantity: 1,
      supplierName: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      remarks: '',
      lensType: 'Single Vision'
    });
    setBarcodeInput('');
    setBarcodeScanMode(false);
    
    loadData();
    setTimeout(() => setFormSuccess(null), 4000);
  };

  // 2. Barcode Simulator Scan
  const handleBarcodeScanSimulated = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput) return;

    // Check if barcode already exists inside active stock (optional prefill)
    const existing = stockItems.find(item => item.barcode === barcodeInput);
    
    if (existing) {
      setNewProduct({
        category: existing.category,
        brand: existing.brand,
        modelNumber: existing.modelNumber,
        barcode: existing.barcode,
        purchasePrice: existing.purchasePrice,
        sellingPrice: existing.sellingPrice,
        quantity: 1, // default quantity to add
        supplierName: existing.supplierName,
        purchaseDate: new Date().toISOString().split('T')[0],
        remarks: `Barcode match found. Adding new batch.`,
        lensType: existing.lensType || 'Single Vision'
      });
      setBarcodeScanMode(true);
    } else {
      // New Barcode
      setNewProduct({
        category: 'Frames',
        brand: '',
        modelNumber: '',
        barcode: barcodeInput,
        purchasePrice: 0,
        sellingPrice: 0,
        quantity: 1,
        supplierName: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        remarks: 'New products via Barcode Scanner',
        lensType: 'Single Vision'
      });
      setBarcodeScanMode(true);
    }
    setActiveTab('imports'); // direct to tools tab containing the form
  };

  // 3. Excel TSV Bulk Import
  const handleExcelImport = () => {
    if (!bulkExcelText.trim()) {
      alert('Please paste some rows from your Excel sheet.');
      return;
    }

    const rows = bulkExcelText.split('\n');
    let importedCount = 0;
    const importedItems: StockItem[] = [];

    // Simple TSV parser
    rows.forEach((row, idx) => {
      if (idx === 0) return; // skip header
      const cols = row.split('\t');
      if (cols.length >= 4) {
        const category = (cols[0] || 'Frames').trim() as StockCategory;
        const brand = (cols[1] || 'Unknown').trim();
        const modelNumber = (cols[2] || 'Generic').trim();
        const barcode = (cols[3] || `BC-EX-${Date.now()}-${idx}`).trim();
        const purchasePrice = Number(cols[4]) || 400;
        const sellingPrice = Number(cols[5]) || 900;
        const quantity = Number(cols[6]) || 5;
        const supplierName = (cols[7] || 'Excel Import').trim();
        const remarks = (cols[8] || 'Bulk excel upload').trim();

        importedItems.push({
          id: `s-ex-${idx}-${Date.now()}`,
          category,
          brand,
          modelNumber,
          barcode,
          purchasePrice,
          sellingPrice,
          quantity,
          supplierName,
          purchaseDate: new Date().toISOString().split('T')[0],
          remarks,
          branch: selectedBranch,
          createdAt: Date.now()
        });
        importedCount++;
      }
    });

    if (importedItems.length > 0) {
      store.saveStockItemsBulk(importedItems);
      setBulkImportSuccess(`Success! Uploaded ${importedCount} items securely into local inventory.`);
      setBulkExcelText('');
      loadData();
      setTimeout(() => setBulkImportSuccess(null), 5000);
    } else {
      alert('Error reading Excel headers. Ensure data matches the sample format separated by tabs.');
    }
  };

  const loadSampleExcelTemplate = (type: string) => {
    let tsv = '';
    if (type === 'general') {
      tsv = "Category\tBrand\tModel Number\tBarcode\tPurchase Price\tSelling Price\tQuantity\tSupplier\tRemarks\n" +
            "Frames\tPrada\tPR-11XS\t8056597142\t6200\t11500\t8\tLuxottica India\tElegant Women Fit\n" +
            "Sunglasses\tCarrera\tCA-5001\t7627532349\t2600\t4800\t12\tSafilo Group\tRetro style aviator\n" +
            "Contact Lenses\tBausch & Lomb\tSofLens 59\tBL-SF-59\t650\t1200\t15\tBausch Health\tMonthly disposables\n" +
            "Accessories\tMicrofiber\tCloth Blue x100\tMC-BL-100\t8\t50\t100\tLocal Dist\tMicrofine glass wipes";
    }
    setBulkExcelText(tsv);
  };

  // 4. Admin Stock Adjustments
  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdjProduct) {
      alert('Please select a stock product to adjust.');
      return;
    }

    const product = stockItems.find(s => s.id === selectedAdjProduct);
    if (!product) return;

    if (adjType === 'Remove' && product.quantity < adjQuantity) {
      alert(`Cannot remove more items than existing stock. Current stock is ${product.quantity}.`);
      return;
    }

    const adjustmentRecord: StockAdjustment = {
      id: `adj-${Date.now()}`,
      productId: selectedAdjProduct,
      type: adjType,
      quantity: adjQuantity,
      reason: adjReason,
      date: Date.now(),
      remarks: adjRemarks || `Admin manual adjustment`,
      adjustedBy: 'ADMIN'
    };

    store.saveStockAdjustment(adjustmentRecord);
    setAdjSuccess(`Stock adjustment saved successfully. Product count updated.`);
    
    // Reset adjustment fields
    setSelectedAdjProduct('');
    setAdjQuantity(1);
    setAdjRemarks('');
    
    loadData();
    setTimeout(() => setAdjSuccess(null), 4000);
  };

  // 5. Admin Branch Transfers
  const handleSaveTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransferProduct) {
      alert('Please select a product to transfer.');
      return;
    }

    if (selectedBranch === transferToBranch) {
      alert('Source and destination branches must stay distinct.');
      return;
    }

    const product = stockItems.find(s => s.id === selectedTransferProduct);
    if (!product) return;

    if (product.quantity < transferQty) {
      alert(`Cannot transfer ${transferQty} items! Only ${product.quantity} units available at ${selectedBranch}.`);
      return;
    }

    const transferRecord: BranchTransfer = {
      id: `trans-${Date.now()}`,
      productId: selectedTransferProduct,
      brand: product.brand,
      modelNumber: product.modelNumber,
      barcode: product.barcode,
      category: product.category,
      quantity: transferQty,
      fromBranch: selectedBranch,
      toBranch: transferToBranch,
      reason: transferReason || 'Inventory re-balance',
      date: Date.now(),
      transferredBy: 'ADMIN'
    };

    store.saveBranchTransfer(transferRecord);
    setTransferSuccess(`Transferred ${transferQty} units of ${product.brand} to ${transferToBranch} successfully.`);
    
    setSelectedTransferProduct('');
    setTransferQty(1);
    setTransferReason('');

    loadData();
    setTimeout(() => setTransferSuccess(null), 4000);
  };

  // CSV Exporter
  const handleExportCSV = (reportType: 'current' | 'low' | 'out' | 'adjustments' | 'transfers') => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `optical-stock-report-${Date.now()}.csv`;

    const branchItems = stockItems.filter(i => !selectedBranch || i.branch === selectedBranch);

    if (reportType === 'current') {
      filename = `stock-current-${selectedBranch.replace(/ /g, '_')}.csv`;
      headers = ['Category', 'Brand', 'Model Number', 'Barcode', 'Purchase Price', 'Selling Price', 'Quantity', 'Valuation (Purchase)', 'Supplier', 'Remarks', 'Branch'];
      rows = branchItems.map(i => [
        i.category,
        i.brand,
        i.modelNumber,
        i.barcode,
        i.purchasePrice.toString(),
        i.sellingPrice.toString(),
        i.quantity.toString(),
        (i.purchasePrice * i.quantity).toString(),
        i.supplierName,
        i.remarks.replace(/,/g, ';'),
        i.branch
      ]);
    } else if (reportType === 'low') {
      filename = `low-stock-report-${selectedBranch.replace(/ /g, '_')}.csv`;
      headers = ['Category', 'Brand', 'Model Number', 'Barcode', 'Quantity', 'Selling Price', 'Branch'];
      rows = branchItems
        .filter(i => i.quantity > 0 && i.quantity <= 3)
        .map(i => [i.category, i.brand, i.modelNumber, i.barcode, i.quantity.toString(), i.sellingPrice.toString(), i.branch]);
    } else if (reportType === 'out') {
      filename = `out-of-stock-report-${selectedBranch.replace(/ /g, '_')}.csv`;
      headers = ['Category', 'Brand', 'Model Number', 'Barcode', 'Branch'];
      rows = branchItems
        .filter(i => i.quantity === 0)
        .map(i => [i.category, i.brand, i.modelNumber, i.barcode, i.branch]);
    } else if (reportType === 'adjustments') {
      filename = `stock-adjustments-history.csv`;
      headers = ['Date', 'Product ID', 'Type', 'Quantity', 'Reason', 'Admin Notes', 'Adjusted By'];
      rows = adjustments.map(a => {
        const prod = stockItems.find(p => p.id === a.productId);
        const name = prod ? `${prod.brand} ${prod.modelNumber}` : 'Unknown Product';
        return [
          new Date(a.date).toLocaleDateString(),
          name,
          a.type,
          a.quantity.toString(),
          a.reason,
          a.remarks.replace(/,/g, ';'),
          a.adjustedBy
        ];
      });
    } else if (reportType === 'transfers') {
      filename = `branch-transfers-history.csv`;
      headers = ['Date', 'Category', 'Product', 'Barcode', 'Qty', 'From Branch', 'To Branch', 'Reason', 'By'];
      rows = transfers.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.category,
        `${t.brand} ${t.modelNumber}`,
        t.barcode,
        t.quantity.toString(),
        t.fromBranch,
        t.toBranch,
        t.reason.replace(/,/g, ';'),
        t.transferredBy
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6" id="stock-inventory-panel">
      {/* 🚀 Sticky Subheader Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between p-4 bg-[#0F172A] rounded-2xl border border-white/5 backdrop-blur-sm shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-full transition-colors border border-white/10"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📦</span>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Stock Inventory Management</h2>
            </div>
            <p className="text-[10px] text-white/50 tracking-wider font-bold uppercase mt-0.5">
              Secure Audit-safe Optical Ledger
            </p>
          </div>
        </div>

        {/* Filters and Admin Toggle */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Branch Selector */}
          <div>
            <label className="text-[9px] text-white/40 block font-bold mb-1 uppercase tracking-wider">Active Location</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-white/5 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 shadow-sm"
            >
              {BRANCHES.map(b => (
                <option key={b} value={b} className="bg-[#0F172A] text-white">{b}</option>
              ))}
            </select>
          </div>

          {/* Role selector */}
          <div>
            <label className="text-[9px] text-white/40 block font-bold mb-1 uppercase tracking-wider">Permitted Role</label>
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              className={`text-xs font-black px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all duration-200 uppercase tracking-widest ${
                isAdmin 
                  ? 'bg-red-950/40 text-red-400 border-red-500/50' 
                  : 'bg-[#1E293B] text-slate-400 border-white/5'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span>{isAdmin ? '🛡️ ADMIN USER' : '👨‍💼 SALES STAFF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 📊 SUMMARY CARDS / STATISTICS METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 backdrop-blur-sm">
          <p className="text-[9px] uppercase tracking-wider text-white/40 font-bold mb-1">Unique Items</p>
          <p className="text-2xl font-black text-cyan-400 font-mono">{stats.uniqueProducts}</p>
        </div>
        <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 backdrop-blur-sm">
          <p className="text-[9px] uppercase tracking-wider text-white/40 font-bold mb-1">Total Stock units</p>
          <p className="text-2xl font-black text-emerald-400 font-mono">{stats.totalQuantity}</p>
        </div>
        <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 backdrop-blur-sm">
          <p className="text-[9px] uppercase tracking-wider text-white/40 font-bold mb-1">Stock Valuation</p>
          <p className="text-lg font-black text-indigo-300 font-mono">₹{stats.totalValuation.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-4 bg-amber-950/20 rounded-xl border border-amber-900/30 backdrop-blur-sm flex justify-between items-center">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-amber-400/60 font-bold mb-1">⚠️ Low Stock Alert</p>
            <p className="text-2xl font-black text-amber-400 font-mono">{stats.lowStockCount}</p>
          </div>
          {stats.lowStockCount > 0 && (
            <button 
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setActiveTab('products'); }}
              className="text-[9px] font-black text-amber-400 underline hover:no-underline cursor-pointer"
            >
              VIEW
            </button>
          )}
        </div>
        <div className="p-4 bg-red-950/20 rounded-xl border border-red-900/30 backdrop-blur-sm flex justify-between items-center">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-red-400/60 font-bold mb-1">🚨 Out Of Stock</p>
            <p className="text-2xl font-black text-red-500 font-mono">{stats.outOfStockCount}</p>
          </div>
          {stats.outOfStockCount > 0 && (
            <button 
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setActiveTab('products'); }}
              className="text-[9px] font-black text-red-400 underline hover:no-underline cursor-pointer"
            >
              RESTOCK
            </button>
          )}
        </div>
      </div>

      {/* 🗂 VIEW TAB SYSTEM CONTROL PANEL */}
      <div className="flex border-b border-white/10 gap-1 overflow-x-auto shrink-0 pb-1">
        {[
          { id: 'dashboard', label: '📊 SUMMARY CARD WHEEL', icon: <Layers size={14} /> },
          { id: 'products', label: '🔎 ADVANCED PRODUCT DIRECTORY', icon: <Search size={14} /> },
          { id: 'adjustments', label: '➕ Adjust Stock', icon: <PlusCircle size={14} />, adminOnly: true },
          { id: 'transfers3', label: '🚚 BRANCH TRANSFERS', icon: <ArrowRightLeft size={14} />, adminOnly: true, customId: 'transfers' },
          { id: 'imports', label: '🔌 IMPORT & SCAN TOOLS', icon: <Upload size={14} /> },
        ].map((tab) => {
          const tabId = (tab.customId || tab.id) as any;
          if (tab.adminOnly && !isAdmin) return null;
          return (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-t-lg border-t-2 transition-all duration-150 ${
                activeTab === tabId
                  ? 'bg-slate-900 text-cyan-400 border-cyan-500 font-bold'
                  : 'text-white/60 hover:text-white border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 🚀 MAIN INTERACTIVE DISPLAY VIEW SLOTS */}
      <div className="flex-1 min-h-[450px]">
        
        {/* TAB 1: SUMMARY CARD WHEEL DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Product Categories Shelf</h3>
                <p className="text-xs text-white/50">Click any card below to launch full directory results.</p>
              </div>

              {/* Quick Barcode Scanner simulation on Dashboard */}
              <form onSubmit={handleBarcodeScanSimulated} className="flex items-center gap-2 bg-[#0F172A] p-1.5 rounded-lg border border-white/10 w-full md:w-auto">
                <Barcode size={18} className="text-cyan-400 ml-2 animate-pulse" />
                <input
                  type="text"
                  placeholder="Simulate Barcode Scan..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-white focus:outline-none placeholder-white/20 w-44"
                />
                <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-[#020617] text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
                  SCAN
                </button>
              </form>
            </div>

            {/* Grid of the 8 Stock Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(Object.keys(CATEGORY_ICONS) as StockCategory[]).map((cat) => {
                const stockQty = stats.categoriesCount[cat] || 0;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setActiveTab('products');
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all duration-200 group relative flex flex-col justify-between shadow-md ${
                      isSelected 
                        ? 'bg-cyan-950/40 border-cyan-500' 
                        : 'bg-slate-900/40 border-white/5 hover:border-cyan-500/50 hover:bg-slate-800/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-3xl filter drop-shadow-md transform group-hover:scale-110 transition-transform">{CATEGORY_ICONS[cat]}</span>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-slate-800 border border-white/5 text-slate-400 group-hover:border-cyan-500/20">
                        OPEN
                      </span>
                    </div>
                    <div className="mt-6">
                      <h4 className="text-sm font-black text-white uppercase group-hover:text-cyan-400 transition-colors tracking-tight">{cat}</h4>
                      <div className="flex items-baseline gap-1 mt-1 font-mono">
                        <span className="text-xl font-bold text-cyan-400">{stockQty}</span>
                        <span className="text-[9px] text-white/30 uppercase font-black uppercase">Units In Stock</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* SPECIAL SECTION: LENS INVENTORY TRACKING */}
            <div className="bg-[#0F172A] border border-white/5 p-5 rounded-2xl shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🔍</span>
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Lens Specialty Inventory Monitor</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
                {Object.entries(lensInventoryBreakdown).map(([lens, qty]) => {
                  const hasStock = qty > 0;
                  return (
                    <div key={lens} className="p-3 rounded-xl bg-[#020617] border border-white/5 flex flex-col justify-center">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider truncate" title={lens}>{lens}</p>
                      <p className={`text-lg font-black font-mono mt-1 ${hasStock ? 'text-cyan-400' : 'text-slate-600'}`}>{qty}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick action shortcuts */}
            <div className="p-4 bg-[#1E293B]/40 rounded-xl border border-white/5 flex items-center justify-between text-xs text-white/60">
              <div className="flex items-center gap-2">
                <Info size={14} className="text-cyan-400" />
                <span>To scan barcode item, type in simulate bar at top right and hit Enter or SCAN!</span>
              </div>
              {isAdmin && (
                <div className="flex items-center gap-3">
                  <button onClick={() => handleExportCSV('low')} className="text-amber-400 font-bold hover:underline">Low Stock Report (CSV)</button>
                  <span className="text-white/20">|</span>
                  <button onClick={() => handleExportCSV('out')} className="text-red-400 font-bold hover:underline">Out of Stock Report (CSV)</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ADVANCED PRODUCT DIRECTORY WITH SECURE LOCK */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            
            {/* Quick search and categories filter row */}
            <div className="flex flex-col lg:flex-row gap-3 items-center justify-between bg-[#0F172A] p-3 rounded-xl border border-white/5 shadow-inner">
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                {/* Category Button Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="bg-white/5 border border-white/10 text-xs font-bold text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500"
                >
                  <option value="All" className="bg-[#0F172A]">All Shelf Categories</option>
                  {Object.keys(CATEGORY_ICONS).map(c => (
                    <option key={c} value={c} className="bg-[#0F172A]">{c}</option>
                  ))}
                </select>

                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest pl-2">
                  Showing {filteredStock.length} Products
                </p>
              </div>

              {/* Instant Search Bar */}
              <div className="relative w-full lg:w-80">
                <Search size={14} className="absolute left-3 top-2.5 text-white/30" />
                <input
                  type="text"
                  placeholder="Instant barcode, brand, model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/25 focus:outline-none focus:border-cyan-500 font-bold transition-all"
                />
              </div>
            </div>

            {/* Secure Lock Alert Banner */}
            <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-950 flex items-center gap-3 text-xs text-indigo-300">
              <ShieldAlert size={18} className="text-indigo-400 shrink-0" />
              <div>
                <strong>🚨 Audit Security Guard Active:</strong> Stock deletion or manual line edits are permanently <strong className="underline">Disabled</strong> for safety. All inventory additions/reductions must go through the dedicated Adjustments or Transfers tabs below!
              </div>
            </div>

            {/* DIRECT DIRECTORY LIST */}
            <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#0F172A] shadow-md">
              <table className="w-full border-collapse text-left text-xs text-white">
                <thead>
                  <tr className="bg-slate-900 border-b border-white/10 text-[10px] text-white/40 uppercase tracking-wider font-extrabold">
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Brand</th>
                    <th className="px-4 py-3">Model Number</th>
                    <th className="px-4 py-3">Barcode</th>
                    <th className="px-4 py-3 text-right">Selling Price</th>
                    {isAdmin && <th className="px-4 py-3 text-right">Purchase Price</th>}
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3">Branch Location</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {filteredStock.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-white/40">
                        <Package size={32} className="mx-auto text-white/10 mb-2" />
                        No matching stock found at {selectedBranch}. Choose any filter or simulated barcodes to begin.
                      </td>
                    </tr>
                  ) : (
                    filteredStock.map((item) => {
                      const avail = getAvailability(item.quantity);
                      return (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 uppercase tracking-tight font-black flex items-center gap-1.5 text-slate-300">
                            <span>{CATEGORY_ICONS[item.category]}</span>
                            <span>{item.category}</span>
                            {item.lensType && (
                              <span className="text-[8px] bg-cyan-900/30 text-cyan-400 px-1 border border-cyan-800/40 rounded">
                                {item.lensType}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-white font-bold">{item.brand}</td>
                          <td className="px-4 py-3 font-mono text-cyan-200">{item.modelNumber}</td>
                          <td className="px-4 py-3 font-mono text-slate-400">{item.barcode}</td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-400">₹{item.sellingPrice}</td>
                          {isAdmin && <td className="px-4 py-3 text-right text-indigo-300">₹{item.purchasePrice}</td>}
                          <td className="px-4 py-3 text-center font-bold font-mono text-lg">{item.quantity}</td>
                          <td className="px-4 py-3 text-white/70 italic text-[11px]">{item.branch}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider select-none ${avail.color}`}>
                              {avail.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex gap-1.5 justify-center">
                              {/* Audit safe dummy edit */}
                              <button 
                                disabled
                                className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/20 border border-white/5 cursor-not-allowed select-none"
                                title="No direct edits allowed. Go to Adjustments to correct quantities."
                              >
                                ❌ EDIT
                              </button>
                              <button 
                                disabled
                                className="px-2 py-0.5 rounded text-[10px] bg-red-950/20 text-red-500/20 border border-red-950/30 cursor-not-allowed select-none"
                                title="No direct deletion allowed. Go to Adjustments with correction type."
                              >
                                ❌ DELETE
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Quick Export tools for inventory directory */}
            {isAdmin && (
              <div className="flex flex-wrap gap-2 justify-end pt-2">
                <button
                  onClick={() => handleExportCSV('current')}
                  className="flex items-center gap-1.5 bg-slate-900 border border-white/10 text-xs font-bold text-cyan-400 px-3 py-1.5 rounded-lg hover:border-cyan-500 hover:text-white"
                >
                  <Download size={14} />
                  <span>EXPORT CURRENT STOCK</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ADMIN ADJUSTMENTS PANEL */}
        {activeTab === 'adjustments' && isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form */}
            <div className="p-5 rounded-2xl bg-[#0F172A] border border-white/5 flex flex-col justify-between">
              <form onSubmit={handleSaveAdjustment} className="space-y-4">
                <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2">
                  <PlusCircle className="text-cyan-400" size={18} />
                  <h4 className="text-xs font-black uppercase text-white tracking-widest">Adjust Product Quantity</h4>
                </div>

                {adjSuccess && (
                  <div className="p-3 bg-emerald-950/20 text-emerald-400 text-xs border border-emerald-900/40 rounded-lg flex items-center gap-2 font-black">
                    <CheckCircle2 size={14} />
                    <span>{adjSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="text-[9px] font-black uppercase text-white/40 block mb-1">Select Product to Adjust</label>
                  <select
                    value={selectedAdjProduct}
                    onChange={(e) => setSelectedAdjProduct(e.target.value)}
                    className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-white/10 font-bold focus:outline-none focus:border-cyan-500"
                    required
                  >
                    <option value="">-- Choose Stock Item --</option>
                    {stockItems.map(s => (
                      <option key={s.id} value={s.id} className="bg-slate-900 text-xs">
                        [{s.branch}] {s.brand} {s.modelNumber} ({s.category}) - Qty: {s.quantity}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-white/40 block mb-1">Adjustment Type</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAdjType('Add')}
                        className={`flex-1 text-center py-2 text-xs font-black rounded-lg border flex items-center justify-center gap-1.5 transition-colors uppercase ${
                          adjType === 'Add' 
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/50' 
                            : 'bg-white/5 text-slate-400 border-transparent'
                        }`}
                      >
                        <PlusCircle size={14} />
                        <span>Add Stock</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdjType('Remove')}
                        className={`flex-1 text-center py-2 text-xs font-black rounded-lg border flex items-center justify-center gap-1.5 transition-colors uppercase ${
                          adjType === 'Remove' 
                            ? 'bg-red-950/40 text-red-400 border-red-500/50' 
                            : 'bg-white/5 text-slate-400 border-transparent'
                        }`}
                      >
                        <MinusCircle size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase text-white/40 block mb-1">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={adjQuantity === 0 ? '' : adjQuantity}
                      onChange={(e) => setAdjQuantity(e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full bg-slate-900 text-white font-mono text-center text-sm px-3 py-2 rounded-lg border border-white/10 font-bold focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-white/40 block mb-1">Adjustment Reason (Required)</label>
                  <select
                    value={adjReason}
                    onChange={(e) => setAdjReason(e.target.value as StockAdjustmentReason)}
                    className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-white/10 font-bold focus:outline-none focus:border-cyan-500"
                    required
                  >
                    <option value="Purchase">Purchase (Restock)</option>
                    <option value="Damage">Damage (Wasted/Scratched)</option>
                    <option value="Return">Return (Customer Return)</option>
                    <option value="Transfer">Transfer (Internal Move)</option>
                    <option value="Correction">Correction (Registry Correction)</option>
                    <option value="Lost Item">Lost Item (Audit Loss)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-white/40 block mb-1">Remarks &amp; Audit Notes</label>
                  <textarea
                    placeholder="Provide reason detail, bill number, reference details..."
                    value={adjRemarks}
                    onChange={(e) => setAdjRemarks(e.target.value)}
                    className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-white/10 h-20 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-cyan-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  SAVE ADJUSTMENT RECORD
                </button>
              </form>
            </div>

            {/* Adjustment logs history ledger */}
            <div className="lg:col-span-2 p-5 bg-[#0F172A] border border-white/5 rounded-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="text-cyan-400" size={18} />
                    <h4 className="text-xs font-black uppercase text-white tracking-widest">Adjustments History Logs Ledger</h4>
                  </div>
                  <button
                    onClick={() => handleExportCSV('adjustments')}
                    className="text-[10px] font-bold text-cyan-400 underline hover:no-underline"
                  >
                    Export Logs
                  </button>
                </div>

                {/* Audit table logs */}
                <div className="overflow-y-auto max-h-[300px] border border-white/5 rounded-lg">
                  <table className="w-full border-collapse text-[11px] text-left text-white/80">
                    <thead>
                      <tr className="bg-slate-900 text-[9px] text-white/40 uppercase tracking-widest border-b border-white/10">
                        <th className="p-2">Date</th>
                        <th className="p-2">Product</th>
                        <th className="p-2 text-center">Type</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2">Reason</th>
                        <th className="p-2">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {adjustments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-white/30 italic">No adjustments made yet. All audit stocks clean.</td>
                        </tr>
                      ) : (
                        adjustments.map((adj) => {
                          const prod = stockItems.find(s => s.id === adj.productId);
                          return (
                            <tr key={adj.id} className="hover:bg-white/[0.01]">
                              <td className="p-2 font-mono text-slate-400">{new Date(adj.date).toLocaleDateString()}</td>
                              <td className="p-2 font-bold text-white">{prod ? `${prod.brand} ${prod.modelNumber}` : 'Unknown Product'}</td>
                              <td className={`p-2 text-center font-bold ${adj.type === 'Add' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {adj.type === 'Add' ? '➕ ADD' : '➖ SUB'}
                              </td>
                              <td className="p-2 text-center font-black font-mono">{adj.quantity}</td>
                              <td className="p-2"><span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">{adj.reason}</span></td>
                              <td className="p-2 text-white/60 truncate max-w-[120px]" title={adj.remarks}>{adj.remarks}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: BRANCH TRANSFERS */}
        {activeTab === 'transfers' && isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Transfer form */}
            <div className="p-5 rounded-2xl bg-[#0F172A] border border-white/5 flex flex-col justify-between">
              <form onSubmit={handleSaveTransfer} className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2 text-cyan-400">
                  <ArrowRightLeft size={18} />
                  <h4 className="text-xs font-black uppercase text-white tracking-widest">Create Stock Branch Transfer</h4>
                </div>

                {transferSuccess && (
                  <div className="p-3 bg-emerald-950/20 text-emerald-400 text-xs border border-emerald-900/40 rounded-lg flex items-center gap-2 font-black">
                    <CheckCircle2 size={14} />
                    <span>{transferSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="text-[9px] font-black uppercase text-white/40 block mb-1">Source Location (From)</label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-white/10 font-bold focus:outline-none focus:border-cyan-500"
                  >
                    {BRANCHES.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-white/40 block mb-1">Select Product to Move</label>
                  <select
                    value={selectedTransferProduct}
                    onChange={(e) => setSelectedTransferProduct(e.target.value)}
                    className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-white/10 font-bold focus:outline-none focus:border-cyan-500"
                    required
                  >
                    <option value="">-- Choose available items --</option>
                    {stockItems.filter(s => s.branch === selectedBranch && s.quantity > 0).map(s => (
                      <option key={s.id} value={s.id}>
                        {s.brand} {s.modelNumber} ({s.category}) • Stock: {s.quantity}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-white/40 block mb-1">Target Branch (To)</label>
                    <select
                      value={transferToBranch}
                      onChange={(e) => setTransferToBranch(e.target.value)}
                      className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-white/10 font-bold focus:outline-none focus:border-cyan-500"
                    >
                      {BRANCHES.filter(b => b !== selectedBranch).map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase text-white/40 block mb-1">Transfer Qty</label>
                    <input
                      type="number"
                      min={1}
                      value={transferQty === 0 ? '' : transferQty}
                      onChange={(e) => setTransferQty(e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full bg-slate-900 text-white font-mono text-center text-sm px-3 py-2 rounded-lg border border-white/10 font-bold focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-white/40 block mb-1">Transfer Reason Detail</label>
                  <textarea
                    placeholder="Why are you transferring? E.g., rebalance showroom, requested item, order satisfaction..."
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-white/10 h-20 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-500 text-white text-xs font-black uppercase tracking-wider rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  AUTHORIZE INTER-BRANCH TRANSFER
                </button>
              </form>
            </div>

            {/* Transfer list ledger */}
            <div className="lg:col-span-2 p-5 bg-[#0F172A] border border-white/5 rounded-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="text-cyan-400" size={18} />
                    <h4 className="text-xs font-black uppercase text-white tracking-widest">Branch Transfer Activity Log Ledger</h4>
                  </div>
                  <button
                    onClick={() => handleExportCSV('transfers')}
                    className="text-[10px] font-bold text-cyan-400 underline hover:no-underline"
                  >
                    Export Transfers Log
                  </button>
                </div>

                {/* transfer ledger table */}
                <div className="overflow-y-auto max-h-[300px] border border-white/5 rounded-lg">
                  <table className="w-full border-collapse text-[11px] text-left text-white/80 font-medium">
                    <thead>
                      <tr className="bg-slate-900 text-[9px] text-white/40 uppercase tracking-widest border-b border-white/10">
                        <th className="p-2">Date</th>
                        <th className="p-2">Category</th>
                        <th className="p-2">Product Name</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2">From Branch</th>
                        <th className="p-2">To Branch</th>
                        <th className="p-2">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {transfers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-4 text-center text-white/30 italic">No branch transfer activities yet. Operations are local.</td>
                        </tr>
                      ) : (
                        transfers.map((t) => (
                          <tr key={t.id} className="hover:bg-white/[0.01]">
                            <td className="p-2 font-mono text-slate-400">{new Date(t.date).toLocaleDateString()}</td>
                            <td className="p-2 font-bold text-slate-300">{t.category}</td>
                            <td className="p-2 font-bold text-white">{t.brand} {t.modelNumber}</td>
                            <td className="p-2 text-center font-black font-mono text-cyan-400">{t.quantity}</td>
                            <td className="p-2 text-emerald-400 font-bold">{t.fromBranch}</td>
                            <td className="p-2 text-indigo-400 font-bold">{t.toBranch}</td>
                            <td className="p-2 text-white/60 truncate max-w-[120px]">{t.reason}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 5: IMPORT BULK EXCEL & SCANNER SIMULATOR */}
        {activeTab === 'imports' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* MANUAL ENTRY & BARCODE PREFILL FORM */}
            <div className="p-5 rounded-2xl bg-[#0F172A] border border-white/5">
              <form onSubmit={handleSaveManualProduct} className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <PlusCircle size={18} />
                    <h4 className="text-xs font-black uppercase text-white tracking-widest">
                      {barcodeScanMode ? '✏️ Prefilled Barcode Product Form' : '1. Add Custom Shelf Product'}
                    </h4>
                  </div>
                  {barcodeScanMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setBarcodeScanMode(false);
                        setBarcodeInput('');
                      }}
                      className="text-[9px] bg-red-950 text-red-400 border border-red-900/40 px-2 py-0.5 rounded font-black uppercase"
                    >
                      Clear prefill
                    </button>
                  )}
                </div>

                {formSuccess && (
                  <div className="p-3 bg-emerald-950/20 text-emerald-400 text-xs border border-emerald-900/40 rounded-lg flex items-center gap-2 font-black">
                    <CheckCircle2 size={14} />
                    <span>{formSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-white/40 block mb-1">Product Category</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as StockCategory })}
                      className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-white/10 font-bold focus:outline-none focus:border-cyan-500"
                    >
                      {Object.keys(CATEGORY_ICONS).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase text-white/40 block mb-1">Brand Name</label>
                    <input
                      type="text"
                      placeholder="E.g., Gucci, Essilor, Tom Ford..."
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                      className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-white/10 font-bold focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                {/* If OPTICAL LENSES, allow selecting lens category type */}
                {newProduct.category === 'Optical Lenses' && (
                  <div className="p-3 bg-cyan-950/20 border border-cyan-900/30 rounded-xl space-y-2">
                    <label className="text-[9px] font-black uppercase text-cyan-400 block">Lens Technology Option</label>
                    <select
                      value={newProduct.lensType}
                      onChange={(e) => setNewProduct({ ...newProduct, lensType: e.target.value as LensType })}
                      className="w-full bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 font-bold focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Single Vision">Single Vision</option>
                      <option value="Bifocal">Bifocal</option>
                      <option value="Progressive">Progressive</option>
                      <option value="Blue Cut">Blue Cut</option>
                      <option value="Photochromic">Photochromic</option>
                      <option value="Anti Glare">Anti Glare</option>
                      <option value="High Index">High Index</option>
                      <option value="Other">Other Specialty Type</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-white/40 block mb-1">Model Number</label>
                    <input
                      type="text"
                      placeholder="E.g., TF-5401, S-Vision-01..."
                      value={newProduct.modelNumber}
                      onChange={(e) => setNewProduct({ ...newProduct, modelNumber: e.target.value })}
                      className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-white/10 font-bold focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase text-white/40 block mb-1">Barcode (EAN / Custom)</label>
                    <input
                      type="text"
                      placeholder="E.g., 8053672195..."
                      value={newProduct.barcode}
                      onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                      className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-white/10 font-bold focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-white/40 block mb-1">Purchase Cost (₹)</label>
                    <input
                      type="number"
                      placeholder="3500"
                      value={newProduct.purchasePrice || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, purchasePrice: Number(e.target.value) })}
                      className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-white/10 font-bold focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase text-white/40 block mb-1">Retail Price (₹)</label>
                    <input
                      type="number"
                      placeholder="5900"
                      value={newProduct.sellingPrice || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: Number(e.target.value) })}
                      className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-white/10 font-bold focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase text-white/40 block mb-1">Initial Qty</label>
                    <input
                      type="number"
                      min={1}
                      placeholder="1"
                      value={newProduct.quantity === 0 ? '' : newProduct.quantity}
                      disabled={barcodeScanMode}
                      onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value === '' ? 0 : Number(e.target.value) })}
                      className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-white/10 font-bold focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-white/40 block mb-1">Supplier Distributor Name</label>
                    <input
                      type="text"
                      placeholder="Bausch & Lomb India"
                      value={newProduct.supplierName}
                      onChange={(e) => setNewProduct({ ...newProduct, supplierName: e.target.value })}
                      className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-white/10 font-bold focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase text-white/40 block mb-1">Target Branch Placement</label>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-white/10 font-bold focus:outline-none focus:border-cyan-500"
                    >
                      {BRANCHES.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-white/40 block mb-1 font-bold">Purchase Date</label>
                  <input
                    type="date"
                    value={newProduct.purchaseDate}
                    onChange={(e) => setNewProduct({ ...newProduct, purchaseDate: e.target.value })}
                    className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-white/10 font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-white/40 block mb-1">Supplier Remarks &amp; Tags</label>
                  <textarea
                    placeholder="E.g. anti-glare, scratch resistance..."
                    value={newProduct.remarks}
                    onChange={(e) => setNewProduct({ ...newProduct, remarks: e.target.value })}
                    className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-white/10 h-16 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-cyan-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  SAVE NEW PRODUCT TO LEDGER
                </button>
              </form>
            </div>

            {/* TAB 5 RIGHT: EXCEL BULK STOCK UPLOADER */}
            <div className="p-5 rounded-2xl bg-[#0F172A] border border-white/5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2 text-cyan-400">
                  <FileSpreadsheet size={18} />
                  <h4 className="text-xs font-black uppercase text-white tracking-widest">Excel Sheet Bulk Importer</h4>
                </div>

                <p className="text-[11px] text-white/60 leading-relaxed font-semibold">
                  Paste columns directly from your optical excel sheet or CSV file using <strong className="text-cyan-400">Tab Separated Values (TSV)</strong>.
                </p>

                {bulkImportSuccess && (
                  <div className="p-3 bg-emerald-950/20 text-emerald-400 text-xs border border-emerald-900/40 rounded-lg flex items-center gap-2 font-black">
                    <CheckCircle2 size={14} />
                    <span>{bulkImportSuccess}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => loadSampleExcelTemplate('general')}
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] text-cyan-300 border border-white/10 font-bold uppercase"
                  >
                    Load Sample Excel rows
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkExcelText('')}
                    className="px-3 py-1 bg-red-950/30 hover:bg-red-950/50 rounded text-[9px] text-red-400 border border-red-900/30 font-bold uppercase"
                  >
                    Clear Importer
                  </button>
                </div>

                <div>
                  <textarea
                    placeholder="Paste Excel Rows here. Expected schema format: Category [TAB] Brand [TAB] Model [TAB] Barcode [TAB] BuyCost [TAB] SellCost [TAB] Qty [TAB] Supplier..."
                    value={bulkExcelText}
                    onChange={(e) => setBulkExcelText(e.target.value)}
                    className="w-full bg-slate-900 text-white font-mono text-xs px-3 py-2 rounded-lg border border-white/10 h-72 focus:outline-none focus:border-cyan-500 whitespace-pre overflow-x-auto leading-normal"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleExcelImport}
                className="w-full py-2.5 bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-lg hover:bg-emerald-600 transition-colors mt-4"
              >
                EXECUTE BULK STOCK IMPORT
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

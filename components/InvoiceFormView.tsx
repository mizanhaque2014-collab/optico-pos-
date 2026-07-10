'use client';

import { useState, useEffect, useMemo } from 'react';
import { Customer, InvoiceType, OrderItem, PaymentDetail, PaymentMode } from '@/lib/types';
import { useStore } from '@/lib/store';
import { CustomerSelect } from './CustomerSelect';
import { FrameSection } from './FrameSection';
import { LensSection } from './LensSection';
import { ManualItemSection } from './ManualItemSection';
import { OpticalInvoiceA5 } from './OpticalInvoiceA5';
import PrescriptionSection from './PrescriptionSection';
import { Trash2, Plus, Receipt } from 'lucide-react';
import { Prescription } from '@/lib/types';

interface Props {
  type: InvoiceType;
  onBack: () => void;
  initialCustomer?: Customer;
  preloadedEyeTest?: any;
}

export function InvoiceFormView({ type, onBack, initialCustomer, preloadedEyeTest }: Props) {
  const { saveInvoice, generateInvoiceNumber, saveCustomer, getCustomers, getStockInventory } = useStore();
  const [stableCurrentTime, setStableCurrentTime] = useState<number>(0);
  useEffect(() => {
    setStableCurrentTime(Date.now());
  }, []);
  const [customer, setCustomer] = useState<Customer | null>(initialCustomer || null);
  const [prescription, setPrescription] = useState<Prescription | null>(() => {
    if (preloadedEyeTest) {
      return {
        id: preloadedEyeTest.id || `P-ET-${Date.now()}`,
        source: 'Eye Test Performed In Shop',
        rightEye: {
          sph: preloadedEyeTest.sphOd || '',
          cyl: preloadedEyeTest.cylOd || '',
          axis: preloadedEyeTest.axisOd || '',
          add: preloadedEyeTest.addPower || '',
        },
        leftEye: {
          sph: preloadedEyeTest.sphOs || '',
          cyl: preloadedEyeTest.cylOs || '',
          axis: preloadedEyeTest.axisOs || '',
          add: preloadedEyeTest.addPower || '',
        },
        pdDistance: preloadedEyeTest.pdDistance || '',
        pdNear: preloadedEyeTest.pdNear || '',
        remarks: preloadedEyeTest.remarks || '',
        eyeTestDetails: {
          optometristName: preloadedEyeTest.optometristName || '',
          eyeTestDate: preloadedEyeTest.eyeTestDate || '',
          remarks: preloadedEyeTest.remarks || '',
        },
        createdAt: preloadedEyeTest.createdAt || Date.now()
      };
    }
    return initialCustomer?.prescriptions?.[initialCustomer.prescriptions.length - 1] || null;
  });

  const [items, setItems] = useState<OrderItem[]>([]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [paymentDetail, setPaymentDetail] = useState<PaymentDetail>({ cash: 0, upi: 0, card: 0, total: 0 });
  const [advanceAmount, setAdvanceAmount] = useState(0);

  // Live stock availability checker state
  const [stockQuery, setStockQuery] = useState('');
  const [stockBranch, setStockBranch] = useState('All Branches');

  const stockLookupResults = useMemo(() => {
    if (!getStockInventory) return [];
    try {
      const allStock = getStockInventory();
      if (!String(stockQuery ?? "").trim()) return [];
      const q = stockQuery.toLowerCase();
      return allStock.filter(item => {
        const matchesQuery = item.brand.toLowerCase().includes(q) || 
                             item.modelNumber.toLowerCase().includes(q) || 
                             item.barcode.includes(q) ||
                             item.category.toLowerCase().includes(q);
        
        const matchesBranch = stockBranch === 'All Branches' || item.branch === stockBranch;
        return matchesQuery && matchesBranch;
      });
    } catch {
      return [];
    }
  }, [stockQuery, stockBranch, getStockInventory]);

  const subTotal = items.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  const totalDiscount = items.reduce((sum, item) => sum + (item.discount || 0), 0);
  const grandTotal = subTotal - totalDiscount;
  const balanceAmount = grandTotal - (type === 'Sales Order' ? advanceAmount : grandTotal); // direct sale always fully paid

  // Auto-fill payment details based on mode & type
  useEffect(() => {
    if (paymentMode !== 'Mixed') {
      const amount = type === 'Direct Sale' ? grandTotal : advanceAmount;
      setPaymentDetail(prev => ({
        ...prev,
        cash: paymentMode === 'Cash' ? amount : 0,
        upi: paymentMode === 'UPI' ? amount : 0,
        card: paymentMode === 'Card' ? amount : 0,
        total: amount
      }));
    }
  }, [paymentMode, advanceAmount, grandTotal, type]);

  // Mixed mode auto-sync
  useEffect(() => {
    if (paymentMode === 'Mixed') {
      const total = (paymentDetail.cash || 0) + (paymentDetail.upi || 0) + (paymentDetail.card || 0);
      setPaymentDetail(prev => ({ ...prev, total }));
      if (type === 'Sales Order') {
        setAdvanceAmount(total);
      }
    }
  }, [paymentDetail.cash, paymentDetail.upi, paymentDetail.card, paymentMode, type]);

  const handleAddItem = (item: OrderItem) => {
    setItems([...items, item]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const [savedInvoice, setSavedInvoice] = useState<any>(null);
  const [continueToBilling, setContinueToBilling] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSaveCustomerOnly = () => {
    if (!customer) {
      alert('Please select a customer.');
      return;
    }

    const updatedCustomer = { ...customer };
    
    if (prescription && prescription.source === 'Eye Test Performed In Shop') {
      updatedCustomer.status = 'Eye Test Only';
    } else if (prescription && prescription.source !== 'No Prescription') {
      updatedCustomer.status = 'Prescription Only';
    }

    if (prescription && prescription.source !== 'No Prescription') {
      if (!updatedCustomer.prescriptions) updatedCustomer.prescriptions = [];
      if (!updatedCustomer.prescriptions.find(p => p.id === prescription.id)) {
        updatedCustomer.prescriptions.push(prescription);
      } else {
        updatedCustomer.prescriptions = updatedCustomer.prescriptions.map(p => p.id === prescription.id ? prescription : p);
      }
    }

    saveCustomer(updatedCustomer);
    setCustomer(updatedCustomer);
    setSaveSuccessMessage(true);
    setTimeout(() => setSaveSuccessMessage(false), 5000);
  };

  const handleInitiateSubmit = () => {
    if (!customer) {
      alert('Please select a customer.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one item.');
      return;
    }
    setShowConfirmation(true);
  };

  const handleSubmit = () => {
    if (!customer) return;
    
    // In Direct Sale, advance is full amount
    const finalAdvance = type === 'Direct Sale' ? grandTotal : advanceAmount;

    let finalPrescriptionId = undefined;

    // Save prescription to customer if exists
    const updatedCustomer = { ...customer };
    if (prescription && prescription.source !== 'No Prescription') {
      if (!updatedCustomer.prescriptions) updatedCustomer.prescriptions = [];
      // Only add if it's new
      if (!updatedCustomer.prescriptions.find(p => p.id === prescription.id)) {
        updatedCustomer.prescriptions.push(prescription);
      } else {
        // update existing
        updatedCustomer.prescriptions = updatedCustomer.prescriptions.map(p => p.id === prescription.id ? prescription : p);
      }
      finalPrescriptionId = prescription.id;
    }
    updatedCustomer.status = type === 'Sales Order' ? 'Sales Order Customer' : 'Buyer';
    saveCustomer(updatedCustomer);

    const newInvoice = {
      id: crypto.randomUUID(),
      invoiceNumber: generateInvoiceNumber(),
      type,
      customerId: customer.id,
      prescriptionId: finalPrescriptionId,
      items,
      subTotal,
      totalDiscount,
      grandTotal,
      paymentMode,
      paymentDetail,
      advanceAmount: finalAdvance,
      balanceAmount: grandTotal - finalAdvance,
      status: type === 'Direct Sale' ? 'Delivered' : 'Ordered',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    saveInvoice(newInvoice as any);
    setSavedInvoice(newInvoice);
  };

  if (savedInvoice) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto space-y-6 mt-4 animate-in fade-in duration-300">
        <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between w-full shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
              <Receipt size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase text-white tracking-widest leading-none mb-1">Invoice Saved!</h3>
              <p className="text-white/60 text-[10px] font-bold uppercase">Invoice Number: <span className="font-mono text-emerald-400 font-black">{savedInvoice.invoiceNumber}</span></p>
            </div>
          </div>
          <button 
            onClick={onBack}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2.5 text-xs rounded-lg transition-colors uppercase tracking-wider shadow-md"
          >
            ← Return to Dashboard
          </button>
        </div>

        {/* Live A5 Portrait Optical Invoice Sheet */}
        <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl shadow-2xl flex flex-col items-center w-full">
          <div className="bg-slate-300 p-4 rounded-xl shadow-inner border border-slate-400/30">
            <OpticalInvoiceA5 
              invoice={savedInvoice} 
              customer={customer} 
              prescription={prescription}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden relative pb-28">
      {/* Main Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5">
          <h2 className="text-sm font-black text-white/60 mb-4 uppercase tracking-widest flex items-center gap-2">
             <span className="w-6 h-6 bg-blue-500/20 rounded-md flex items-center justify-center text-blue-400">1</span>
             {type} - Customer
          </h2>
          <CustomerSelect selectedCustomer={customer} onSelect={setCustomer} />
        </div>

        {customer && (
          <PrescriptionSection 
            customer={customer}
            prescription={prescription}
            onChange={setPrescription}
          />
        )}

        {customer && !continueToBilling ? (
           <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
             {saveSuccessMessage && (
               <div className="bg-emerald-500/20 border border-emerald-500/50 p-4 rounded-xl flex items-center justify-between shadow-lg">
                 <p className="text-emerald-400 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                   <span>✅</span> Customer & Prescription Saved Successfully
                 </p>
                 <button onClick={() => setSaveSuccessMessage(false)} className="text-emerald-400 hover:text-emerald-300">✖</button>
               </div>
             )}
             <div className="flex gap-4">
               <button 
                 onClick={handleSaveCustomerOnly}
                 className="flex-1 bg-[#1E293B] border border-white/10 hover:bg-[#1E293B]/80 hover:border-blue-500/50 text-white font-bold py-4 text-sm rounded-xl transition-colors shadow-lg uppercase tracking-wider flex items-center justify-center gap-2"
               >
                 <span>💾</span> Save Customer & Prescription
               </button>
               <button 
                 onClick={() => setContinueToBilling(true)}
                 className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 text-sm rounded-xl transition-colors shadow-lg shadow-blue-900/20 uppercase tracking-wider flex items-center justify-center gap-2"
               >
                 <span>🧾</span> Continue To Billing
               </button>
             </div>
           </div>
        ) : continueToBilling ? (
          <>
            <div className="flex justify-between items-center bg-[#0F172A] p-4 rounded-xl border border-white/5 shadow-sm">
              <h2 className="text-xs font-black text-white/60 uppercase tracking-widest flex items-center gap-2">Billing Section Expanded</h2>
              <button 
                 onClick={() => setContinueToBilling(false)}
                 className="text-[10px] font-bold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 rounded uppercase tracking-wider flex items-center gap-2 transition-colors"
               >
                 <span>❌</span> Close Billing Section
               </button>
            </div>

            {/* ⚡ LIVE PHYSICAL STOCK SEARCH & AVAILABILITY CHECKER */}
            <div className="bg-[#0F172A] p-6 rounded-2xl border-2 border-dashed border-cyan-500/20 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-cyan-500/20 rounded-md flex items-center justify-center text-cyan-400 font-sans text-xs">⚡</span>
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-0.5">Live Stock &amp; Branch Checker</h2>
                    <p className="text-[10px] text-white/40 uppercase font-black">Search brand, model number, or scan barcode to verify availability before billing</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <select
                    value={stockBranch}
                    onChange={(e) => setStockBranch(e.target.value)}
                    className="bg-slate-900 border border-white/10 text-[10px] font-bold text-white px-2 py-1 rounded cursor-pointer"
                  >
                    <option value="All Branches">All Active Branches</option>
                    <option value="Main Branch">Main Branch</option>
                    <option value="City Center Branch">City Center Branch</option>
                    <option value="Metro Mall Branch">Metro Mall Branch</option>
                  </select>
                </div>
              </div>

              {/* Input field */}
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type product model number, brand, or scan item barcode here..."
                  className="flex-1 bg-black/35 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 font-sans"
                  value={stockQuery}
                  onChange={(e) => setStockQuery(e.target.value)}
                />
                {stockQuery && (
                  <button
                    onClick={() => setStockQuery('')}
                    className="px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 font-bold rounded-lg text-xs uppercase transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>

              {/* results */}
              {String(stockQuery ?? "").trim() && (
                <div className="space-y-2 max-h-[180px] overflow-y-auto">
                  {stockLookupResults.length === 0 ? (
                    <p className="text-center text-white/40 text-xs py-3 italic">
                      ⚠️ No items with matching barcode, brand, or model found in stock database.
                    </p>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {stockLookupResults.map((p) => {
                        const inStock = p.quantity > 0;
                        const lowStock = p.quantity > 0 && p.quantity <= 3;
                        const qtyText = inStock 
                          ? `${p.quantity} units` 
                          : '0 units';
                        const statusClass = !inStock 
                          ? 'bg-red-950/40 text-red-400 border-red-900/30' 
                          : lowStock 
                            ? 'bg-amber-950/40 text-amber-400 border-amber-900/30' 
                            : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30';
                        const statusLabel = !inStock 
                          ? '🔴 Out of Stock' 
                          : lowStock 
                            ? '🟡 Low Stock' 
                            : '🟢 In Stock';

                        return (
                          <div key={p.id} className="flex items-center justify-between py-2.5 text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-white text-sm">{p.brand}</span>
                                <span className="font-mono text-cyan-400">{p.modelNumber}</span>
                                <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-white/50 border border-white/10 font-mono">Barcode: {p.barcode}</span>
                                <span className="text-[9px] text-white/40 italic">({p.category})</span>
                              </div>
                              <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mt-1">
                                Location: <strong className="text-white/60">{p.branch}</strong> • Retail price: <strong className="text-emerald-400">₹{p.sellingPrice}</strong>
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded border ${statusClass}`}>
                                {statusLabel} ({qtyText})
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5">
              <h2 className="text-sm font-black text-white/60 mb-4 uppercase tracking-widest flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-500/20 rounded-md flex items-center justify-center text-purple-400">2</span>
                Add Items
              </h2>
              <div className="space-y-4">
                <FrameSection onAdd={handleAddItem} />
                <LensSection onAdd={handleAddItem} />
                <ManualItemSection onAdd={handleAddItem} />
              </div>
            </div>

            <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5">
              <h2 className="text-sm font-black text-white/60 mb-4 uppercase tracking-widest flex items-center gap-2">
                <span className="w-6 h-6 bg-yellow-500/20 rounded-md flex items-center justify-center text-yellow-500">3</span>
                Selected Items & Bill Summary
              </h2>
              
              <div className="space-y-6">
                {/* Selected Items Table */}
                {items.length === 0 ? (
                  <p className="text-white/40 text-sm py-4 font-bold text-center border border-dashed border-white/10 rounded-xl">NO ITEMS ADDED</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-white/5 text-xs text-white/40 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 rounded-tl-lg rounded-bl-lg font-bold">Item Name</th>
                          <th className="px-4 py-3 font-bold">Category</th>
                          <th className="px-4 py-3 font-bold text-center">Qty</th>
                          <th className="px-4 py-3 font-bold text-right">Rate</th>
                          <th className="px-4 py-3 font-bold text-right">Discount</th>
                          <th className="px-4 py-3 rounded-tr-lg rounded-br-lg font-bold text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {items.map((item) => (
                          <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                              <button onClick={() => handleRemoveItem(item.id)} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={14} />
                              </button>
                              {item.itemType === 'frame' ? `${item.brand} ${item.productType} ${item.modelNumber || ''}` : 
                               item.itemType === 'lens' ? `${item.lensBrand} ${item.lensCategory}` : 
                               item.itemName}
                            </td>
                            <td className="px-4 py-3 text-white/60 capitalize font-medium">{item.itemType}</td>
                            <td className="px-4 py-3 text-center text-white/80 font-bold">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-white/80 font-bold">₹{item.sellingPrice}</td>
                            <td className="px-4 py-3 text-right text-rose-400 font-bold">{item.discount > 0 ? `-₹${item.discount}` : '-'}</td>
                            <td className="px-4 py-3 text-right text-emerald-400 font-black">₹{item.finalAmount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            </div>

            {/* ONE SINGLE UNIFIED BILLING BOX */}
            <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5 space-y-6">
              <h2 className="text-sm font-black text-white/60 uppercase tracking-widest flex items-center gap-2">
                <span className="w-6 h-6 bg-yellow-500/20 rounded-md flex items-center justify-center text-yellow-500">3</span>
                Unified Billing & Payment Box
              </h2>

              <div className="bg-[#1E293B] border border-white/10 rounded-xl p-5 space-y-4">
                {/* 1. Grand Total */}
                <div className="flex justify-between items-center text-white/60 text-xs font-bold uppercase tracking-wider">
                  <span>Grand Total (PRE-DISCOUNT)</span>
                  <span className="text-white text-base font-black">₹{subTotal}</span>
                </div>

                {/* 2. Discount */}
                <div className="flex justify-between items-center text-rose-400 text-xs font-bold uppercase tracking-wider">
                  <span>Less Total Discount</span>
                  <span className="text-rose-400 text-base font-black">-₹{totalDiscount}</span>
                </div>

                {/* 3. Final Bill Amount */}
                <div className="flex justify-between items-center text-cyan-400 text-base font-black border-t border-white/10 pt-3 uppercase tracking-wider">
                  <span>Final Bill Amount</span>
                  <span className="text-xl">₹{grandTotal}</span>
                </div>

                {/* 4. Advance Received Input */}
                {type === 'Sales Order' ? (
                  <div className="space-y-2 border-t border-white/10 pt-3">
                    <label className="text-[10px] text-emerald-400 block uppercase font-bold tracking-wider">
                      Advance Received (₹)
                    </label>
                    <input 
                      type="number"
                      min="0"
                      max={grandTotal}
                      disabled={paymentMode === 'Mixed'} 
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-lg font-black text-emerald-400 text-center focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                      value={advanceAmount === 0 ? '' : advanceAmount}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setAdvanceAmount(val);
                        if (paymentMode !== 'Mixed') {
                          setPaymentDetail(prev => ({
                            ...prev,
                            cash: paymentMode === 'Cash' ? val : 0,
                            upi: paymentMode === 'UPI' ? val : 0,
                            card: paymentMode === 'Card' ? val : 0,
                            total: val
                          }));
                        }
                      }}
                    />
                    {paymentMode === 'Mixed' && (
                      <span className="text-[8px] text-white/40 uppercase block text-center font-bold">Auto-calculated from Payment Mix split below</span>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-emerald-400 text-xs font-bold border-t border-white/10 pt-3 uppercase tracking-wider">
                    <span>Advance Received (100% PAID)</span>
                    <span className="text-emerald-400 text-base font-black">₹{grandTotal}</span>
                  </div>
                )}

                {/* 5. Balance Amount Display */}
                <div className="flex justify-between items-center text-rose-400 text-xs font-black border-t border-white/10 pt-3 uppercase tracking-wider">
                  <span>Balance Amount Due</span>
                  <span className="text-rose-400 text-xl font-black">₹{balanceAmount}</span>
                </div>

                {/* 6. Payment Method selection inside same card */}
                <div className="border-t border-white/10 pt-4 space-y-2">
                  <label className="text-[10px] text-white/40 block uppercase font-bold tracking-wider">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['Cash', 'UPI', 'Card', 'Mixed'] as PaymentMode[]).map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setPaymentMode(mode);
                          // Clear/re-evaluate when mode updates
                          if (mode !== 'Mixed') {
                            const val = type === 'Direct Sale' ? grandTotal : advanceAmount;
                            setPaymentDetail({
                              cash: mode === 'Cash' ? val : 0,
                              upi: mode === 'UPI' ? val : 0,
                              card: mode === 'Card' ? val : 0,
                              total: val
                            });
                          }
                        }}
                        className={`py-2 rounded-lg font-black border text-[10px] tracking-wider uppercase transition-colors ${
                          paymentMode === mode 
                            ? 'bg-cyan-600 border-cyan-500 text-white' 
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 7. Payment Details input panels inside same card */}
                <div className="bg-black/25 rounded-xl p-3.5 space-y-3.5">
                  {paymentMode === 'Card' && (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[9px] text-white/40 mb-1 block uppercase font-bold tracking-wider">Card Type</label>
                        <input 
                          type="text" 
                          placeholder="Visa, Master..." 
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 font-bold text-white focus:outline-none focus:border-cyan-500" 
                          value={paymentDetail.cardType || ''} 
                          onChange={e => setPaymentDetail({...paymentDetail, cardType: e.target.value})} 
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-white/40 mb-1 block uppercase font-bold tracking-wider">Last 4 Digits</label>
                        <input 
                          type="text" 
                          maxLength={4} 
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 font-bold text-white focus:outline-none focus:border-cyan-500 font-mono" 
                          value={paymentDetail.cardLast4 || ''} 
                          onChange={e => setPaymentDetail({...paymentDetail, cardLast4: e.target.value})} 
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[9px] text-white/40 mb-1 block uppercase font-bold tracking-wider">Transaction Number / Code</label>
                        <input 
                          type="text" 
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500" 
                          value={paymentDetail.referenceNumber || ''} 
                          onChange={e => setPaymentDetail({...paymentDetail, referenceNumber: e.target.value})} 
                        />
                      </div>
                    </div>
                  )}

                  {paymentMode === 'UPI' && (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[9px] text-white/40 mb-1 block uppercase font-bold tracking-wider">UPI App Name</label>
                        <input 
                          type="text" 
                          placeholder="GPay, PhonePe..." 
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 font-bold text-white focus:outline-none focus:border-cyan-500" 
                          value={paymentDetail.upiApp || ''} 
                          onChange={e => setPaymentDetail({...paymentDetail, upiApp: e.target.value})} 
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-white/40 mb-1 block uppercase font-bold tracking-wider">Transaction ID</label>
                        <input 
                          type="text" 
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono" 
                          value={paymentDetail.upiTransactionId || ''} 
                          onChange={e => setPaymentDetail({...paymentDetail, upiTransactionId: e.target.value})} 
                        />
                      </div>
                    </div>
                  )}

                  {paymentMode === 'Mixed' && (
                    <div className="space-y-3 text-xs">
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest border-b border-white/5 pb-1 block">Specify Payment Split</p>
                      <div className="flex items-center gap-2">
                        <span className="w-16 font-extrabold text-white/60 text-[10px] tracking-wider">CASH (₹)</span>
                        <input 
                          type="number" 
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-right font-black text-cyan-400 focus:outline-none focus:border-cyan-500" 
                          value={paymentDetail.cash === 0 ? '' : paymentDetail.cash} 
                          onChange={e => {
                            const val = Number(e.target.value);
                            setPaymentDetail({...paymentDetail, cash: val});
                          }} 
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-16 font-extrabold text-white/60 text-[10px] tracking-wider">UPI (₹)</span>
                        <input 
                          type="number" 
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-right font-black text-cyan-400 focus:outline-none focus:border-cyan-500" 
                          value={paymentDetail.upi === 0 ? '' : paymentDetail.upi} 
                          onChange={e => {
                            const val = Number(e.target.value);
                            setPaymentDetail({...paymentDetail, upi: val});
                          }} 
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-16 font-extrabold text-white/60 text-[10px] tracking-wider">CARD (₹)</span>
                        <input 
                          type="number" 
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-right font-black text-cyan-400 focus:outline-none focus:border-cyan-500" 
                          value={paymentDetail.card === 0 ? '' : paymentDetail.card} 
                          onChange={e => {
                            const val = Number(e.target.value);
                            setPaymentDetail({...paymentDetail, card: val});
                          }} 
                        />
                      </div>
                      <div className="pt-2 border-t border-white/5 flex justify-between items-center font-bold text-[10px] uppercase text-white/50">
                        <span>Total Mix Received</span>
                        <span className={`font-black text-sm ${paymentDetail.total > grandTotal ? 'text-rose-400' : 'text-emerald-400'}`}>
                          ₹{paymentDetail.total}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/5">
                    <label className="text-[9px] text-white/40 block uppercase font-bold tracking-wider">Billing Remarks</label>
                    <input 
                      type="text" 
                      placeholder="e.g. prompt delivery / priority lens order"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold" 
                      value={paymentDetail.remarks || ''} 
                      onChange={e => setPaymentDetail({...paymentDetail, remarks: e.target.value})} 
                    />
                  </div>
                </div>

              </div>
            </div>
            
            <div className="h-10"></div>
          </>
        ) : null}
      </div>

      {/* Bottom Action Bar */}
      {continueToBilling && (
        <div className="absolute bottom-0 left-0 right-0 bg-[#0F172A] border-t border-white/10 p-4 flex gap-3 overflow-x-auto z-50 whitespace-nowrap custom-scrollbar">
           <button 
             onClick={() => setContinueToBilling(false)}
             className="bg-rose-950/40 border border-rose-500/20 hover:bg-rose-900/40 text-rose-400 font-bold px-5 py-3 text-[10px] rounded-lg transition-colors uppercase tracking-widest flex items-center justify-center gap-2 shrink-0"
           >
             ❌ Cancel
           </button>
           <button 
             onClick={handleSaveCustomerOnly}
             className="bg-white/5 hover:bg-white/10 text-white font-bold px-5 py-3 text-[10px] rounded-lg transition-colors uppercase tracking-widest flex items-center justify-center gap-2 shrink-0"
           >
             💾 Save
           </button>
           <button 
             onClick={handleInitiateSubmit}
             className="bg-blue-600/20 border border-blue-500/50 hover:bg-blue-500/30 text-blue-400 font-bold px-6 py-3 text-[10px] rounded-lg transition-colors uppercase tracking-widest flex items-center justify-center gap-2 shrink-0"
           >
             📋 Save Order
           </button>
           <button 
             onClick={handleInitiateSubmit}
             className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3 text-xs rounded-lg shadow-lg shadow-emerald-900/20 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 shrink-0"
           >
             🧾 Generate Invoice
           </button>
           
           <div className="flex-1 min-w-[20px]"></div> {/* Spacer */}

           <button 
             onClick={() => alert('Sending WhatsApp...')}
             className="bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-500/30 text-emerald-400 font-bold px-5 py-3 text-[10px] rounded-lg transition-colors uppercase tracking-widest flex items-center justify-center gap-2 shrink-0"
           >
             📱 Send WhatsApp
           </button>
           <button 
             onClick={() => window.print()}
             className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 text-[10px] rounded-lg transition-colors uppercase tracking-widest flex items-center justify-center gap-2 shrink-0"
           >
             🖨 Print A5
           </button>
        </div>
      )}

      {showConfirmation && customer && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#1E293B]">
              <h2 className="font-extrabold text-[#94A3B8] tracking-widest text-[10px] uppercase">Confirm & Preview Invoice Details</h2>
              <button onClick={() => setShowConfirmation(false)} className="text-white/40 hover:text-white font-bold text-sm">✖</button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-sm flex-1 bg-slate-300 flex justify-center items-start">
              <div className="shadow-lg rounded-md overflow-hidden bg-white">
                <OpticalInvoiceA5 
                  customer={customer} 
                  prescription={prescription} 
                  invoice={{
                    id: 'DRAFT',
                    invoiceNumber: generateInvoiceNumber(),
                    type,
                    customerId: customer.id,
                    prescriptionId: prescription?.id,
                    items,
                    subTotal,
                    totalDiscount,
                    grandTotal,
                    paymentMode,
                    paymentDetail,
                    advanceAmount: type === 'Direct Sale' ? grandTotal : advanceAmount,
                    balanceAmount: balanceAmount,
                    status: type === 'Direct Sale' ? 'Delivered' : 'Ordered',
                    createdAt: stableCurrentTime,
                    updatedAt: stableCurrentTime
                  }}
                  isPrintPreviewOnly={true}
                />
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-[#1E293B] flex gap-3">
              <button 
                onClick={() => setShowConfirmation(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 text-xs w-full rounded-xl transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>✏️</span> Edit Details
              </button>
              <button 
                onClick={() => { setShowConfirmation(false); handleSubmit(); }}
                className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 text-xs rounded-xl shadow-lg shadow-emerald-900/20 transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <span>✅</span> Confirm & Create Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

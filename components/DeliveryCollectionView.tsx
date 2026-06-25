'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Invoice, PaymentMode, PaymentDetail } from '@/lib/types';
import { Search, CheckCircle, ArrowLeft, Receipt, Phone, MapPin, Award, Check } from 'lucide-react';
import { OpticalInvoiceA5 } from './OpticalInvoiceA5';
import { shopConfig } from '@/lib/shopConfig';

interface Props {
  onBack: () => void;
}

export function DeliveryCollectionView({ onBack }: Props) {
  const { getInvoices, saveInvoice, getCustomers } = useStore();
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);

  // States for payment collection box
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [cardAmount, setCardAmount] = useState<number>(0);
  const [upiAmount, setUpiAmount] = useState<number>(0);
  
  // Card details
  const [cardType, setCardType] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [cardTxn, setCardTxn] = useState('');

  // UPI details
  const [upiApp, setUpiApp] = useState('');
  const [upiTxnId, setUpiTxnId] = useState('');
  const [upiRefNo, setUpiRefNo] = useState('');

  // Remarks
  const [remarks, setRemarks] = useState('');

  // Confirm popup state
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // Resolved lists
  const invoices = useMemo(() => getInvoices(), [completedInvoice]);
  const customers = useMemo(() => getCustomers(), []);
  
  const pendingOrders = useMemo(() => {
    return invoices.filter(i => i.type === 'Sales Order' && i.status !== 'Delivered' && i.status !== 'Cancelled');
  }, [invoices]);

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return pendingOrders;
    const q = search.toLowerCase();
    // Search by invoice number or mobile number if we can cross check with customer
    return pendingOrders.filter(i => {
      const isInvoiceMatch = i.invoiceNumber.toLowerCase().includes(q);
      const cust = customers.find(c => c.id === i.customerId);
      const isMobileMatch = cust ? cust.mobile.includes(q) : false;
      const isNameMatch = cust ? cust.name.toLowerCase().includes(q) : false;
      return isInvoiceMatch || isMobileMatch || isNameMatch;
    });
  }, [search, pendingOrders, customers]);

  // Resolve Customer & Prescription for selected Order on-the-fly
  const resolvedCustomer = useMemo(() => {
    const active = completedInvoice || selectedInvoice;
    if (!active) return null;
    return customers.find(c => c.id === active.customerId) || null;
  }, [selectedInvoice, completedInvoice, customers]);

  const resolvedPrescription = useMemo(() => {
    const active = completedInvoice || selectedInvoice;
    if (!active || !resolvedCustomer) return null;
    if (active.prescriptionId) {
      return resolvedCustomer.prescriptions?.find(p => p.id === active.prescriptionId) || null;
    }
    return resolvedCustomer.prescriptions?.[resolvedCustomer.prescriptions.length - 1] || null;
  }, [selectedInvoice, completedInvoice, resolvedCustomer]);

  // Handle invoice selection
  const handleSelectInvoice = (invoice: Invoice | null) => {
    setSelectedInvoice(invoice);
    setShowConfirmPopup(false);
    if (invoice) {
      setPaymentMode('Cash');
      setCashAmount(invoice.balanceAmount);
      setCardAmount(0);
      setUpiAmount(0);
      setCardType('');
      setCardLast4('');
      setCardTxn('');
      setUpiApp('');
      setUpiTxnId('');
      setUpiRefNo('');
      setRemarks('');
    }
  };

  // Payment mode changer with intelligent pre-fills for speed
  const handlePaymentModeChange = (mode: PaymentMode) => {
    setPaymentMode(mode);
    if (!selectedInvoice) return;
    const bal = selectedInvoice.balanceAmount;
    if (mode === 'Cash') {
      setCashAmount(bal);
      setCardAmount(0);
      setUpiAmount(0);
    } else if (mode === 'Card') {
      setCashAmount(0);
      setCardAmount(bal);
      setUpiAmount(0);
    } else if (mode === 'UPI') {
      setCashAmount(0);
      setCardAmount(0);
      setUpiAmount(bal);
    } else {
      // Mixed
      setCashAmount(bal);
      setCardAmount(0);
      setUpiAmount(0);
    }
  };

  // Calculate dynamic split total received
  const totalReceived = useMemo(() => {
    if (paymentMode === 'Cash') return cashAmount;
    if (paymentMode === 'Card') return cardAmount;
    if (paymentMode === 'UPI') return upiAmount;
    return cashAmount + cardAmount + upiAmount;
  }, [paymentMode, cashAmount, cardAmount, upiAmount]);

  // Core complete collection trigger
  const handleCollect = () => {
    if (!selectedInvoice) return;
    
    // Automatically Verify Balance Payment
    if (totalReceived !== selectedInvoice.balanceAmount) {
      alert(`Payment Verification Failed: Total Entered (₹${totalReceived}) must match Balance Due (₹${selectedInvoice.balanceAmount}).`);
      return;
    }

    // Build perfect finalized Payment History object
    const finalDetail: PaymentDetail = {
      cash: cashAmount,
      upi: upiAmount,
      card: cardAmount,
      total: totalReceived,
      remarks: remarks || undefined
    };

    if (paymentMode === 'Card' || paymentMode === 'Mixed') {
      if (cardType) finalDetail.cardType = cardType;
      if (cardLast4) finalDetail.cardLast4 = cardLast4;
      if (cardTxn) {
        finalDetail.referenceNumber = cardTxn;
      }
    }

    if (paymentMode === 'UPI' || paymentMode === 'Mixed') {
      if (upiApp) finalDetail.upiApp = upiApp;
      if (upiTxnId) finalDetail.upiTransactionId = upiTxnId;
      if (upiRefNo) finalDetail.referenceNumber = upiRefNo;
    }

    // Update state objects
    const updatedInvoice: Invoice = {
      ...selectedInvoice,
      status: 'Delivered',
      balanceAmount: 0,
      deliveryDate: Date.now(),
      finalCollectionPaymentMode: paymentMode,
      finalCollectionPaymentDetail: finalDetail,
      updatedAt: Date.now()
    };

    // Save persistent LocalStorage
    saveInvoice(updatedInvoice);

    // Swap states
    setCompletedInvoice(updatedInvoice);
    setSelectedInvoice(null);
    setShowConfirmPopup(false);
  };

  // SUCCESS COMPLETION STATE RENDER
  if (completedInvoice) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="bg-emerald-950/40 border border-emerald-500/30 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner">
              <CheckCircle size={32} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-1.5 flex items-center gap-1">
                ✅ Delivery Completed Successfully
              </h2>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">
                Invoice: <span className="font-mono text-emerald-400 font-extrabold text-xs">{completedInvoice.invoiceNumber}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <button 
              onClick={() => window.print()}
              className="bg-white/10 hover:bg-white/15 border border-white/10 text-white font-extrabold px-3 py-2 text-[10px] transition-colors uppercase tracking-wider flex items-center gap-1.5 rounded-lg shadow"
            >
              🖨️ Print A5 Invoice
            </button>
            <button 
              onClick={() => {
                const text = `*DELIVERY INVOICE: ${completedInvoice.invoiceNumber}*\n*Shop:* ${shopConfig.shopName}\n*Customer:* ${resolvedCustomer?.name || 'Customer'}\n*Total Bill:* ₹${completedInvoice.grandTotal}\n*Advance Paid:* ₹${completedInvoice.advanceAmount}\n*Balance Collected:* ₹${completedInvoice.finalCollectionPaymentDetail?.total || (completedInvoice.grandTotal - completedInvoice.advanceAmount)}\n*Remaining Balance:* ₹0 (PAID)\n*Delivery Date:* ${new Date(completedInvoice.deliveryDate || Date.now()).toLocaleString('en-IN')}\nThank you!`;
                const encoded = encodeURIComponent(text);
                window.open(`https://api.whatsapp.com/send?phone=${resolvedCustomer?.mobile}&text=${encoded}`, '_blank');
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-3 py-2 text-[10px] transition-colors uppercase tracking-wider flex items-center gap-1.5 rounded-lg shadow"
            >
              📱 Send WhatsApp Invoice
            </button>
            <button 
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-3 py-2 text-[10px] transition-colors uppercase tracking-wider flex items-center gap-1.5 rounded-lg shadow"
            >
              📄 Download PDF
            </button>
            <button 
              onClick={() => {
                setCompletedInvoice(null);
                onBack(); // Allow closing now
              }}
              className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold px-4 py-2 text-[10px] transition-colors uppercase tracking-wider flex items-center gap-1.5 rounded-lg shadow"
            >
              ❌ Close
            </button>
          </div>
        </div>

        {/* Live Portrait A5 optical invoice */}
        <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl shadow-2xl flex flex-col items-center">
          <div className="bg-slate-300 p-4 rounded-xl shadow-inner border border-slate-400/30">
            <OpticalInvoiceA5 
              invoice={completedInvoice} 
              customer={resolvedCustomer}
              prescription={resolvedPrescription}
              isPrintPreviewOnly={true}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
          <h2 className="text-sm font-black text-white/60 flex items-center gap-2 uppercase tracking-widest">
            <CheckCircle className="text-purple-400" size={18} /> Delivery & Collection Module
          </h2>
          {selectedInvoice && (
            <button 
              onClick={() => handleSelectInvoice(null)}
              className="text-[10px] font-black uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white/50 hover:text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 border border-white/5"
            >
              <ArrowLeft size={12} /> Return to Search List
            </button>
          )}
        </div>
        
        {!selectedInvoice ? (
          <div className="space-y-6">
            {/* Search Input Box */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 text-white/40" size={18} />
              <input 
                type="text" 
                placeholder="Search orders by invoice, phone or customer name..." 
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white font-bold tracking-wider placeholder:text-white/20 focus:outline-none focus:border-purple-500"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* List entries */}
            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-10 bg-white/5 rounded-xl border border-dashed border-white/10">
                  <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase">No pending sales orders found.</p>
                </div>
              ) : (
                filteredOrders.map(order => {
                  const cust = customers.find(c => c.id === order.customerId);
                  return (
                    <button 
                      key={order.id}
                      onClick={() => handleSelectInvoice(order)}
                      className="w-full text-left bg-[#1E293B] border border-white/5 hover:border-purple-500 hover:bg-[#1E293B]/80 p-5 rounded-2xl flex justify-between items-center transition-all group shadow-sm hover:shadow-lg"
                    >
                      <div className="space-y-1">
                        <p className="font-mono font-black text-base text-white tracking-widest text-[#94A3B8] group-hover:text-purple-400 transition-colors uppercase">{order.invoiceNumber}</p>
                        <p className="text-white/80 font-bold text-xs uppercase tracking-wide">{cust?.name || 'Walk-in Customer'}</p>
                        <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Mobile: {cust?.mobile || 'N/A'} • Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div className="text-right space-y-1 bg-black/20 px-4 py-2 rounded-xl border border-white/5">
                        <p className="text-[9px] font-black uppercase text-rose-400 tracking-wider">Balance Due</p>
                        <p className="font-mono text-lg font-black text-rose-400 leading-none">₹{order.balanceAmount}</p>
                        <p className="text-emerald-400 text-[8px] font-black uppercase tracking-wider">Paid: ₹{order.advanceAmount}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. ORDER DETAILS DISPLAY IN A5 FORMAT */}
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-xs text-[#94A3B8] uppercase tracking-widest pl-1">Selected Order Information</h3>
              <div className="bg-slate-300 p-4 rounded-2xl flex justify-center border border-slate-400/20 shadow-inner">
                <OpticalInvoiceA5 invoice={selectedInvoice} isPrintPreviewOnly={true} />
              </div>
            </div>

            {/* 2. ONE SINGLE PAYMENT COLLECTION BOX */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-xs font-black uppercase text-purple-400 tracking-widest flex items-center gap-1.5 select-none">
                  👛 Balance Payment Collection Box
                </h3>
              </div>

              {/* Displays Outstanding Bill Data */}
              <div className="grid grid-cols-3 gap-4 bg-black/40 p-4 rounded-xl text-center border border-white/5 shadow-inner">
                <div>
                  <span className="block text-[9px] text-white/40 uppercase font-black tracking-wider">Total Bill Amount</span>
                  <span className="text-lg font-mono font-black text-white">₹{selectedInvoice.grandTotal}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-emerald-400 uppercase font-black tracking-wider">Advance Received</span>
                  <span className="text-lg font-mono font-black text-emerald-400">₹{selectedInvoice.advanceAmount}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-rose-400 uppercase font-black tracking-wider">Balance Amount Due</span>
                  <span className="text-lg font-mono font-black text-rose-400 text-xl font-black">₹{selectedInvoice.balanceAmount}</span>
                </div>
              </div>

              {/* PAYMENT METHOD */}
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 block uppercase font-black tracking-wider pl-1">Payment Method</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Cash', 'Card', 'UPI', 'Mixed'] as PaymentMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handlePaymentModeChange(mode)}
                      className={`py-2 rounded-xl font-black text-[10px] uppercase tracking-wider border transition-all ${
                        paymentMode === mode
                          ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/30'
                          : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {mode} Payment
                    </button>
                  ))}
                </div>
              </div>

              {/* CASH PAYMENT SECTION */}
              {paymentMode === 'Cash' && (
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3.5">
                  <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest border-b border-white/5 pb-1 select-none">Cash Settlement Form</p>
                  <div>
                    <label className="text-[9px] text-white/40 block uppercase font-bold pl-0.5 mb-1 text-white/70">Amount Received (₹)</label>
                    <input
                      type="number"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-purple-500"
                      value={cashAmount === 0 ? '' : cashAmount}
                      onChange={(e) => setCashAmount(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-white/40 block uppercase font-bold pl-0.5 mb-1 text-white/70">Remarks</label>
                    <input
                      type="text"
                      placeholder="e.g. prompt balance cleared in cash"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* CARD PAYMENT SECTION */}
              {paymentMode === 'Card' && (
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3.5">
                  <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest border-b border-white/5 pb-1 select-none">Card Settlement Form</p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="col-span-2">
                      <label className="text-[9px] text-white/40 block uppercase font-bold mb-1 pl-0.5 text-white/70">Amount (₹)</label>
                      <input
                        type="number"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-purple-500"
                        value={cardAmount === 0 ? '' : cardAmount}
                        onChange={(e) => setCardAmount(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-white/40 block uppercase font-bold mb-1 pl-0.5 text-white/70">Card Type</label>
                      <input
                        type="text"
                        placeholder="Visa, Mastercard, RuPay..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-purple-500"
                        value={cardType}
                        onChange={(e) => setCardType(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-white/40 block uppercase font-bold mb-1 pl-0.5 text-white/70">Last 4 Digits</label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. 9823"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                        value={cardLast4}
                        onChange={(e) => setCardLast4(e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[9px] text-white/40 block uppercase font-bold mb-1 pl-0.5 text-white/70">Transaction Number / Code</label>
                      <input
                        type="text"
                        placeholder="POS Auth Code / Txn Reference"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                        value={cardTxn}
                        onChange={(e) => setCardTxn(e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[9px] text-white/40 block uppercase font-bold mb-1 pl-0.5 text-white/70">Remarks</label>
                      <input
                        type="text"
                        placeholder="Enter remarks if any"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI PAYMENT SECTION */}
              {paymentMode === 'UPI' && (
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3.5">
                  <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest border-b border-white/5 pb-1 select-none">UPI Settlement Form</p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="col-span-2">
                      <label className="text-[9px] text-white/40 block uppercase font-bold mb-1 pl-0.5 text-white/70">Amount (₹)</label>
                      <input
                        type="number"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-purple-500"
                        value={upiAmount === 0 ? '' : upiAmount}
                        onChange={(e) => setUpiAmount(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-white/40 block uppercase font-bold mb-1 pl-0.5 text-white/70">UPI App Name</label>
                      <input
                        type="text"
                        placeholder="GPay, PhonePe, Paytm..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-purple-500"
                        value={upiApp}
                        onChange={(e) => setUpiApp(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-white/40 block uppercase font-bold mb-1 pl-0.5 text-white/70">Transaction ID</label>
                      <input
                        type="text"
                        placeholder="GPay/UPI transaction ID"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                        value={upiTxnId}
                        onChange={(e) => setUpiTxnId(e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[9px] text-white/40 block uppercase font-bold mb-1 pl-0.5 text-white/70">Reference Number (UTR)</label>
                      <input
                        type="text"
                        placeholder="12-digit UTR reference code"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                        value={upiRefNo}
                        onChange={(e) => setUpiRefNo(e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[9px] text-white/40 block uppercase font-bold mb-1 pl-0.5 text-white/70">Remarks</label>
                      <input
                        type="text"
                        placeholder="Enter remarks if any"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* MIXED PAYMENT SPLITTING SECTION */}
              {paymentMode === 'Mixed' && (
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-4">
                  <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest border-b border-white/5 pb-1 select-none">Split Payment Settlement Form</p>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[9px] text-white/40 block uppercase font-bold mb-1 pl-0.5 text-white/70">Cash split (₹)</label>
                      <input
                        type="number"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-purple-500"
                        value={cashAmount === 0 ? '' : cashAmount}
                        onChange={(e) => setCashAmount(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-white/40 block uppercase font-bold mb-1 pl-0.5 text-white/70">Card split (₹)</label>
                      <input
                        type="number"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-purple-500"
                        value={cardAmount === 0 ? '' : cardAmount}
                        onChange={(e) => setCardAmount(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-white/40 block uppercase font-bold mb-1 pl-0.5 text-white/70">UPI split (₹)</label>
                      <input
                        type="number"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-purple-500"
                        value={upiAmount === 0 ? '' : upiAmount}
                        onChange={(e) => setUpiAmount(Number(e.target.value))}
                      />
                    </div>

                    {/* Card detailed split if selected cardAmount */}
                    {cardAmount > 0 && (
                      <div className="col-span-3 grid grid-cols-2 gap-2 bg-[#1E293B] p-3 rounded-lg border border-white/5">
                        <span className="col-span-2 text-[8px] font-bold text-rose-300 uppercase tracking-widest">Card Details for Split Split</span>
                        <div>
                          <label className="text-[8px] text-white/40 block font-bold uppercase">Card Type</label>
                          <input type="text" placeholder="Visa / Master" value={cardType} onChange={e => setCardType(e.target.value)} className="w-full bg-black/20 text-xs px-2 py-1 rounded text-white" />
                        </div>
                        <div>
                          <label className="text-[8px] text-white/40 block font-bold uppercase">Last 4 Digits</label>
                          <input type="text" maxLength={4} placeholder="e.g. 5432" value={cardLast4} onChange={e => setCardLast4(e.target.value)} className="w-full bg-black/20 text-xs px-2 py-1 rounded text-white font-mono" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[8px] text-white/40 block font-bold uppercase">Transaction Number</label>
                          <input type="text" value={cardTxn} onChange={e => setCardTxn(e.target.value)} className="w-full bg-black/20 text-xs px-2 py-1 rounded text-white" />
                        </div>
                      </div>
                    )}

                    {/* UPI detailed split if selected upiAmount */}
                    {upiAmount > 0 && (
                      <div className="col-span-3 grid grid-cols-3 gap-2 bg-[#1E293B] p-3 rounded-lg border border-white/5">
                        <span className="col-span-3 text-[8px] font-bold text-emerald-300 uppercase tracking-widest">UPI Details for Split Split</span>
                        <div>
                          <label className="text-[8px] text-white/40 block font-bold uppercase">UPI App</label>
                          <input type="text" placeholder="GPay" value={upiApp} onChange={e => setUpiApp(e.target.value)} className="w-full bg-black/20 text-xs px-2 py-1 rounded text-white" />
                        </div>
                        <div>
                          <label className="text-[8px] text-white/40 block font-bold uppercase">Transaction ID</label>
                          <input type="text" value={upiTxnId} onChange={e => setUpiTxnId(e.target.value)} className="w-full bg-black/20 text-xs px-1.5 py-1 rounded text-white font-mono" />
                        </div>
                        <div>
                          <label className="text-[8px] text-white/40 block font-bold uppercase">UTR Ref No</label>
                          <input type="text" value={upiRefNo} onChange={e => setUpiRefNo(e.target.value)} className="w-full bg-black/20 text-xs px-1.5 py-1 rounded text-white" />
                        </div>
                      </div>
                    )}

                    <div className="col-span-3 pt-2.5 border-t border-white/5 bg-black/20 p-2.5 rounded-lg flex justify-between items-center text-xs">
                      <span className="text-white/40 font-bold uppercase">Total Sum Received:</span>
                      <span className={`font-mono font-black text-sm px-2 py-0.5 rounded ${totalReceived === selectedInvoice.balanceAmount ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400 animate-pulse'}`}>
                        ₹{totalReceived} / ₹{selectedInvoice.balanceAmount}
                      </span>
                    </div>

                    <div className="col-span-3">
                      <label className="text-[9px] text-white/40 block uppercase font-bold pl-0.5 mb-1 text-white/70">Remarks</label>
                      <input
                        type="text"
                        placeholder="Enter remarks if any"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submitting button inside the unified grid box */}
              <button
                type="button"
                onClick={() => {
                  if (totalReceived !== selectedInvoice.balanceAmount) {
                    alert(`Verification Error: Total collected (₹${totalReceived}) must match balance amount due (₹${selectedInvoice.balanceAmount}).`);
                    return;
                  }
                  setShowConfirmPopup(true);
                }}
                className="w-full py-4 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl transition-all shadow-lg hover:shadow-purple-500/20"
              >
                📥 Confirm & Complete Delivery Action
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRMATION POPUP MODAL */}
      {showConfirmPopup && selectedInvoice && resolvedCustomer && (
        <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#1E293B]">
              <h2 className="font-extrabold text-xs uppercase text-[#94A3B8] tracking-widest">CONFIRM DELIVERY & PAYMENT</h2>
              <button onClick={() => setShowConfirmPopup(false)} className="text-white/40 hover:text-white font-bold text-sm">✖</button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-xs text-white/80">
              
              {/* Customer Info */}
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest border-b border-white/5 pb-1 select-none">Customer Information</p>
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  <p><strong>Name:</strong> <span className="text-white uppercase font-bold">{resolvedCustomer.name}</span></p>
                  <p><strong>Mobile:</strong> <span className="text-white">{resolvedCustomer.mobile}</span></p>
                  <p><strong>Customer ID:</strong> <span className="text-white font-mono">{resolvedCustomer.id}</span></p>
                  {resolvedCustomer.address && <p className="col-span-2"><strong>Address:</strong> <span className="text-white">{resolvedCustomer.address}</span></p>}
                </div>
              </div>

              {/* Prescription Details */}
              {resolvedPrescription && (
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                  <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest border-b border-white/5 pb-1 select-none">Prescription Details</p>
                  <div className="grid grid-cols-2 gap-3 mt-1.5">
                    <div className="bg-[#020617] p-2 rounded border border-white/5">
                      <span className="block font-black text-emerald-400 text-[8px] mb-1">RIGHT EYE (OD)</span>
                      <span className="text-[10px] font-mono">SPH: {resolvedPrescription.rightEye?.sph || '-'} | CYL: {resolvedPrescription.rightEye?.cyl || '-'} | AXIS: {resolvedPrescription.rightEye?.axis || '-'}</span>
                    </div>
                    <div className="bg-[#020617] p-2 rounded border border-white/5">
                      <span className="block font-black text-emerald-400 text-[8px] mb-1">LEFT EYE (OS)</span>
                      <span className="text-[10px] font-mono">SPH: {resolvedPrescription.leftEye?.sph || '-'} | CYL: {resolvedPrescription.leftEye?.cyl || '-'} | AXIS: {resolvedPrescription.leftEye?.axis || '-'}</span>
                    </div>
                    <p><strong>PD:</strong> <span className="text-white">{resolvedPrescription.pdDistance || '-'} mm</span></p>
                    <p><strong>ADD:</strong> <span className="text-white">{resolvedPrescription.rightEye?.add || resolvedPrescription.leftEye?.add || '-'}</span></p>
                    {resolvedPrescription.doctorPrescriptionDetails?.doctorName && (
                      <p className="col-span-2"><strong>Doctor Name:</strong> <span className="text-white">{resolvedPrescription.doctorPrescriptionDetails.doctorName} {resolvedPrescription.doctorPrescriptionDetails.clinicName ? `(${resolvedPrescription.doctorPrescriptionDetails.clinicName})` : ''}</span></p>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items Categorized details */}
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1.5">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest border-b border-white/5 pb-1 select-none">Purchase Specifications & Items</p>
                <div className="divide-y divide-white/5 mt-1.5">
                  {selectedInvoice.items.map((item, idx) => (
                    <div key={item.id || idx} className="py-2 flex justify-between text-xs">
                      <div>
                        <span className="font-bold text-white uppercase block">
                          {item.itemType === 'frame' ? `${item.productType || 'Frame'}` : item.itemType === 'lens' ? 'Corrective Lens' : item.itemName}
                        </span>
                        <span className="text-[10px] text-white/50">
                          {item.itemType === 'frame'
                            ? `${item.brand || ''} ${item.modelNumber || ''} ${item.color ? `(Col: ${item.color})` : ''}`
                            : item.itemType === 'lens'
                            ? `${item.lensBrand || ''} ${item.lensCategory || ''} ${item.lensFeatures?.join(', ') || ''}`
                            : item.description || ''}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-extrabold block">₹{item.finalAmount}</span>
                        <span className="text-[10px] text-white/40 block">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Box representation */}
              <div className="bg-[#1E293B] border border-white/10 p-4 rounded-xl space-y-3.5">
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest border-b border-white/10 pb-1.5 select-none text-center">Collection Payment Summary</p>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  <div className="flex justify-between">
                    <span className="text-white/50">Total Bill:</span>
                    <span className="font-bold text-white font-mono">₹{selectedInvoice.grandTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-400">Advance Paid:</span>
                    <span className="font-bold text-emerald-400 font-mono">₹{selectedInvoice.advanceAmount}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-2">
                    <span className="text-cyan-400">Balance Collected:</span>
                    <span className="font-extrabold text-cyan-400 font-mono">₹{totalReceived}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-2">
                    <span className="text-white/50">Payment Method:</span>
                    <span className="font-extrabold text-white uppercase pr-1">{paymentMode}</span>
                  </div>
                </div>

                {/* Specific payment details inside confirmation block */}
                {((paymentMode === 'Card' || (paymentMode === 'Mixed' && cardAmount > 0)) && (cardType || cardLast4 || cardTxn)) && (
                  <div className="bg-[#020617] p-2.5 rounded border border-white/5 text-[10px] space-y-0.5">
                    <span className="block font-black text-rose-300 uppercase text-[8px] tracking-wide select-none">Card Information:</span>
                    <p>Type: <span className="text-white font-semibold">{cardType || 'N/A'}</span> | Last 4: <span className="text-white font-mono">{cardLast4 || 'N/A'}</span></p>
                    <p>Txn Ref Number: <span className="text-white font-mono">{cardTxn || 'N/A'}</span></p>
                  </div>
                )}

                {((paymentMode === 'UPI' || (paymentMode === 'Mixed' && upiAmount > 0)) && (upiApp || upiTxnId || upiRefNo)) && (
                  <div className="bg-[#020617] p-2.5 rounded border border-white/5 text-[10px] space-y-0.5">
                    <span className="block font-black text-emerald-300 uppercase text-[8px] tracking-wide select-none">UPI Information:</span>
                    <p>App Name: <span className="text-white font-semibold">{upiApp || 'N/A'}</span> | Txn ID: <span className="text-white font-mono">{upiTxnId || 'N/A'}</span></p>
                    <p>Ref No (UTR): <span className="text-white font-mono">{upiRefNo || 'N/A'}</span></p>
                  </div>
                )}

                {paymentMode === 'Mixed' && (
                  <div className="bg-[#020617] p-2.5 rounded border border-white/5 text-[10px] space-y-0.5">
                    <span className="block font-black text-purple-300 uppercase text-[8px] tracking-wide select-none">Mixed Split Split Breakdown:</span>
                    <p>Cash Portion: <span className="font-mono text-white">₹{cashAmount}</span> | Card Portion: <span className="font-mono text-white">₹{cardAmount}</span> | UPI Portion: <span className="font-mono text-white">₹{upiAmount}</span></p>
                  </div>
                )}

                {remarks && (
                  <p className="text-[10px] italic border-t border-white/5 pt-1 text-white/50 text-center">
                    Billing Remarks: <span className="text-white not-italic font-medium">{remarks}</span>
                  </p>
                )}

                <div className="text-center pt-2 border-t border-white/10">
                  <span className="text-[10.5px] font-black text-emerald-450 block uppercase tracking-wide">
                    Amount Collected: ₹{totalReceived}
                  </span>
                </div>
              </div>

            </div>

            {/* Popup Buttons */}
            <div className="p-4 border-t border-white/10 bg-[#1E293B] flex gap-3">
              <button 
                onClick={() => setShowConfirmPopup(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 text-xs rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-1 border border-white/15"
              >
                ✏ Edit Payment
              </button>
              <button 
                onClick={handleCollect}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3 text-xs rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-1 shadow-lg shadow-emerald-900/40"
              >
                ✅ Collect Payment & Complete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

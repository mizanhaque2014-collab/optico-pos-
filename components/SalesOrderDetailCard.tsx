import React, { useState } from 'react';
import { Invoice, Customer, Prescription } from '@/lib/types';
import { shopConfig } from '@/lib/shopConfig';
import { FileText, Printer, Download, Send, RefreshCw, Eye, Edit, Play } from 'lucide-react';

interface Props {
  inv: Invoice;
  customer?: Customer;
  prescription?: Prescription | null;
  onViewPrescription?: (p: Prescription) => void;
  onPrintA5?: (inv: Invoice) => void;
  onEditOrder?: (inv: Invoice) => void;
  onContinueBilling?: (inv: Invoice) => void;
}

export function SalesOrderDetailCard({ inv, customer, prescription, onViewPrescription, onPrintA5, onEditOrder, onContinueBilling }: Props) {
  const handleShareWhatsApp = () => {
    if (!customer) return;
    let text = `*INVOICE: ${inv.invoiceNumber}*\n*Shop:* ${shopConfig.shopName}\n*Customer:* ${customer.name}\n*Total Bill:* ₹${inv.grandTotal}\n*Paid:* ₹${inv.advanceAmount}\n*Balance:* ₹${inv.balanceAmount}\nThank you for your business!`;
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?phone=${customer.mobile}&text=${encoded}`, '_blank');
  };

  const frames = inv.items.filter(item => item.itemType === 'frame' && item.productType !== 'Sunglass');
  const lenses = inv.items.filter(item => item.itemType === 'lens');
  const sunglasses = inv.items.filter(item => item.itemType === 'frame' && item.productType === 'Sunglass');
  const accessories = inv.items.filter(item => item.itemType === 'manual');

  return (
    <div className="bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl flex flex-col gap-6 overflow-hidden text-white w-full">
      {/* 1. CUSTOMER DETAILS */}
      <div className="bg-[#1E293B] p-5 border-b border-white/5">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
          <div>
            <h3 className="text-lg font-black uppercase tracking-widest text-white">{customer?.name || 'Walk-in Customer'}</h3>
            <div className="text-xs text-white/60 mt-2 space-y-1">
               <p><span className="text-white/40 font-bold uppercase tracking-wider">Customer ID:</span> {customer?.id || 'N/A'}</p>
               <p><span className="text-white/40 font-bold uppercase tracking-wider">Mobile Number:</span> {customer?.mobile || 'N/A'}</p>
               <p><span className="text-white/40 font-bold uppercase tracking-wider">Address:</span> {customer?.address || 'N/A'}</p>
            </div>
          </div>
          <div className="text-left md:text-right">
             <div className="bg-purple-500/10 border border-purple-500/20 px-3 py-2 rounded-lg inline-block text-left md:text-right">
                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Sales Order Number</p>
                <p className="text-xl font-black text-white tracking-widest font-mono">{inv.invoiceNumber}</p>
             </div>
             <div className="text-xs text-white/60 mt-3 space-y-1">
                <p><span className="text-white/40 font-bold uppercase tracking-wider">Order Date:</span> {new Date(inv.createdAt).toLocaleDateString()}</p>
                <p><span className="text-white/40 font-bold uppercase tracking-wider">Delivery Date:</span> {inv.deliveryDate ? new Date(inv.deliveryDate).toLocaleDateString() : 'N/A'}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        
        {/* ORDER STATUS */}
        <div className="bg-[#1E293B] border border-white/5 p-4 rounded-xl">
           <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Order Status</h4>
           <div className="flex flex-wrap gap-2">
             {['Pending', 'Ordered', 'In Lab', 'Ready', 'Delivered', 'Cancelled'].map(status => {
                const isActive = inv.status === status;
                let colorClass = "bg-white/5 text-white/40 border-white/10";
                if (isActive) {
                  switch(status) {
                    case 'Delivered': colorClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"; break;
                    case 'Cancelled': colorClass = "bg-rose-500/20 text-rose-400 border-rose-500/30"; break;
                    case 'Ready': colorClass = "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"; break;
                    default: colorClass = "bg-purple-500/20 text-purple-400 border-purple-500/30"; break;
                  }
                }
                return (
                  <span key={status} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${colorClass}`}>
                    {isActive ? `✓ ${status}` : status}
                  </span>
                );
             })}
           </div>
        </div>

        {/* FRAME DETAILS */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
             👓 Frame Details
          </h4>
          {frames.length === 0 ? (
            <p className="text-xs font-bold text-white/30 uppercase tracking-wider p-4 bg-white/5 rounded-xl text-center">No Frame Selected</p>
          ) : (
            frames.map((frame, idx) => (
              <div key={idx} className="bg-[#1E293B] border border-white/5 p-4 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Brand</span><span className="font-bold text-white">{(frame as any).brand || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Name</span><span className="font-bold text-white">{(frame as any).frameName || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Code</span><span className="font-bold text-white">{(frame as any).frameCode || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Model Number</span><span className="font-bold text-white">{(frame as any).modelNumber || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Size</span><span className="font-bold text-white">{(frame as any).frameSize || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Colour</span><span className="font-bold text-white">{(frame as any).color || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Shape</span><span className="font-bold text-white">{(frame as any).frameShape || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Material</span><span className="font-bold text-white">{(frame as any).frameMaterial || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Category</span><span className="font-bold text-white">{(frame as any).frameCategory || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">SKU / Barcode</span><span className="font-bold text-white">{(frame as any).barcode || 'N/A'}</span></div>
                 <div className="col-span-2 md:col-span-4 border-t border-white/5 pt-3 mt-1 grid grid-cols-4 gap-4 bg-white/5 p-3 rounded-lg">
                    <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Quantity</span><span className="font-black text-white">{frame.quantity}</span></div>
                    <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Unit Price</span><span className="font-black text-white">₹{frame.sellingPrice}</span></div>
                    <div><span className="block text-[9px] text-rose-400 uppercase tracking-wider mb-1">Discount</span><span className="font-black text-rose-400">₹{frame.discount}</span></div>
                    <div><span className="block text-[9px] text-emerald-400 uppercase tracking-wider mb-1">Final Amount</span><span className="font-black text-emerald-400 text-sm">₹{frame.finalAmount}</span></div>
                 </div>
              </div>
            ))
          )}
        </div>

        {/* LENS DETAILS */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
             👁️ Lens Details
          </h4>
          {lenses.length === 0 ? (
            <p className="text-xs font-bold text-white/30 uppercase tracking-wider p-4 bg-white/5 rounded-xl text-center">No Lens Selected</p>
          ) : (
            lenses.map((lens, idx) => (
              <div key={idx} className="bg-[#1E293B] border border-white/5 p-4 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Brand</span><span className="font-bold text-white">{(lens as any).lensBrand || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Name</span><span className="font-bold text-white">{(lens as any).lensName || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Type</span><span className="font-bold text-white">{(lens as any).lensType || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Category</span><span className="font-bold text-white">{(lens as any).lensCategory || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Index</span><span className="font-bold text-white">{(lens as any).lensIndex || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Material</span><span className="font-bold text-white">{(lens as any).lensMaterial || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Coating</span><span className="font-bold text-white">{(lens as any).lensCoating || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Warranty</span><span className="font-bold text-white">{(lens as any).warranty || 'N/A'}</span></div>
                 
                 <div className="col-span-2 md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 bg-white/5 p-3 rounded-lg border border-white/5">
                   <div className="col-span-2 md:col-span-4 mb-1"><span className="text-[9px] text-white/40 uppercase tracking-wider font-bold">Lens Features</span></div>
                   <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${((lens.lensFeatures as string[])||[]).includes('Blue Cut') ? 'bg-emerald-500' : 'bg-white/10'}`}></div><span className="text-[10px] uppercase font-bold text-white/80">Blue Cut</span></div>
                   <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${((lens.lensFeatures as string[])||[]).includes('UV Protection') ? 'bg-emerald-500' : 'bg-white/10'}`}></div><span className="text-[10px] uppercase font-bold text-white/80">UV Protection</span></div>
                   <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${((lens.lensFeatures as string[])||[]).includes('Anti Reflection') ? 'bg-emerald-500' : 'bg-white/10'}`}></div><span className="text-[10px] uppercase font-bold text-white/80">Anti Reflection</span></div>
                   <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${((lens.lensFeatures as string[])||[]).includes('Progressive') ? 'bg-emerald-500' : 'bg-white/10'}`}></div><span className="text-[10px] uppercase font-bold text-white/80">Progressive</span></div>
                   <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${((lens.lensFeatures as string[])||[]).includes('Photochromic') ? 'bg-emerald-500' : 'bg-white/10'}`}></div><span className="text-[10px] uppercase font-bold text-white/80">Photochromic</span></div>
                   <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${((lens.lensFeatures as string[])||[]).includes('Polarized') ? 'bg-emerald-500' : 'bg-white/10'}`}></div><span className="text-[10px] uppercase font-bold text-white/80">Polarized</span></div>
                   <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${((lens.lensFeatures as string[])||[]).includes('Scratch Resistant') ? 'bg-emerald-500' : 'bg-white/10'}`}></div><span className="text-[10px] uppercase font-bold text-white/80">Scratch Resistant</span></div>
                 </div>

                 <div className="col-span-2 md:col-span-4 border-t border-white/5 pt-3 mt-1 grid grid-cols-4 gap-4 bg-white/5 p-3 rounded-lg">
                    <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Quantity</span><span className="font-black text-white">{lens.quantity}</span></div>
                    <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Unit Price</span><span className="font-black text-white">₹{lens.sellingPrice}</span></div>
                    <div><span className="block text-[9px] text-rose-400 uppercase tracking-wider mb-1">Discount</span><span className="font-black text-rose-400">₹{lens.discount}</span></div>
                    <div><span className="block text-[9px] text-emerald-400 uppercase tracking-wider mb-1">Final Amount</span><span className="font-black text-emerald-400 text-sm">₹{lens.finalAmount}</span></div>
                 </div>
              </div>
            ))
          )}
        </div>

        {/* PRESCRIPTION DETAILS */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
             📋 Prescription Details
          </h4>
          {!prescription ? (
            <p className="text-xs font-bold text-white/30 uppercase tracking-wider p-4 bg-white/5 rounded-xl text-center">No Prescription Linked</p>
          ) : (
            <div className="bg-[#1E293B] border border-white/5 p-4 rounded-xl space-y-4">
               {/* RIGHT EYE */}
               <div>
                 <span className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 bg-white/5 px-2 py-1 rounded inline-block">Right Eye (OD)</span>
                 <div className="grid grid-cols-5 gap-2">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                      <span className="block text-[9px] text-white/40 uppercase font-bold tracking-wider mb-1">SPH</span>
                      <span className="font-mono text-white text-xs">{prescription.rightEye?.sph || '-'}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                      <span className="block text-[9px] text-white/40 uppercase font-bold tracking-wider mb-1">CYL</span>
                      <span className="font-mono text-white text-xs">{prescription.rightEye?.cyl || '-'}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                      <span className="block text-[9px] text-white/40 uppercase font-bold tracking-wider mb-1">AXIS</span>
                      <span className="font-mono text-white text-xs">{prescription.rightEye?.axis || '-'}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                      <span className="block text-[9px] text-white/40 uppercase font-bold tracking-wider mb-1">ADD</span>
                      <span className="font-mono text-white text-xs">{prescription.rightEye?.add || '-'}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                      <span className="block text-[9px] text-white/40 uppercase font-bold tracking-wider mb-1">V/A</span>
                      <span className="font-mono text-white text-xs">{prescription.rightEye?.va || '-'}</span>
                    </div>
                 </div>
               </div>

               {/* LEFT EYE */}
               <div>
                 <span className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 bg-white/5 px-2 py-1 rounded inline-block">Left Eye (OS)</span>
                 <div className="grid grid-cols-5 gap-2">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                      <span className="block text-[9px] text-white/40 uppercase font-bold tracking-wider mb-1">SPH</span>
                      <span className="font-mono text-white text-xs">{prescription.leftEye?.sph || '-'}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                      <span className="block text-[9px] text-white/40 uppercase font-bold tracking-wider mb-1">CYL</span>
                      <span className="font-mono text-white text-xs">{prescription.leftEye?.cyl || '-'}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                      <span className="block text-[9px] text-white/40 uppercase font-bold tracking-wider mb-1">AXIS</span>
                      <span className="font-mono text-white text-xs">{prescription.leftEye?.axis || '-'}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                      <span className="block text-[9px] text-white/40 uppercase font-bold tracking-wider mb-1">ADD</span>
                      <span className="font-mono text-white text-xs">{prescription.leftEye?.add || '-'}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                      <span className="block text-[9px] text-white/40 uppercase font-bold tracking-wider mb-1">V/A</span>
                      <span className="font-mono text-white text-xs">{prescription.leftEye?.va || '-'}</span>
                    </div>
                 </div>
               </div>

               {/* COMMON VALUES */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 p-3 rounded-lg border border-white/10">
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">PD Distance</span><span className="font-bold text-white">{prescription.pdDistance || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">PD Near</span><span className="font-bold text-white">{prescription.pdNear || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Doctor Name</span><span className="font-bold text-white">{prescription.doctorPrescriptionDetails?.doctorName || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Remarks</span><span className="font-bold text-white truncate block">{prescription.remarks || 'N/A'}</span></div>
               </div>
            </div>
          )}
        </div>

        {/* SUNGLASS DETAILS */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
             🕶️ Sunglass Details
          </h4>
          {sunglasses.length === 0 ? (
            <p className="text-xs font-bold text-white/30 uppercase tracking-wider p-4 bg-white/5 rounded-xl text-center">No Sunglass Ordered</p>
          ) : (
            sunglasses.map((sunglass, idx) => (
              <div key={idx} className="bg-[#1E293B] border border-white/5 p-4 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Brand</span><span className="font-bold text-white">{(sunglass as any).brand || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Model</span><span className="font-bold text-white">{(sunglass as any).modelNumber || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Colour</span><span className="font-bold text-white">{(sunglass as any).color || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Lens Colour</span><span className="font-bold text-white">{(sunglass as any).lensColor || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Lens Type</span><span className="font-bold text-white">{(sunglass as any).lensType || 'N/A'}</span></div>
                 
                 <div className="col-span-2 md:col-span-4 border-t border-white/5 pt-3 mt-1 grid grid-cols-4 gap-4 bg-white/5 p-3 rounded-lg">
                    <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Quantity</span><span className="font-black text-white">{sunglass.quantity}</span></div>
                    <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Unit Price</span><span className="font-black text-white">₹{sunglass.sellingPrice}</span></div>
                    <div><span className="block text-[9px] text-rose-400 uppercase tracking-wider mb-1">Discount</span><span className="font-black text-rose-400">₹{sunglass.discount}</span></div>
                    <div><span className="block text-[9px] text-emerald-400 uppercase tracking-wider mb-1">Final Amount</span><span className="font-black text-emerald-400 text-sm">₹{sunglass.finalAmount}</span></div>
                 </div>
              </div>
            ))
          )}
        </div>

        {/* ACCESSORIES */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
             🛍️ Accessories
          </h4>
          {accessories.length === 0 ? (
            <p className="text-xs font-bold text-white/30 uppercase tracking-wider p-4 bg-white/5 rounded-xl text-center">No Accessories Ordered</p>
          ) : (
            <div className="bg-[#1E293B] border border-white/5 rounded-xl overflow-hidden">
               <div className="grid grid-cols-3 gap-4 p-3 bg-white/5 border-b border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40">
                  <div className="col-span-2">Item Details</div>
                  <div className="text-right">Qty & Price</div>
               </div>
               <div className="divide-y divide-white/5">
                 {accessories.map((acc, idx) => {
                    // Check if it matches requested accessory keywords
                    let accessoryType = 'Accessories';
                    const name = (acc.itemName || '').toLowerCase();
                    if (name.includes('clean')) accessoryType = 'Cleaning Kit';
                    if (name.includes('hard case')) accessoryType = 'Hard Case';
                    if (name.includes('soft case')) accessoryType = 'Soft Case';
                    if (name.includes('chain')) accessoryType = 'Chain';
                    if (name.includes('cloth')) accessoryType = 'Cloth';

                    return (
                      <div key={idx} className="grid grid-cols-3 gap-4 p-4 items-center">
                         <div className="col-span-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-1 rounded inline-block mb-1">{accessoryType}</span>
                            <p className="text-xs font-bold text-white">{acc.itemName}</p>
                            {acc.description && <p className="text-[10px] text-white/50 mt-0.5">{acc.description}</p>}
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-bold text-white">{acc.quantity}x</p>
                            <p className="text-xs font-black text-emerald-400">₹{acc.finalAmount}</p>
                         </div>
                      </div>
                    );
                 })}
               </div>
            </div>
          )}
        </div>

        {/* BILL SUMMARY & PAYMENT DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* BILL SUMMARY */}
           <div className="bg-[#1E293B] border border-white/5 p-4 rounded-xl space-y-3">
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Bill Summary</h4>
              <div className="space-y-2 text-xs">
                 <div className="flex justify-between text-white/60"><span>Product Total:</span> <span className="font-mono text-white">₹{inv.subTotal}</span></div>
                 <div className="flex justify-between text-white/60"><span>Discount:</span> <span className="font-mono text-rose-400">-₹{inv.totalDiscount}</span></div>
                 <div className="flex justify-between text-white/60"><span>Tax:</span> <span className="font-mono text-white">₹0</span></div>
                 <div className="flex justify-between text-white/80 font-bold border-t border-white/5 pt-2"><span>Grand Total:</span> <span className="font-mono text-white">₹{inv.grandTotal}</span></div>
                 <div className="flex justify-between text-emerald-400 font-bold"><span>Advance Received:</span> <span className="font-mono">₹{inv.advanceAmount}</span></div>
                 <div className="flex justify-between text-rose-400 font-black border-t border-white/5 pt-2 mt-1"><span>Balance Amount:</span> <span className="font-mono text-sm">₹{inv.balanceAmount}</span></div>
                 <div className="flex justify-between text-emerald-400 font-black mt-1"><span>Final Amount:</span> <span className="font-mono text-sm">₹{inv.grandTotal - inv.totalDiscount}</span></div>
              </div>
           </div>

           {/* PAYMENT DETAILS */}
           <div className="bg-[#1E293B] border border-white/5 p-4 rounded-xl space-y-3">
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Payment Details</h4>
              <div className="space-y-2 text-xs">
                 <div className="flex justify-between items-center text-white/60 mb-2 border-b border-white/5 pb-2">
                    <span>Payment Mode:</span> 
                    <span className="font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 uppercase tracking-wider text-[10px]">{inv.paymentMode}</span>
                 </div>
                 
                 {(inv.paymentMode === 'Cash' || inv.paymentMode === 'Mixed') && (
                   <div className="flex justify-between text-white/80"><span>Cash Amount:</span> <span className="font-mono font-bold text-white">₹{inv.paymentDetail?.cash || 0}</span></div>
                 )}
                 {(inv.paymentMode === 'Card' || inv.paymentMode === 'Mixed') && (
                   <>
                     <div className="flex justify-between text-white/80"><span>Card Amount:</span> <span className="font-mono font-bold text-white">₹{inv.paymentDetail?.card || 0}</span></div>
                     <div className="flex justify-between text-white/50 text-[10px]"><span>Card Reference:</span> <span>{inv.paymentDetail?.cardLast4 || 'N/A'}</span></div>
                   </>
                 )}
                 {(inv.paymentMode === 'UPI' || inv.paymentMode === 'Mixed') && (
                   <>
                     <div className="flex justify-between text-white/80"><span>UPI Amount:</span> <span className="font-mono font-bold text-white">₹{inv.paymentDetail?.upi || 0}</span></div>
                     <div className="flex justify-between text-white/50 text-[10px]"><span>UPI Reference:</span> <span>{inv.paymentDetail?.upiTransactionId || 'N/A'}</span></div>
                   </>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="bg-[#1E293B] p-4 border-t border-white/5 flex flex-wrap gap-2 justify-end">
         {prescription && onViewPrescription && (
           <button 
             onClick={() => onViewPrescription(prescription)}
             className="px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 font-bold text-[10px] uppercase tracking-widest rounded-lg border border-yellow-500/20 transition-colors flex items-center gap-2"
           >
             <Eye size={14} /> View Prescription
           </button>
         )}
         {onPrintA5 && (
           <button 
             onClick={() => onPrintA5(inv)}
             className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold text-[10px] uppercase tracking-widest rounded-lg border border-blue-500/20 transition-colors flex items-center gap-2"
           >
             <Printer size={14} /> Print Sales Order
           </button>
         )}
         {onPrintA5 && (
           <button 
             onClick={() => onPrintA5(inv)}
             className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg border border-white/10 transition-colors flex items-center gap-2"
           >
             <Download size={14} /> Download PDF
           </button>
         )}
         <button 
           onClick={handleShareWhatsApp}
           className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase tracking-widest rounded-lg border border-emerald-500/20 transition-colors flex items-center gap-2"
         >
           <Send size={14} /> WhatsApp Order
         </button>
         {inv.status !== 'Delivered' && inv.status !== 'Cancelled' && onContinueBilling && (
           <button 
             onClick={() => onContinueBilling(inv)}
             className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] uppercase tracking-widest rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-purple-900/50"
           >
             <Play size={14} /> Continue Billing
           </button>
         )}
         {inv.status !== 'Delivered' && inv.status !== 'Cancelled' && onEditOrder && (
           <button 
             onClick={() => onEditOrder(inv)}
             className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-bold text-[10px] uppercase tracking-widest rounded-lg border border-white/10 transition-colors flex items-center gap-2"
           >
             <Edit size={14} /> Edit Order
           </button>
         )}
      </div>

    </div>
  );
}

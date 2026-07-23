'use client';

import React, { useState } from 'react';
import { Invoice, Customer, Prescription } from '@/lib/types';
import { shopConfig } from '@/lib/shopConfig';
import { FileText, Printer, Download, Send, RefreshCw, Eye } from 'lucide-react';

interface Props {
  inv: Invoice;
  customer: Customer;
  prescription?: Prescription | null;
  onViewPrescription: (p: Prescription) => void;
  onViewInvoice: (inv: Invoice) => void;
  onPrintA5: (inv: Invoice) => void;
}

export function InvoiceDetailCard({ inv, customer, prescription, onViewPrescription, onViewInvoice, onPrintA5 }: Props) {
  const handleShareWhatsApp = () => {
    let text = `*INVOICE: ${inv.invoiceNumber}*\n*Shop:* ${shopConfig.shopName}\n*Customer:* ${customer.name}\n*Total Bill:* ₹${inv.grandTotal}\n*Paid:* ₹${inv.advanceAmount}\n*Balance:* ₹${inv.balanceAmount}\nThank you for your business!`;
    
    if (inv.status === 'Delivered' && inv.type === 'Sales Order') {
      const collected = inv.finalCollectionPaymentDetail?.total || (inv.grandTotal - inv.advanceAmount);
      text = `*DELIVERY INVOICE: ${inv.invoiceNumber}*\n*Shop:* ${shopConfig.shopName}\n*Customer:* ${customer.name}\n*Total Bill:* ₹${inv.grandTotal}\n*Advance Paid:* ₹${inv.advanceAmount}\n*Balance Collected:* ₹${collected}\n*Remaining Balance:* ₹0 (PAID)\n*Delivery Date:* ${inv.deliveryDate ? new Date(inv.deliveryDate).toLocaleString('en-IN') : 'N/A'}\n*Prescription:* ${prescription ? `OD: SPH ${prescription.rightEye?.sph || '-'} CYL ${prescription.rightEye?.cyl || '-'}, OS: SPH ${prescription.leftEye?.sph || '-'} CYL ${prescription.leftEye?.cyl || '-'}` : 'N/A'}\nThank you for your business!`;
    }
    
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?phone=${customer.mobile}&text=${encoded}`, '_blank');
  };

  return (
    <div className="bg-[#1E293B] border border-white/10 p-5 rounded-2xl shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-white/5 pb-3">
        <div>
          <h4 className="text-sm font-black text-white uppercase tracking-widest">{inv.invoiceNumber}</h4>
          <p className="text-[10px] text-white/50 font-bold uppercase mt-1">Date: {new Date(inv.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded ${inv.type === 'Direct Sale' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'}`}>
            {inv.type}
          </span>
          <div className="mt-2">
            <span className={`text-[10px] font-black uppercase tracking-wider ${inv.status === 'Delivered' ? 'text-emerald-400' : 'text-yellow-400'}`}>
              Status: {inv.status}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-2 gap-4 text-xs">
         <div>
            <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Customer Details</p>
            <p className="text-white font-bold">{customer.name}</p>
            <p className="text-white/60">{customer.mobile}</p>
            <p className="text-white/40 text-[10px] mt-1">ID: {customer.id}</p>
         </div>
         {inv.prescriptionId && (
           <div className="text-right flex flex-col items-end justify-start">
              <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Prescription Linked</p>
              <p className="text-cyan-400 font-mono text-[10px] mt-1">{inv.prescriptionId}</p>
              {prescription && (
                <button 
                  onClick={() => onViewPrescription(prescription)}
                  className="mt-2 text-[10px] font-bold uppercase tracking-wider bg-cyan-900/40 hover:bg-cyan-900/60 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
                >
                  <Eye size={12} /> View Prescription
                </button>
              )}
           </div>
         )}
      </div>

      {/* Product Details */}
      <div className="bg-[#0F172A] rounded-xl border border-white/5 overflow-hidden">
        <div className="px-3 py-2 bg-slate-800/50 border-b border-white/5 text-[9px] text-white/50 uppercase font-black tracking-wider flex justify-between">
           <span>Product Details</span>
           <span>Qty & Price</span>
        </div>
        <div className="p-3 space-y-3">
           {inv.items.map((item: any, i: number) => (
             <div key={i} className="flex justify-between items-start text-xs border-b border-white/5 last:border-0 pb-3 last:pb-0">
                <div className="space-y-1 w-2/3 pr-2">
                  <p className="font-bold text-white uppercase tracking-wider text-[10px] text-cyan-400">{item.itemType}</p>
                  
                  {item.itemType === 'frame' && (
                    <>
                      <p className="text-white/90 font-bold">{item.brand} {item.modelNumber}</p>
                      <p className="text-white/60 text-[10px]">Color: {item.color || 'N/A'}</p>
                    </>
                  )}
                  
                  {item.itemType === 'lens' && (
                    <>
                      <p className="text-white/90 font-bold">{item.lensBrand} {item.lensCategory}</p>
                      <p className="text-white/60 text-[10px]">{(item.lensFeatures||[]).join(', ') || 'Standard'}</p>
                    </>
                  )}
                  
                  {item.itemType === 'manual' && (
                    <p className="text-white/90 font-bold">{item.itemName}</p>
                  )}
                </div>
                <div className="text-right w-1/3">
                  <p className="text-white font-bold">{item.quantity}x</p>
                  {item.discount > 0 ? (
                    <>
                      <p className="text-white/40 line-through text-[9px]">₹{item.sellingPrice}</p>
                      <p className="text-emerald-400 font-bold">₹{item.finalAmount}</p>
                    </>
                  ) : (
                    <p className="text-emerald-400 font-bold">₹{item.finalAmount}</p>
                  )}
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-slate-900 rounded-xl p-4 border border-white/5">
         <div className="grid grid-cols-2 gap-4">
            <div className="border-r border-white/5 pr-4">
              <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider mb-2">Bill Summary</p>
              <div className="space-y-1 text-xs text-white/70">
                 <div className="flex justify-between"><span>Grand Total:</span> <span className="text-white font-bold">₹{inv.grandTotal}</span></div>
                 <div className="flex justify-between"><span>Discount:</span> <span className="text-rose-400 font-bold">-₹{inv.totalDiscount}</span></div>
                 <div className="flex justify-between"><span>Advance:</span> <span className="text-emerald-400 font-bold">₹{inv.advanceAmount}</span></div>
                 <div className="flex justify-between mt-2 pt-2 border-t border-white/5 text-rose-400"><span>Balance:</span> <span className="font-bold text-sm">₹{inv.balanceAmount}</span></div>
                 <div className="flex justify-between mt-1 text-emerald-400"><span>Final Amount:</span> <span className="font-bold text-sm">₹{inv.grandTotal - inv.totalDiscount}</span></div>
              </div>
            </div>
            <div className="pl-2">
              <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider mb-2">Payment Mode</p>
              <span className="text-[10px] font-black uppercase text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">{inv.paymentMode}</span>
              <div className="mt-3 space-y-1 text-[10px] text-white/60">
                 {inv.paymentDetail?.cash > 0 && <p className="flex justify-between"><span>Cash:</span> <span className="text-white font-bold">₹{inv.paymentDetail.cash}</span></p>}
                 {inv.paymentDetail?.card > 0 && <p className="flex justify-between"><span>Card {inv.paymentDetail.cardLast4 ? `(${inv.paymentDetail.cardLast4})` : ''}:</span> <span className="text-white font-bold">₹{inv.paymentDetail.card}</span></p>}
                 {inv.paymentDetail?.upi > 0 && <p className="flex justify-between"><span>UPI {inv.paymentDetail.upiTransactionId ? `(${inv.paymentDetail.upiTransactionId})` : ''}:</span> <span className="text-white font-bold">₹{inv.paymentDetail.upi}</span></p>}
                 {inv.paymentDetail?.remarks && <p className="mt-2 text-[9px] italic text-white/40">Note: {inv.paymentDetail.remarks}</p>}
              </div>
            </div>
         </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-end mt-2 pt-3 border-t border-white/5">
         <button 
           onClick={() => onViewInvoice(inv)} 
           className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors border border-white/10"
         >
           <FileText size={12} /> View Invoice
         </button>
         <button 
           onClick={() => onPrintA5(inv)} 
           className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded font-bold text-[10px] uppercase tracking-wider transition-colors border border-blue-500/30"
         >
           <Printer size={12} /> Print A5
         </button>
         <button 
           onClick={() => onPrintA5(inv)} 
           className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors border border-white/10"
         >
           <Download size={12} /> Download PDF
         </button>
         <button 
           onClick={handleShareWhatsApp} 
           className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded font-bold text-[10px] uppercase tracking-wider transition-colors border border-emerald-500/30"
         >
           <Send size={12} /> WhatsApp Invoice
         </button>
         <button 
           onClick={() => onPrintA5(inv)} 
           className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors border border-white/10"
         >
           <RefreshCw size={12} /> Reprint
         </button>
      </div>
    </div>
  );
}

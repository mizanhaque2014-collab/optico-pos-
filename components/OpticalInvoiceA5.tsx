'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Customer, Invoice, OrderItem, Prescription, PaymentMode, PaymentDetail } from '@/lib/types';
import { useStore } from '@/lib/store';
import { Receipt, Phone, MapPin, Award, FileText, Send, Printer, Download, CreditCard, CheckCircle } from 'lucide-react';

interface OpticalInvoiceA5Props {
  invoice?: Invoice | null;
  customer?: Customer | null;
  prescription?: Prescription | null;
  type?: 'Direct Sale' | 'Sales Order';
  onClose?: () => void;
  isPrintPreviewOnly?: boolean;
}

export function OpticalInvoiceA5({
  invoice,
  customer: propCustomer,
  prescription: propPrescription,
  type: propType,
  onClose,
  isPrintPreviewOnly = false,
}: OpticalInvoiceA5Props) {
  const store = useStore();
  const customers = useMemo(() => store.getCustomers(), [store]);

  // Resolve Customer
  const resolvedCustomer = useMemo(() => {
    if (propCustomer) return propCustomer;
    if (invoice) {
      return customers.find((c) => c.id === invoice.customerId) || null;
    }
    return null;
  }, [propCustomer, invoice, customers]);

  // Resolve Prescription
  const resolvedPrescription = useMemo(() => {
    if (propPrescription) return propPrescription;
    if (invoice && resolvedCustomer) {
      if (invoice.prescriptionId) {
        return resolvedCustomer.prescriptions?.find((p) => p.id === invoice.prescriptionId) || null;
      }
      return resolvedCustomer.prescriptions?.[resolvedCustomer.prescriptions.length - 1] || null;
    }
    if (resolvedCustomer) {
      return resolvedCustomer.prescriptions?.[resolvedCustomer.prescriptions.length - 1] || null;
    }
    return null;
  }, [propPrescription, invoice, resolvedCustomer]);

  // Fallback structures if empty
  const clientCustomer = resolvedCustomer || {
    id: 'PT-NEW',
    name: 'Walk-in Customer / Guest',
    mobile: 'N/A',
    address: 'N/A',
  };

  const clientPrescription = resolvedPrescription || null;

  const invoiceItems = invoice?.items || [];
  const finalSubTotal = invoice?.subTotal || 0;
  const finalTotalDiscount = invoice?.totalDiscount || 0;
  const finalGrandTotal = invoice?.grandTotal || 0;
  const finalAdvance = invoice?.advanceAmount || 0;
  const finalBalance = invoice?.balanceAmount || 0;
  const finalPaymentMode = invoice?.paymentMode || 'Cash';
  const finalPaymentDetail = invoice?.paymentDetail || { cash: 0, upi: 0, card: 0, total: 0 };
  const invoiceNum = invoice?.invoiceNumber || 'INV-DRAFT';

  const invoiceDate = invoice?.createdAt 
    ? new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Draft';

  const deliveryDateString = invoice?.deliveryDate
    ? new Date(invoice.deliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : invoice?.createdAt
    ? new Date(invoice.createdAt + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Draft';

  const invoiceType = invoice?.type || propType || 'Direct Sale';

  // Filters to find frame, lens, sunglass details
  const detailsOfCategories = useMemo(() => {
    let frameSpec = 'N/A';
    let lensSpec = 'N/A';
    let sunglassSpec = 'N/A';
    let accessories = 'N/A';
    let services = 'N/A';

    invoiceItems.forEach((item) => {
      const brandStr = item.brand || item.lensBrand || item.itemName || '';
      const modelStr = item.modelNumber || item.lensCategory || '';
      const colorStr = item.color ? ` (Col: ${item.color})` : '';
      const qtyStr = ` [Qty: ${item.quantity}]`;
      const finalStr = `${brandStr} ${modelStr}${colorStr}${qtyStr}`;

      if (item.itemType === 'frame') {
        if (item.productType === 'Sunglass') {
          sunglassSpec = sunglassSpec === 'N/A' ? finalStr : `${sunglassSpec}, ${finalStr}`;
        } else {
          frameSpec = frameSpec === 'N/A' ? finalStr : `${frameSpec}, ${finalStr}`;
        }
      } else if (item.itemType === 'lens') {
        const featStr = item.lensFeatures && item.lensFeatures.length > 0 ? ` (${item.lensFeatures.join(', ')})` : '';
        lensSpec = lensSpec === 'N/A' ? `${finalStr}${featStr}` : `${lensSpec}, ${finalStr}${featStr}`;
      } else {
        if (item.productType === 'Accessories') {
          accessories = accessories === 'N/A' ? finalStr : `${accessories}, ${finalStr}`;
        } else if (item.productType === 'Repair Charge' || item.productType === 'Service Charge') {
          services = services === 'N/A' ? finalStr : `${services}, ${finalStr}`;
        } else {
          services = services === 'N/A' ? finalStr : `${services}, ${finalStr}`;
        }
      }
    });

    return { frameSpec, lensSpec, sunglassSpec, accessories, services };
  }, [invoiceItems]);

  const triggerPrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Standard triggers window.print which provides native Print To PDF on all modern devices in highest quality
    window.print();
  };

  const handleShareWhatsApp = () => {
    let text = `*INVOICE: ${invoiceNum}*\n*Shop:* VISION CRAFT OPTICALS\n*Customer:* ${clientCustomer.name}\n*Total Bill:* ₹${finalGrandTotal}\n*Paid:* ₹${finalAdvance}\n*Balance:* ₹${finalBalance}\nThank you for your business!`;
    if (invoice?.status === 'Delivered' && invoice?.type === 'Sales Order') {
      const collected = invoice.finalCollectionPaymentDetail?.total || (finalGrandTotal - finalAdvance);
      text = `*DELIVERY INVOICE: ${invoiceNum}*\n*Shop:* VISION CRAFT OPTICALS\n*Customer:* ${clientCustomer.name}\n*Total Bill:* ₹${finalGrandTotal}\n*Advance Paid:* ₹${finalAdvance}\n*Balance Collected:* ₹${collected}\n*Remaining Balance:* ₹0 (PAID)\n*Delivery Date:* ${invoice.deliveryDate ? new Date(invoice.deliveryDate).toLocaleString('en-IN') : 'N/A'}\n*Prescription:* ${clientPrescription ? `OD: SPH ${clientPrescription.rightEye?.sph || '-'} CYL ${clientPrescription.rightEye?.cyl || '-'}, OS: SPH ${clientPrescription.leftEye?.sph || '-'} CYL ${clientPrescription.leftEye?.cyl || '-'}` : 'N/A'}\nThank you for your business!`;
    }
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?phone=${clientCustomer.mobile}&text=${encoded}`, '_blank');
  };

  return (
    <div className="flex flex-col items-center w-full select-text py-4 print:p-0 bg-transparent">
      {/* Dynamic Style Sheet injection specifically for A5 Portrait print job */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          html, body {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide app wrappers, navigation panel, page headers, or sidebar entirely */
          body > *, header, footer, nav, aside, button, .no-print, .actions-container, .modal-backdrop {
            display: none !important;
          }
          /* Only display our specific printable canvas */
          #a5-print-wrapper {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 148mm !important;
            height: 210mm !important;
            margin: 0 !important;
            padding: 5mm !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            color: #000000 !important;
            z-index: 9999999 !important;
          }
          /* Ensure crisp black typography and clean borders */
          .text-print-black {
            color: #000000 !important;
          }
          .border-print-slate {
            border-color: #1e293b !important;
          }
          .bg-print-slate {
            background-color: #f1f5f9 !important;
          }
        }
      ` }} />

      {/* Screen action banner - will be ignored on print */}
      {!isPrintPreviewOnly && (
        <div className="no-print bg-[#1E293B] border border-white/10 rounded-xl p-4 mb-6 shadow-xl w-full max-w-lg flex flex-wrap gap-2 items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Receipt className="text-emerald-400" size={20} />
            <div>
              <p className="text-xs font-black uppercase text-white/50 tracking-wider">A5 portrait style</p>
              <h3 className="text-sm font-black text-white">{invoiceNum}</h3>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={triggerPrint}
              type="button"
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs font-bold transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <Printer size={13} /> Print A5
            </button>
            <button
              onClick={handleDownloadPDF}
              type="button"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold transition-colors uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-blue-900/30"
            >
              <Download size={13} /> PDF
            </button>
            <button
              onClick={handleShareWhatsApp}
              type="button"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold transition-colors uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-emerald-900/30"
            >
              <Send size={13} /> WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* Main A5 Container wrapper */}
      <div
        id="a5-print-wrapper"
        className="w-[148mm] h-[210mm] max-h-[210mm] min-h-[210mm] overflow-hidden bg-white text-slate-800 p-[5mm] flex flex-col justify-between border border-slate-300 shadow-2xl relative select-text text-[10px] leading-tight"
      >
        {/* Dynamic Watermark Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
          <svg className="w-80 h-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M2.00412 12C2.00412 12 5.00412 5 12.0041 5C19.0041 5 22.0041 12 22.0041 12C22.0041 12 19.0041 19 12.0041 19C5.00412 19 2.00412 12 2.00412 12Z" />
            <circle cx="12.0041" cy="12" r="3" />
          </svg>
        </div>

        <div className="space-y-2 relative z-10">
          {/* SECTION 1: SHOP HEADER */}
          <div className="border-b border-dashed border-slate-300 pb-1.5">
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-start gap-1.5">
                <div className="p-1 bg-slate-900 text-white rounded-md flex items-center justify-center mt-0.5">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path d="M2.00412 12C2.00412 12 5.00412 5 12.0041 5C19.0041 5 22.0041 12 22.0041 12C22.0041 12 19.0041 19 12.0041 19C5.00412 19 2.00412 12 2.00412 12Z" />
                    <circle cx="12.0041" cy="12" r="3" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-sm font-black uppercase text-slate-900 tracking-wider">VISION CRAFT OPTICALS</h1>
                  <p className="text-[8px] text-slate-500 font-medium flex items-center gap-1">
                    <MapPin size={10} className="text-slate-400" /> Shop No 4, Royal Plaza, Market Rd, New Delhi
                  </p>
                  <p className="text-[8px] text-slate-500 font-medium flex items-center gap-1">
                    <Phone size={10} className="text-slate-400" /> +91 98765 43210 | GSTIN: 07AAAAA1111A1Z1
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block bg-slate-100 text-slate-950 font-black px-2 py-0.5 rounded text-[8px] tracking-wider uppercase mb-1">
                  {invoiceType}
                </div>
                <p className="text-[9px] font-bold text-slate-900">
                  <span className="text-slate-400 uppercase font-bold mr-1">No:</span> {invoiceNum}
                </p>
                <p className="text-[8px] text-slate-500 font-bold">
                  Date: {invoiceDate}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: CUSTOMER DETAILS */}
          <div className="bg-slate-50 border border-slate-250 rounded-lg p-2">
            <h3 className="text-[8px] font-black uppercase text-slate-400 tracking-wider mb-1">Customer Details</h3>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <span className="block text-[7px] text-slate-400 uppercase font-black">Customer ID:</span>
                <span className="font-bold text-slate-900">{clientCustomer.id}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-[7px] text-slate-400 uppercase font-black">Customer Name:</span>
                <span className="font-bold text-slate-900 uppercase">{clientCustomer.name}</span>
              </div>
              <div>
                <span className="block text-[7px] text-slate-400 uppercase font-black">Mobile No:</span>
                <span className="font-bold text-slate-900">{clientCustomer.mobile}</span>
              </div>
            </div>
            {clientCustomer.address && clientCustomer.address !== 'N/A' && (
              <div className="mt-1 border-t border-slate-200/55 pt-1">
                <span className="text-[7px] text-slate-400 uppercase font-black mr-1">Address:</span>
                <span className="text-slate-700">{clientCustomer.address}</span>
              </div>
            )}
          </div>

          {/* SECTION 3: PRESCRIPTION DETAILS */}
          <div className="border border-slate-250 rounded-lg p-1.5 bg-white">
            <div className="flex justify-between items-center mb-1 border-b border-slate-100 pb-0.5">
              <h3 className="text-[8px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <Award size={10} className="text-slate-500" /> Corrective Lens Prescription
              </h3>
              {clientPrescription?.source && (
                <span className="text-[7px] font-black text-slate-500 uppercase bg-slate-100 px-1.5 py-0.2 rounded">
                  Source: {clientPrescription.source}
                </span>
              )}
            </div>

            {clientPrescription ? (
              <div className="space-y-1">
                {/* 2x6 Matrix grid table */}
                <table className="w-full text-center border-collapse text-[8.5px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <th className="py-0.5 text-left pl-1 font-bold">EYE</th>
                      <th className="py-0.5 font-bold border-l border-slate-100">SPH</th>
                      <th className="py-0.5 font-bold border-l border-slate-100">CYL</th>
                      <th className="py-0.5 font-bold border-l border-slate-100">AXIS</th>
                      <th className="py-0.5 font-bold border-l border-slate-100">ADD</th>
                      <th className="py-0.5 pr-1 font-bold border-l border-slate-100">V/A</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-0.5 text-left font-black text-slate-900 pl-1">RIGHT (OD)</td>
                      <td className="py-0.5 font-black text-slate-920 border-l border-slate-100 bg-slate-50/20">{clientPrescription.rightEye?.sph || '-'}</td>
                      <td className="py-0.5 font-black text-slate-920 border-l border-slate-100 bg-slate-50/20">{clientPrescription.rightEye?.cyl || '-'}</td>
                      <td className="py-0.5 font-black text-slate-920 border-l border-slate-100 bg-slate-50/20">{clientPrescription.rightEye?.axis || '-'}</td>
                      <td className="py-0.5 font-black text-slate-920 border-l border-slate-100 row-span-2 relative bg-slate-50/40 align-middle" rowSpan={2}>
                        {clientPrescription.rightEye?.add || clientPrescription.leftEye?.add || '-'}
                      </td>
                      <td className="py-0.5 font-black text-slate-920 border-l border-slate-100 bg-slate-50/20 pr-1">{clientPrescription.rightEye?.va || '-'}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 text-left font-black text-slate-900 pl-1">LEFT (OS)</td>
                      <td className="py-0.5 font-black text-slate-920 border-l border-slate-100 bg-slate-50/20">{clientPrescription.leftEye?.sph || '-'}</td>
                      <td className="py-0.5 font-black text-slate-920 border-l border-slate-100 bg-slate-50/20">{clientPrescription.leftEye?.cyl || '-'}</td>
                      <td className="py-0.5 font-black text-slate-920 border-l border-slate-100 bg-slate-50/20">{clientPrescription.leftEye?.axis || '-'}</td>
                      {/* Left col is mapped to add in rowSpan of Right OD */}
                      <td className="py-0.5 font-black text-slate-920 border-l border-slate-100 bg-slate-50/20 pr-1">{clientPrescription.leftEye?.va || '-'}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-100 text-[8px]">
                  <div>
                    <span className="text-slate-400 font-bold uppercase mr-1">PD:</span>
                    <span className="font-bold text-slate-900">{clientPrescription.pdDistance || '-'} mm</span>
                  </div>
                  <div className="col-span-3 text-right text-slate-500">
                    {clientPrescription.doctorPrescriptionDetails?.doctorName && (
                      <span className="mr-2">
                        Prescribed by: <strong className="text-slate-900 font-bold">{clientPrescription.doctorPrescriptionDetails.doctorName}</strong>
                        {clientPrescription.doctorPrescriptionDetails.clinicName && ` (${clientPrescription.doctorPrescriptionDetails.clinicName})`}
                      </span>
                    )}
                    {clientPrescription.doctorPrescriptionDetails?.prescriptionDate && (
                      <span>Date: <strong className="text-slate-900 font-bold">{clientPrescription.doctorPrescriptionDetails.prescriptionDate}</strong></span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-2.5 text-center text-rose-500 font-black animate-pulse">
                ⚠️ MISSING REQUIREMENT: Rx Corrective Prescription is mandatory internally! Please add prescription details.
              </div>
            )}
          </div>

          {/* SECTION 4: PURCHASE DETAILS */}
          <div className="border border-slate-250 rounded-lg p-1.5 bg-white">
            <h3 className="text-[8px] font-black uppercase text-slate-400 tracking-wider mb-1">Purchased Details</h3>
            
            <table className="w-full text-left text-[8px] border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="py-1 pl-1 font-bold">Item & Specifications</th>
                  <th className="py-1 uppercase font-bold">Type</th>
                  <th className="py-1 text-center font-bold">Qty</th>
                  <th className="py-1 text-right font-bold">Price</th>
                  <th className="py-1 text-right font-bold">Disc</th>
                  <th className="py-1 text-right pr-1 font-bold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoiceItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-3 text-center text-slate-400 uppercase font-bold">No Items Drafted</td>
                  </tr>
                ) : (
                  invoiceItems.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="py-1 pl-1 font-bold text-slate-900">
                        {item.itemType === 'frame'
                          ? `${item.brand || 'Optical'} ${item.modelNumber || ''} ${item.color ? `Col: ${item.color}` : ''}`
                          : item.itemType === 'lens'
                          ? `${item.lensBrand || 'Lens'} ${item.lensCategory || ''} ${item.lensFeatures?.join(', ') || ''}`
                          : item.itemName}
                      </td>
                      <td className="py-1 text-slate-500 capitalize">{item.itemType}</td>
                      <td className="py-1 text-center text-slate-700 font-medium">{item.quantity}</td>
                      <td className="py-1 text-right text-slate-700">₹{item.sellingPrice}</td>
                      <td className="py-1 text-right text-rose-500">{item.discount > 0 ? `-₹${item.discount}` : '-'}</td>
                      <td className="py-1 text-right pr-1 font-bold text-slate-900">₹{item.finalAmount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Spec Categories Summary (As requested) */}
            <div className="mt-2 pt-1.5 border-t border-slate-100 grid grid-cols-2 gap-1.5 text-[7px] text-slate-600 bg-slate-50/40 p-1.5 rounded">
              <div>
                <p><strong className="text-[7.5px] text-slate-900 uppercase">Frame:</strong> {detailsOfCategories.frameSpec}</p>
                <p className="mt-0.5"><strong className="text-[7.5px] text-slate-900 uppercase">Lens:</strong> {detailsOfCategories.lensSpec}</p>
              </div>
              <div>
                <p><strong className="text-[7.5px] text-slate-900 uppercase">Sunglass:</strong> {detailsOfCategories.sunglassSpec}</p>
                <p className="mt-0.5"><strong className="text-[7.5px] text-slate-900 uppercase">Accessories & Services:</strong> {detailsOfCategories.accessories !== 'N/A' || detailsOfCategories.services !== 'N/A' ? `${detailsOfCategories.accessories} / ${detailsOfCategories.services}` : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* SECTION 5: BILLING BOX (Unified, single block, requested layout) */}
          <div className="bg-[#1E293B] text-white rounded-lg p-2.5 border border-slate-800 shadow shadow-slate-950/25">
            <div className="grid grid-cols-2 gap-4">
              {/* Key Totals */}
              <div className="space-y-1 my-auto">
                <div className="flex justify-between text-[7.5px] text-white/40 uppercase font-black">
                  <span>Grand Total (MRP):</span>
                  <span className="text-white/80 font-bold">₹{finalSubTotal}</span>
                </div>
                <div className="flex justify-between text-[7.5px] text-rose-400 uppercase font-black">
                  <span>Total Discount:</span>
                  <span className="font-bold">-₹{finalTotalDiscount}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-cyan-400 font-bold border-t border-white/10 pt-1">
                  <span className="uppercase font-black text-[8px]">Final Bill:</span>
                  <span className="text-xs font-black">₹{finalGrandTotal}</span>
                </div>
              </div>

              {/* Advanced / Balance Details */}
              <div className="space-y-1 relative border-l border-white/10 pl-3">
                {invoice?.type === 'Sales Order' && invoice?.status === 'Delivered' ? (
                  <>
                    <div className="flex justify-between text-[7.5px] text-emerald-400 uppercase font-black">
                      <span>Advance Paid:</span>
                      <span className="font-bold">₹{invoice.advanceAmount}</span>
                    </div>
                    <div className="flex justify-between text-[7.5px] text-cyan-400 uppercase font-black">
                      <span>Final Payment:</span>
                      <span className="font-bold">₹{invoice.finalCollectionPaymentDetail?.total || (invoice.grandTotal - invoice.advanceAmount)}</span>
                    </div>
                    <div className="flex justify-between text-[8px] text-emerald-400 uppercase font-black border-b border-white/10 pb-1">
                      <span>Balance Due:</span>
                      <span className="text-emerald-400 font-extrabold text-[9px]">₹0 (PAID)</span>
                    </div>
                    <div className="pt-1 text-[6.5px] text-white/50 space-y-0.5">
                      <span className="block font-black uppercase text-white/70">
                        Adv: {invoice.paymentMode} (₹{invoice.advanceAmount})
                      </span>
                      <span className="block font-black uppercase text-white/70">
                        Final: {invoice.finalCollectionPaymentMode || 'Cash'} (₹{invoice.finalCollectionPaymentDetail?.total || (invoice.grandTotal - invoice.advanceAmount)})
                      </span>
                      {invoice.finalCollectionPaymentMode && (
                        <div className="text-[6px] text-white/40">
                          {invoice.finalCollectionPaymentMode === 'Mixed' ? (
                            <span>Cash: ₹{invoice.finalCollectionPaymentDetail?.cash} | Card: ₹{invoice.finalCollectionPaymentDetail?.card} | UPI: ₹{invoice.finalCollectionPaymentDetail?.upi}</span>
                          ) : invoice.finalCollectionPaymentMode === 'Cash' ? (
                            <span>Cash Collected</span>
                          ) : invoice.finalCollectionPaymentMode === 'Card' ? (
                            <span>Card: {invoice.finalCollectionPaymentDetail?.cardType} (*{invoice.finalCollectionPaymentDetail?.cardLast4 || 'N/A'})</span>
                          ) : (
                            <span>UPI: {invoice.finalCollectionPaymentDetail?.upiApp} ({invoice.finalCollectionPaymentDetail?.upiTransactionId || 'N/A'})</span>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-[7.5px] text-emerald-400 uppercase font-black">
                      <span>Advance Received:</span>
                      <span className="font-bold">₹{finalAdvance}</span>
                    </div>
                    <div className="flex justify-between text-[8px] text-rose-400 uppercase font-black border-b border-white/10 pb-1">
                      <span>Balance Amount:</span>
                      <span className="text-white font-black text-[9px]">₹{finalBalance}</span>
                    </div>
                    {/* Payment Breakdown Info */}
                    <div className="pt-1 text-[7px] text-white/50">
                      <span className="block font-black uppercase text-white/70">Payment Mode: {finalPaymentMode}</span>
                      {finalPaymentMode === 'Mixed' ? (
                        <span>Cash: ₹{finalPaymentDetail.cash} | Card: ₹{finalPaymentDetail.card} | UPI: ₹{finalPaymentDetail.upi}</span>
                      ) : finalPaymentMode === 'Cash' ? (
                        <span>Received ₹{finalPaymentDetail.cash} in Cash</span>
                      ) : finalPaymentMode === 'Card' ? (
                        <span>Received ₹{finalPaymentDetail.card} via Card {finalPaymentDetail.cardType ? `(${finalPaymentDetail.cardType})` : ''}</span>
                      ) : (
                        <span>Received ₹{finalPaymentDetail.upi} via UPI {finalPaymentDetail.upiApp ? `(${finalPaymentDetail.upiApp})` : ''}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 6: FOOTER */}
        <div className="pt-1.5 border-t border-slate-200 mt-2">
          <div className="flex justify-between items-end gap-2 text-[7px] text-slate-500">
            {/* Delivery, Terms, Warranty */}
            <div className="space-y-0.5 max-w-xs">
              <div className="font-bold text-slate-700">
                {invoice?.status === 'Delivered' ? '🚚 DELIVERED ON:' : '🚚 EXPECTED DELIVERY:'} <span className="text-slate-900 font-black underline">
                  {deliveryDateString}
                </span>
              </div>
              <p className="leading-tight"><strong className="text-[7.5px] text-slate-800">Warranty:</strong> 1 Year on prescription coatings & frames.</p>
              <p className="leading-tight"><strong className="text-[7.5px] text-slate-800 font-bold">Terms:</strong> Customized lens orders cannot be cancelled once in lab. Please clear outstanding balance of ₹{finalBalance} upon pickup.</p>
            </div>

            {/* Simulated Vector QR code & Authorized Signature */}
            <div className="flex items-end gap-3 text-right">
              {/* Elegant Simulated QR Code */}
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-8 h-8 bg-white border border-slate-350 p-0.5 flex flex-wrap justify-between content-between shadow-sm">
                  {/* Visual grid representing a premium QR Code standard */}
                  <div className="w-2.5 h-2.5 bg-slate-950 flex flex-wrap p-[1px]">
                    <div className="w-full h-full bg-white p-[1px]"><div className="w-full h-full bg-slate-950"></div></div>
                  </div>
                  <div className="w-1 h-2.5 bg-slate-950"></div>
                  <div className="w-2.5 h-2.5 bg-slate-950 flex flex-wrap p-[1px]">
                    <div className="w-full h-full bg-white p-[1px]"><div className="w-full h-full bg-slate-950"></div></div>
                  </div>
                  <div className="w-1.5 h-1.5 bg-slate-950"></div>
                  <div className="w-2 h-2 bg-slate-950"></div>
                  <div className="w-1.5 h-1 text-[2px]"></div>
                  <div className="w-2.5 h-2.5 bg-slate-950 flex flex-wrap p-[1px]">
                    <div className="w-full h-full bg-white p-[1px]"><div className="w-full h-full bg-slate-950"></div></div>
                  </div>
                  <div className="w-2.5 h-1 bg-slate-950"></div>
                  <div className="w-1 h-2 bg-slate-950"></div>
                </div>
                <span className="text-[5.5px] font-black uppercase text-slate-400">Scan & Pay</span>
              </div>

              {/* Signature Line */}
              <div className="w-24 border-t border-slate-350 pt-2 text-center">
                <p className="font-extrabold uppercase text-slate-900 tracking-wider text-[6.5px]">Authorized Signature</p>
                <p className="text-[5px] text-slate-400">Vision Craft Opticals</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

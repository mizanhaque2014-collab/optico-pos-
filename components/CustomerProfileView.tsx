'use client';

import React, { useState, useEffect } from 'react';
import { Customer, Invoice } from '@/lib/types';
import { useStore } from '@/lib/store';
import { customerService } from '@/lib/services/customerService';
import { eyeTestService, EyeTestRecord } from '@/lib/services/eyeTestService';
import { prescriptionService, mapPascalToStandard } from '@/lib/services/prescriptionService';
import { invoiceService } from '@/lib/services/invoiceService';
import { InvoiceDetailCard } from './InvoiceDetailCard';
import { SalesOrderDetailCard } from './SalesOrderDetailCard';
import { OpticalInvoiceA5 } from './OpticalInvoiceA5';
import { PrescriptionViewOnly } from './PrescriptionViewOnly';
import { User, FileText, IndianRupee, Clock, CheckCircle, Activity, ShoppingCart, Calendar, Eye, Stethoscope } from 'lucide-react';

interface Props {
  customer: Customer;
  onBack: () => void;
  onNavigateTo?: (view: any, customer?: any, eyeTest?: any) => void;
}

export function CustomerProfileView({ customer, onBack, onNavigateTo }: Props) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Separate into Invoices (Direct Sale) and Sales Orders
  const directSaleInvoices = invoices.filter(i => i.type === 'Direct Sale');
  const salesOrders = invoices.filter(i => i.type === 'Sales Order');

  const totalSpent = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  const [eyeTests, setEyeTests] = useState<EyeTestRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Modal selector states
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedEyeTest, setSelectedEyeTest] = useState<EyeTestRecord | null>(null);
  const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [viewingPrescription, setViewingPrescription] = useState<any>(null);

  useEffect(() => {
    if (printingInvoice) {
      setTimeout(() => {
        window.print();
        setPrintingInvoice(null);
      }, 200);
    }
  }, [printingInvoice]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const invs = await invoiceService.getInvoicesByCustomer(customer.id);
        setInvoices(invs.sort((a,b) => b.createdAt - a.createdAt));
      } catch (e) {
        console.error("Failed to load invoices:", e);
      }
      try {
        console.log("[PROFILE DEBUG] Loading full customer history for customerId:", customer.id);
        const history = await customerService.loadCustomerHistory(customer.id);
        console.log("[PROFILE DEBUG] Full customer history response:", history);
        
        // Update eye tests and prescriptions with fetched results
        setEyeTests(history.eyeTests || []);
        
        // Map any PascalCase prescriptions to standard objects if needed
        const mappedPrescriptions = (history.prescriptions || []).map((p: any) => {
          return p.PrescriptionID ? mapPascalToStandard(p) : p;
        });
        setPrescriptions(mappedPrescriptions);
      } catch (e) {
        console.error("Failed to load customer profile history via loadCustomerHistory, running fallbacks:", e);
        try {
          const etList = await eyeTestService.loadEyeTestHistory(customer.id);
          const pList = await prescriptionService.loadPrescriptionHistory(customer.id);
          setEyeTests(etList);
          setPrescriptions(pList.map(mapPascalToStandard));
        } catch (fallbackError) {
          console.error("Profile history fallback loading failed:", fallbackError);
        }
      } finally {
        setLoadingHistory(false);
      }
    }
    loadHistory();
  }, [customer.id]);

  const handleContinueBilling = (et: EyeTestRecord) => {
    setSelectedEyeTest(et);
    setShowBillingModal(true);
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 pb-20">
      
      {/* 1. CUSTOMER INFORMATION */}
      <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-cyan-500/20 p-4 rounded-xl text-cyan-400">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-widest uppercase">{customer.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {customer.status && (
                <span className="text-[9px] font-bold uppercase tracking-wider bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 px-2 py-0.5 rounded">
                  {customer.status}
                </span>
              )}
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider">
                💳 ID: {customer.id} | 📞 {customer.mobile} | ⚧ Gender: N/A | 🎂 DOB: {customer.dob || 'N/A'} | 🏠 {customer.address || 'No Address'} | Joined: {new Date(customer.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onNavigateTo && (
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => onNavigateTo('eye_test', customer)} 
                className="text-[10px] font-black bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border border-emerald-500/30 px-3 py-2 rounded-xl uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                <Stethoscope size={13} /> Perform Eye Test
              </button>
              <button 
                onClick={() => onNavigateTo('direct_sale', customer)} 
                className="text-[10px] font-black bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/40 border border-cyan-500/30 px-3 py-2 rounded-xl uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                🧾 Create Direct Sale Invoice
              </button>
              <button 
                onClick={() => onNavigateTo('sales_order', customer)} 
                className="text-[10px] font-black bg-purple-600/20 text-purple-400 hover:bg-purple-600/40 border border-purple-500/30 px-3 py-2 rounded-xl uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                📋 Create Sales Order
              </button>
            </div>
          )}
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center min-w-[120px]">
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider mb-0.5">Lifetime Value</p>
            <p className="text-xl font-black text-emerald-400 tracking-tighter">₹{totalSpent}</p>
          </div>
        </div>
      </div>

      {loadingHistory ? (
        <div className="text-center py-12 text-xs font-bold uppercase tracking-widest text-white/40">
          Loading Examination & Purchase Histories...
        </div>
      ) : (
        <div className="space-y-6">

          {/* 2. EYE TEST HISTORY */}
          <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl shadow-xl">
            <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
              <Stethoscope size={18} /> Eye Test History
            </h3>
            
            {eyeTests.length === 0 ? (
              <p className="text-xs text-white/40 font-bold uppercase tracking-wider text-center py-6 bg-[#0F172A]/40 rounded-xl border border-white/5">
                No eye examinations performed yet
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {eyeTests.map((et, index) => {
                  const isLatest = index === 0;
                  return (
                    <div 
                      key={et.id} 
                      className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                        isLatest 
                          ? 'bg-[#0F172A] border-cyan-500/30 shadow-lg shadow-cyan-950/20' 
                          : 'bg-[#0F172A]/60 border-white/5'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <div>
                            <span className="text-xs font-black text-white">{et.eyeTestDate || new Date(et.createdAt).toLocaleDateString()}</span>
                            {isLatest && <span className="text-[8px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded ml-2">LATEST</span>}
                          </div>
                          <span className="text-[10px] font-mono text-white/40">{et.id}</span>
                        </div>

                        {/* Prescriber details */}
                        {et.optometristName && (
                          <div className="text-[10px] text-white/60">
                            <span className="text-white/40 font-bold uppercase">Optometrist:</span> {et.optometristName}
                          </div>
                        )}

                        {/* Power matrix */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] bg-white/5 p-2 rounded-lg border border-white/5 font-mono">
                          <div>
                            <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1 border-b border-white/5 pb-0.5">Right Eye (OD)</p>
                            <p>SPH: <span className="text-white">{et.sphOd || '-'}</span></p>
                            <p>CYL: <span className="text-white">{et.cylOd || '-'}</span></p>
                            <p>AXIS: <span className="text-white">{et.axisOd || '-'}</span></p>
                          </div>
                          <div>
                            <p className="text-[8px] font-bold text-pink-400 uppercase tracking-widest mb-1 border-b border-white/5 pb-0.5">Left Eye (OS)</p>
                            <p>SPH: <span className="text-white">{et.sphOs || '-'}</span></p>
                            <p>CYL: <span className="text-white">{et.cylOs || '-'}</span></p>
                            <p>AXIS: <span className="text-white">{et.axisOs || '-'}</span></p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-[10px] text-white/60">
                          {et.addPower && <p><span className="text-white/40">ADD:</span> <span className="text-white font-mono">{et.addPower}</span></p>}
                          {et.pdDistance && <p><span className="text-white/40">PD Dist:</span> <span className="text-white font-mono">{et.pdDistance}</span></p>}
                          {et.pdNear && <p><span className="text-white/40">PD Near:</span> <span className="text-white font-mono">{et.pdNear}</span></p>}
                        </div>

                        {et.lensRecommendation && (
                          <div className="text-[10px] text-white/70 bg-cyan-950/20 border border-cyan-800/30 p-2 rounded">
                            <span className="font-bold text-cyan-400 uppercase block text-[8px] tracking-widest mb-0.5">Lens Recommendation</span>
                            {et.lensRecommendation}
                          </div>
                        )}

                        {et.remarks && (
                          <div className="text-[10px] text-white/40">
                            <span className="font-bold uppercase">Remarks:</span> {et.remarks}
                          </div>
                        )}
                      </div>

                      {isLatest && (
                        <div className="mt-4 pt-3 border-t border-white/5">
                          <button
                            onClick={() => handleContinueBilling(et)}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-widest py-2 px-4 rounded-lg shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                          >
                            <ShoppingCart size={14} /> CONTINUE TO BILLING
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. PRESCRIPTION HISTORY */}
          <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl shadow-xl">
            <h3 className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
              <FileText size={18} /> Prescription History
            </h3>
            
            {prescriptions.length === 0 ? (
              <p className="text-xs text-white/40 font-bold uppercase tracking-wider text-center py-6 bg-[#0F172A]/40 rounded-xl border border-white/5">
                No finalized prescriptions saved
              </p>
            ) : (
              <div className="space-y-4">
                {prescriptions.slice().reverse().map((p, idx, arr) => {
                  const prev = arr[idx + 1];
                  return (
                    <div key={p.id} className="bg-[#0F172A] border border-white/5 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg">
                        <span className="text-xs font-bold text-white/80">{new Date(p.createdAt).toLocaleDateString()}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">{p.source}</span>
                      </div>

                      {p.source === 'Doctor Prescription' && p.doctorPrescriptionDetails && (
                        <div className="border border-purple-500/20 bg-purple-900/10 p-3 rounded-lg grid grid-cols-2 gap-2 text-[10px] text-white/60">
                          {p.doctorPrescriptionDetails.doctorName && <p><span className="font-bold text-purple-400">Doctor:</span> {p.doctorPrescriptionDetails.doctorName}</p>}
                          {p.doctorPrescriptionDetails.clinicName && <p><span className="font-bold text-purple-400">Clinic:</span> {p.doctorPrescriptionDetails.clinicName}</p>}
                          {p.doctorPrescriptionDetails.prescriptionDate && <p><span className="font-bold text-purple-400">Date:</span> {new Date(p.doctorPrescriptionDetails.prescriptionDate).toLocaleDateString()}</p>}
                          {p.doctorPrescriptionDetails.prescriptionNumber && <p><span className="font-bold text-purple-400">No:</span> {p.doctorPrescriptionDetails.prescriptionNumber}</p>}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {p.rightEye && (
                          <div className="bg-white/5 p-3 rounded-lg">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 border-b border-white/10 pb-1">OD (Right)</p>
                            <p className="text-xs text-white/80 font-mono mt-2">
                              {p.rightEye.sph && <span>SPH: {p.rightEye.sph} </span>}
                              {p.rightEye.cyl && <span>CYL: {p.rightEye.cyl} </span>}
                              {p.rightEye.axis && <span>AXIS: {p.rightEye.axis} </span>}
                              {p.rightEye.add && <span>ADD: {p.rightEye.add}</span>}
                            </p>
                          </div>
                        )}
                        {p.leftEye && (
                          <div className="bg-white/5 p-3 rounded-lg">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 border-b border-white/10 pb-1">OS (Left)</p>
                            <p className="text-xs text-white/80 font-mono mt-2">
                              {p.leftEye.sph && <span>SPH: {p.leftEye.sph} </span>}
                              {p.leftEye.cyl && <span>CYL: {p.leftEye.cyl} </span>}
                              {p.leftEye.axis && <span>AXIS: {p.leftEye.axis} </span>}
                              {p.leftEye.add && <span>ADD: {p.leftEye.add}</span>}
                            </p>
                          </div>
                        )}
                      </div>

                      {p.remarks && (
                        <div className="text-[10px] text-white/40 pt-1">
                          <span className="font-bold uppercase">Remarks:</span> {p.remarks}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. INVOICES (DIRECT SALE) */}
          <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl shadow-xl">
            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
              <IndianRupee size={18} /> Invoices (Direct Sale)
            </h3>
            
            {directSaleInvoices.length === 0 ? (
              <p className="text-xs text-white/40 font-bold uppercase tracking-wider text-center py-6 bg-[#0F172A]/40 rounded-xl border border-white/5">
                No direct sale invoices found
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {directSaleInvoices.map(inv => (
                  <InvoiceDetailCard
                    key={inv.id}
                    inv={inv}
                    customer={customer}
                    prescription={prescriptions.find(p => p.id === inv.prescriptionId)}
                    onViewPrescription={setViewingPrescription}
                    onViewInvoice={setViewingInvoice}
                    onPrintA5={setPrintingInvoice}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 5. SALES ORDERS */}
          <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl shadow-xl">
            <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
              <Clock size={18} /> Sales Orders
            </h3>
            
            {salesOrders.length === 0 ? (
              <p className="text-xs text-white/40 font-bold uppercase tracking-wider text-center py-6 bg-[#0F172A]/40 rounded-xl border border-white/5">
                No pending sales orders found
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {salesOrders.map(inv => (
                  <SalesOrderDetailCard
                    key={inv.id}
                    inv={inv}
                    customer={customer}
                    prescription={prescriptions.find(p => p.id === inv.prescriptionId)}
                    onViewPrescription={setViewingPrescription}
                    onPrintA5={setPrintingInvoice}
                    onEditOrder={() => {}}
                    onContinueBilling={(inv) => {
                       if (onNavigateTo) onNavigateTo('delivery_collection', customer, inv);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* BILLING CHOICE OVERLAY MODAL */}
            {/* INVOICE VIEW MODAL */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#1E293B]">
              <h2 className="font-extrabold text-[#94A3B8] tracking-widest text-[10px] uppercase">Invoice Preview</h2>
              <button onClick={() => setViewingInvoice(null)} className="text-white/40 hover:text-white font-bold text-sm">✖</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-sm flex-1 bg-slate-300 flex justify-center items-start">
              <div className="shadow-lg rounded-md overflow-hidden bg-white">
                <OpticalInvoiceA5 
                  customer={customer} 
                  prescription={prescriptions.find(p => p.id === viewingInvoice.prescriptionId) || null} 
                  invoice={viewingInvoice}
                  isPrintPreviewOnly={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT INVOICE RENDERER (Hidden from UI, visible to printer) */}
      {printingInvoice && (
        <div className="fixed inset-0 z-[200] bg-white hidden print:block">
           <OpticalInvoiceA5 
              customer={customer} 
              prescription={prescriptions.find(p => p.id === printingInvoice.prescriptionId) || null} 
              invoice={printingInvoice}
              isPrintPreviewOnly={true}
           />
        </div>
      )}

      {/* VIEW PRESCRIPTION MODAL */}
      {viewingPrescription && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#1E293B]">
              <h2 className="font-extrabold text-[#94A3B8] tracking-widest text-[10px] uppercase">Prescription Details</h2>
              <button onClick={() => setViewingPrescription(null)} className="text-white/40 hover:text-white font-bold text-sm">✖</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              <PrescriptionViewOnly prescription={viewingPrescription} />
            </div>
          </div>
        </div>
      )}

      {showBillingModal && selectedEyeTest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-black text-cyan-400 uppercase tracking-widest">Billing Method</h3>
              <p className="text-xs text-white/60 mt-1">
                Proceed to checkout with the selected eye examination parameters for <span className="text-white font-bold">{customer.name}</span>.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onNavigateTo) {
                    onNavigateTo('direct_sale', customer, selectedEyeTest);
                  }
                  setShowBillingModal(false);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-xl font-bold flex items-center justify-between transition-colors shadow-lg text-left"
              >
                <div>
                  <p className="text-sm font-black uppercase tracking-wider">🧾 Direct Sale Invoice</p>
                  <p className="text-[10px] text-emerald-100 mt-1">Load customer profile & prescription to direct checkout</p>
                </div>
                <span className="text-xl">➔</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onNavigateTo) {
                    onNavigateTo('sales_order', customer, selectedEyeTest);
                  }
                  setShowBillingModal(false);
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-xl font-bold flex items-center justify-between transition-colors shadow-lg text-left"
              >
                <div>
                  <p className="text-sm font-black uppercase tracking-wider">📋 Sales Order</p>
                  <p className="text-[10px] text-purple-100 mt-1">Load customer profile & prescription to pending order checkout</p>
                </div>
                <span className="text-xl">➔</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowBillingModal(false)}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

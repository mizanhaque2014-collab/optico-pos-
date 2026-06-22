import React from 'react';
import { Customer, Invoice } from '@/lib/types';
import { useStore } from '@/lib/store';
import { User, FileText, IndianRupee, Clock, CheckCircle } from 'lucide-react';

interface Props {
  customer: Customer;
  onBack: () => void;
  onNavigateTo?: (view: any, customer?: any) => void;
}

export function CustomerProfileView({ customer, onBack, onNavigateTo }: Props) {
  const { getInvoices } = useStore();
  const invoices = getInvoices().filter(i => i.customerId === customer.id).sort((a,b) => b.createdAt - a.createdAt);

  const totalSpent = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 pb-20">
      <div className="flex items-center justify-between bg-[#0F172A] p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-cyan-500/20 p-4 rounded-xl text-cyan-400">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-widest">{customer.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              {customer.status && <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded text-white/80">{customer.status}</span>}
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider">📞 {customer.mobile} | 🏠 {customer.address || 'No Address'} | Joined: {new Date(customer.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <div className="text-right flex items-center gap-4">
          <div className="flex flex-col gap-2 mr-4 border-r border-white/10 pr-4">
            {onNavigateTo && (
              <>
                <button onClick={() => onNavigateTo('direct_sale', customer)} className="text-[10px] font-bold bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/40 border border-cyan-500/30 px-3 py-1.5 rounded uppercase tracking-wider transition-colors whitespace-nowrap">
                  🧾 Create Direct Sale Invoice
                </button>
                <button onClick={() => onNavigateTo('sales_order', customer)} className="text-[10px] font-bold bg-purple-600/20 text-purple-400 hover:bg-purple-600/40 border border-purple-500/30 px-3 py-1.5 rounded uppercase tracking-wider transition-colors whitespace-nowrap">
                  📋 Create Sales Order
                </button>
              </>
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Lifetime Value</p>
            <p className="text-3xl font-black text-emerald-400 tracking-tighter">₹{totalSpent}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl shadow-xl">
            <h3 className="text-sm font-black text-yellow-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
              <FileText size={18}/> Prescription History & Eye Tests
            </h3>
            <div className="space-y-4">
              {(!customer.prescriptions || customer.prescriptions.length === 0) && (
                <p className="text-xs text-white/40 font-bold uppercase tracking-wider text-center py-4">No records found</p>
              )}
              {customer.prescriptions?.slice().reverse().map((p, idx, arr) => {
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

                    {p.source === 'Eye Test Performed In Shop' && p.eyeTestDetails && Object.keys(p.eyeTestDetails).length > 0 && (
                      <div className="border border-blue-500/20 bg-blue-900/10 p-3 rounded-lg grid grid-cols-2 gap-2 text-[10px] text-white/60">
                        {p.eyeTestDetails.autoRefractionOd && <p><span className="font-bold text-blue-400">AR (OD):</span> {p.eyeTestDetails.autoRefractionOd}</p>}
                        {p.eyeTestDetails.autoRefractionOs && <p><span className="font-bold text-blue-400">AR (OS):</span> {p.eyeTestDetails.autoRefractionOs}</p>}
                        {p.eyeTestDetails.finalRefractionOd && <p><span className="font-bold text-blue-400">Final (OD):</span> {p.eyeTestDetails.finalRefractionOd}</p>}
                        {p.eyeTestDetails.finalRefractionOs && <p><span className="font-bold text-blue-400">Final (OS):</span> {p.eyeTestDetails.finalRefractionOs}</p>}
                        {p.eyeTestDetails.visionOd && <p><span className="font-bold text-blue-400">VA (OD):</span> {p.eyeTestDetails.visionOd}</p>}
                        {p.eyeTestDetails.visionOs && <p><span className="font-bold text-blue-400">VA (OS):</span> {p.eyeTestDetails.visionOs}</p>}
                        {p.eyeTestDetails.optometristName && <p><span className="font-bold text-blue-400">Optometrist:</span> {p.eyeTestDetails.optometristName}</p>}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {p.rightEye && (
                        <div className="bg-white/5 p-3 rounded-lg">
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 border-b border-white/10 pb-1">OD (Right)</p>
                          <p className="text-xs text-white/80 font-mono mt-2">
                            {p.rightEye.sph && <span>SPH: {p.rightEye.sph} </span>}
                            {p.rightEye.cyl && <span>CYL: {p.rightEye.cyl} </span>}
                            {p.rightEye.axis && <span>AXIS: {p.rightEye.axis} </span>}
                            {p.rightEye.add && <span>ADD: {p.rightEye.add}</span>}
                          </p>
                          {prev && prev.rightEye && (
                            <p className="text-[10px] text-white/40 mt-2 font-mono">
                              Prev: {prev.rightEye.sph || 'N/A'} / {prev.rightEye.cyl || 'N/A'}
                            </p>
                          )}
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
                          {prev && prev.leftEye && (
                            <p className="text-[10px] text-white/40 mt-2 font-mono">
                              Prev: {prev.leftEye.sph || 'N/A'} / {prev.leftEye.cyl || 'N/A'}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {p.oldGlassPower && (
                      <div className="bg-cyan-900/10 border border-cyan-500/20 p-3 rounded-lg">
                        <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">Old Glass Prescriptions</p>
                        <div className="flex gap-4 text-[10px] text-white/60 font-mono">
                           <div className="flex-1">
                             OD: {p.oldGlassPower.rightEye?.sph || '-'} / {p.oldGlassPower.rightEye?.cyl || '-'}
                           </div>
                           <div className="flex-1">
                             OS: {p.oldGlassPower.leftEye?.sph || '-'} / {p.oldGlassPower.leftEye?.cyl || '-'}
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl shadow-xl">
            <h3 className="text-sm font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
              <Clock size={18}/> Order & Invoice History
            </h3>
            
            <div className="space-y-4">
              {invoices.length === 0 ? (
                <p className="text-xs text-white/40 font-bold uppercase tracking-wider text-center py-4">No records found</p>
              ) : (
                invoices.map(inv => (
                  <div key={inv.id} className="bg-[#0F172A] border border-white/5 p-4 rounded-xl flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <p className="text-xs font-black text-white tracking-widest">{inv.invoiceNumber} <span className="text-[10px] font-normal text-white/40 ml-2">{new Date(inv.createdAt).toLocaleDateString()}</span></p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${inv.type === 'Sales Order' ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{inv.type}</span>
                    </div>

                    <div className="space-y-1">
                      {inv.items.map(item => (
                        <div key={item.id} className="flex justify-between text-xs text-white/60">
                          <span>{item.quantity}x {item.itemType === 'frame' ? item.brand : item.itemType === 'lens' ? item.lensBrand : item.itemName}</span>
                          <span>₹{item.finalAmount}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-end border-t border-white/5 pt-2">
                       <div>
                         <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Status</p>
                         <p className={`text-xs font-bold uppercase ${inv.status === 'Delivered' ? 'text-emerald-400' : 'text-yellow-400'}`}>{inv.status}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Total / Balance</p>
                         <p className="text-sm font-black text-white">₹{inv.grandTotal} <span className="text-rose-400">/ ₹{inv.balanceAmount}</span></p>
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

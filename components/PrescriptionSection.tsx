import React, { useState, useEffect } from 'react';
import { Customer, Prescription, PrescriptionSource, EyePower, OldGlassPower, EyeTestDetails, DoctorPrescriptionDetails } from '../lib/types';
import { PlusCircle, Search, Save, History, Activity, Eye, ClipboardList } from 'lucide-react';
import { useStore } from '../lib/store';

type Props = {
  customer: Customer | null;
  prescription: Prescription | null;
  onChange: (prescription: Prescription | null) => void;
};

const EyePowerForm = ({ title, value, onChange }: { title: string, value: EyePower, onChange: (val: EyePower) => void }) => {
  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-xl p-4">
      <h4 className="text-[10px] font-black text-white/60 mb-3 uppercase tracking-widest">{title}</h4>
      <div className="grid grid-cols-5 gap-2">
        <div>
          <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">SPH</label>
          <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500" value={value.sph || ''} onChange={e => onChange({...value, sph: e.target.value})} />
        </div>
        <div>
          <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">CYL</label>
          <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500" value={value.cyl || ''} onChange={e => onChange({...value, cyl: e.target.value})} />
        </div>
        <div>
          <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">AXIS</label>
          <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500" value={value.axis || ''} onChange={e => onChange({...value, axis: e.target.value})} />
        </div>
        <div>
          <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">ADD</label>
          <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500" value={value.add || ''} onChange={e => onChange({...value, add: e.target.value})} />
        </div>
        <div>
          <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">V/A</label>
          <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500" value={value.va || ''} onChange={e => onChange({...value, va: e.target.value})} />
        </div>
      </div>
    </div>
  );
};

export default function PrescriptionSection({ customer, prescription, onChange }: Props) {
  const { getInvoices } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'history' | 'form'>('form');

  const [hasOldGlass, setHasOldGlass] = useState(false);

  // Initialize a default prescription if needed
  useEffect(() => {
    if (isOpen && !prescription && viewMode === 'form') {
      onChange({
        id: crypto.randomUUID(),
        source: 'No Prescription',
        createdAt: Date.now()
      });
    }
  }, [isOpen, prescription, onChange, viewMode]);

  useEffect(() => {
    if (prescription?.source === 'Copy Old Glass Power') {
      setHasOldGlass(true);
    }
  }, [prescription?.source]);

  useEffect(() => {
    if (customer && customer.prescriptions && customer.prescriptions.length > 0) {
      setIsOpen(true);
      if (!prescription) {
        setViewMode('history');
      }
    }
  }, [customer]);

  const handleNewPrescription = () => {
    onChange({
      id: crypto.randomUUID(),
      source: 'Eye Test Performed In Shop',
      createdAt: Date.now()
    });
    setHasOldGlass(false);
    setViewMode('form');
    setIsOpen(true);
  };

  const handleCopyPrescription = (prev: Prescription) => {
    onChange({
      ...prev,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    });
    setViewMode('form');
    setIsOpen(true);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => { setIsOpen(true); setViewMode('form'); }}
        className="w-full bg-[#1E293B] border border-white/5 hover:border-yellow-500 hover:bg-[#1E293B]/80 p-4 rounded-xl flex items-center justify-between transition-colors shadow-sm"
      >
        <div className="flex items-center gap-3">
          <ClipboardList className="text-yellow-400" size={20} />
          <span className="font-bold text-sm tracking-wider uppercase text-white/80">Add Prescription / Eye Test</span>
        </div>
        <span className="text-xl text-white/40 font-bold">+</span>
      </button>
    );
  }

  const updateField = (field: keyof Prescription, val: any) => {
    if (prescription) onChange({ ...prescription, [field]: val });
  };

  const updateEyeTest = (field: keyof EyeTestDetails, val: string) => {
    if (prescription) updateField('eyeTestDetails', { ...prescription.eyeTestDetails, [field]: val });
  };

  const updateOldGlass = (field: keyof OldGlassPower, val: any) => {
    if (prescription) updateField('oldGlassPower', { ...prescription.oldGlassPower, [field]: val });
  };

  const updateDoctor = (field: keyof DoctorPrescriptionDetails, val: any) => {
    if (prescription) updateField('doctorPrescriptionDetails', { ...prescription.doctorPrescriptionDetails, [field]: val });
  };

  const SOURCES: PrescriptionSource[] = [
    'No Prescription',
    'Eye Test Performed In Shop',
    'Doctor Prescription',
    'Copy Old Glass Power'
  ];

  const lastPurchase = customer ? getInvoices().filter(i => i.customerId === customer.id).sort((a,b) => b.createdAt - a.createdAt)[0] : null;

  return (
    <div className="bg-[#1E293B] border border-white/10 p-5 rounded-xl shadow-lg space-y-5">
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <h3 className="font-black flex items-center gap-2 text-yellow-400 uppercase text-xs tracking-wider">
          <Activity size={18} /> {viewMode === 'history' ? 'Prescription & History' : 'New Prescription Entry'}
        </h3>
        <div className="flex items-center gap-2">
          {viewMode === 'history' && (
            <button 
              onClick={handleNewPrescription}
              className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-wider px-2 py-1 bg-emerald-500/10 rounded flex items-center gap-1 transition-colors"
            >
              <PlusCircle size={12} /> New Prescription
            </button>
          )}
        </div>
      </div>

      {viewMode === 'history' && customer?.prescriptions && customer.prescriptions.length > 0 && (
        <div className="space-y-6">
          <div className="bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/20">
             <h4 className="text-xs font-black text-yellow-400 uppercase tracking-widest mb-3 flex justify-between">
               <span>Latest Prescription</span>
               <span className="text-[10px] text-yellow-400/60 font-bold">{new Date(customer.prescriptions[customer.prescriptions.length - 1].createdAt).toLocaleDateString()}</span>
             </h4>
             <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
               Source: {customer.prescriptions[customer.prescriptions.length - 1].source}
               {customer.prescriptions[customer.prescriptions.length - 1].doctorPrescriptionDetails?.doctorName && ` | Doctor: ${customer.prescriptions[customer.prescriptions.length - 1].doctorPrescriptionDetails?.doctorName}`}
               {customer.prescriptions[customer.prescriptions.length - 1].doctorPrescriptionDetails?.clinicName && ` | Clinic: ${customer.prescriptions[customer.prescriptions.length - 1].doctorPrescriptionDetails?.clinicName}`}
             </div>
             
             <div className="grid grid-cols-2 gap-4 text-xs font-mono text-white/80">
               <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                 <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">OD (Right)</p>
                 <p>SPH: {customer.prescriptions[customer.prescriptions.length - 1].rightEye?.sph || '-'} | CYL: {customer.prescriptions[customer.prescriptions.length - 1].rightEye?.cyl || '-'} | AXIS: {customer.prescriptions[customer.prescriptions.length - 1].rightEye?.axis || '-'}</p>
                 <p className="mt-1">ADD: {customer.prescriptions[customer.prescriptions.length - 1].rightEye?.add || '-'} | V/A: {customer.prescriptions[customer.prescriptions.length - 1].rightEye?.va || '-'}</p>
               </div>
               <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                 <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">OS (Left)</p>
                 <p>SPH: {customer.prescriptions[customer.prescriptions.length - 1].leftEye?.sph || '-'} | CYL: {customer.prescriptions[customer.prescriptions.length - 1].leftEye?.cyl || '-'} | AXIS: {customer.prescriptions[customer.prescriptions.length - 1].leftEye?.axis || '-'}</p>
                 <p className="mt-1">ADD: {customer.prescriptions[customer.prescriptions.length - 1].leftEye?.add || '-'} | V/A: {customer.prescriptions[customer.prescriptions.length - 1].leftEye?.va || '-'}</p>
               </div>
             </div>
             <div className="mt-4 flex gap-4 text-xs text-white/60">
                <p>PD: <span className="font-bold text-white">{customer.prescriptions[customer.prescriptions.length - 1].pdDistance || '-'}</span></p>
                <p>Remarks: <span className="font-bold text-white">{customer.prescriptions[customer.prescriptions.length - 1].remarks || '-'}</span></p>
             </div>
             
             <div className="mt-4 border-t border-white/10 pt-4 flex gap-2">
               <button onClick={() => handleCopyPrescription(customer.prescriptions![customer.prescriptions!.length - 1])} className="text-[10px] bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/40 border border-cyan-500/30 px-3 py-1.5 rounded uppercase font-bold tracking-wider transition-colors flex items-center gap-2">📋 Copy Previous Prescription</button>
               <button onClick={handleNewPrescription} className="text-[10px] bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border border-emerald-500/30 px-3 py-1.5 rounded uppercase font-bold tracking-wider transition-colors flex items-center gap-2">➕ New Prescription</button>
             </div>
          </div>

          {lastPurchase && (
            <div className="bg-[#0F172A] p-4 rounded-xl border border-white/5">
              <h4 className="text-xs font-black text-white/60 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Last Purchase Details</h4>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2 flex justify-between">
                <span>{new Date(lastPurchase.createdAt).toLocaleDateString()}</span>
                <span>{lastPurchase.invoiceNumber}</span>
              </div>
              <ul className="space-y-1 mb-3">
                {lastPurchase.items.map((item: any, i: number) => (
                  <li key={i} className="text-xs font-bold text-white/80 uppercase">
                    {item.itemType}: {item.brand || item.lensBrand || item.itemName} {item.modelNumber || item.lensCategory || ''}
                  </li>
                ))}
              </ul>
              <div className="flex gap-4 text-[10px] uppercase tracking-wider">
                <div className="bg-white/5 px-2 py-1 rounded border border-white/10 text-white/60">Total: <span className="text-emerald-400 font-bold">₹{lastPurchase.grandTotal}</span></div>
                <div className="bg-white/5 px-2 py-1 rounded border border-white/10 text-white/60">Payment: <span className="text-white font-bold">{lastPurchase.balanceAmount === 0 ? 'Paid' : 'Pending'}</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === 'form' && prescription && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div>
            <label className="text-[10px] text-white/40 block mb-2 uppercase font-bold tracking-wider">Prescription Source</label>
            <div className="flex flex-wrap gap-2">
              {SOURCES.map(s => (
                <button
                  key={s}
                  onClick={() => updateField('source', s)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors border ${
                    prescription.source === s 
                      ? 'bg-yellow-600 border-yellow-500 text-white' 
                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

      {prescription.source === 'Doctor Prescription' && (
        <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-4 space-y-4">
          <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">Doctor Prescription Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">Doctor Name *</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none" value={prescription.doctorPrescriptionDetails?.doctorName || ''} onChange={e => updateDoctor('doctorName', e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">Clinic / Hospital Name *</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none" value={prescription.doctorPrescriptionDetails?.clinicName || ''} onChange={e => updateDoctor('clinicName', e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">Prescription Date</label>
              <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none" value={prescription.doctorPrescriptionDetails?.prescriptionDate || ''} onChange={e => updateDoctor('prescriptionDate', e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">Prescription Number (Optional)</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none" value={prescription.doctorPrescriptionDetails?.prescriptionNumber || ''} onChange={e => updateDoctor('prescriptionNumber', e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">Remarks</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none" value={prescription.doctorPrescriptionDetails?.remarks || ''} onChange={e => updateDoctor('remarks', e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">Attachment (Optional JPG/PNG/PDF)</label>
              <input type="file" accept=".jpg,.png,.pdf" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-white/10 file:text-white hover:file:bg-white/20 transition-colors cursor-pointer" onChange={e => {
                const f = e.target.files?.[0];
                if (f) {
                   const reader = new FileReader();
                   reader.onload = (ev) => updateDoctor('attachmentData', ev.target?.result as string);
                   reader.readAsDataURL(f);
                }
              }} />
            </div>
          </div>
        </div>
      )}

      {prescription.source === 'Eye Test Performed In Shop' && (
        <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-4 space-y-4">
          <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2"><Eye size={14}/> Shop Eye Test Records</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">Auto Refraction OD</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none" value={prescription.eyeTestDetails?.autoRefractionOd || ''} onChange={e => updateEyeTest('autoRefractionOd', e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">Auto Refraction OS</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none" value={prescription.eyeTestDetails?.autoRefractionOs || ''} onChange={e => updateEyeTest('autoRefractionOs', e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">Final Refraction OD</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none" value={prescription.eyeTestDetails?.finalRefractionOd || ''} onChange={e => updateEyeTest('finalRefractionOd', e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">Final Refraction OS</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none" value={prescription.eyeTestDetails?.finalRefractionOs || ''} onChange={e => updateEyeTest('finalRefractionOs', e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">Vision OD</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none" value={prescription.eyeTestDetails?.visionOd || ''} onChange={e => updateEyeTest('visionOd', e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">Vision OS</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none" value={prescription.eyeTestDetails?.visionOs || ''} onChange={e => updateEyeTest('visionOs', e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">Remarks</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none" value={prescription.eyeTestDetails?.remarks || ''} onChange={e => updateEyeTest('remarks', e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">Optometrist Name</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none" value={prescription.eyeTestDetails?.optometristName || ''} onChange={e => updateEyeTest('optometristName', e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">Eye Test Date</label>
              <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none" value={prescription.eyeTestDetails?.eyeTestDate || ''} onChange={e => updateEyeTest('eyeTestDate', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {prescription.source !== 'No Prescription' && (
        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-white/60 uppercase tracking-widest">Final Prescription (Distance & Add)</h4>
            {!hasOldGlass && (
              <button onClick={() => setHasOldGlass(true)} className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-wider border border-cyan-500/30 px-2 py-1 rounded bg-cyan-900/20">
                + Add Old Glass Power
              </button>
            )}
          </div>

          {hasOldGlass && (
            <div className="border border-white/10 rounded-xl p-4 bg-[#0F172A] space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Old Glass Power</h4>
                <button onClick={() => setHasOldGlass(false)} className="text-[10px] font-bold text-rose-400 hover:text-rose-300 uppercase tracking-wider">Remove</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EyePowerForm title="Old OD (Right)" value={prescription.oldGlassPower?.rightEye || {}} onChange={(v) => updateOldGlass('rightEye', v)} />
                <EyePowerForm title="Old OS (Left)" value={prescription.oldGlassPower?.leftEye || {}} onChange={(v) => updateOldGlass('leftEye', v)} />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">Old Remarks</label>
                  <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none" value={prescription.oldGlassPower?.remarks || ''} onChange={e => updateOldGlass('remarks', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EyePowerForm title="Right Eye (OD)" value={prescription.rightEye || {}} onChange={(v) => updateField('rightEye', v)} />
            <EyePowerForm title="Left Eye (OS)" value={prescription.leftEye || {}} onChange={(v) => updateField('leftEye', v)} />
          </div>

          <div className="grid grid-cols-3 gap-4 bg-[#0F172A] border border-white/5 rounded-xl p-4">
            <div>
              <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">PD Distance</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 focus:outline-none" value={prescription.pdDistance || ''} onChange={e => updateField('pdDistance', e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">PD Near</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 focus:outline-none" value={prescription.pdNear || ''} onChange={e => updateField('pdNear', e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">Remarks</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500 focus:outline-none" value={prescription.remarks || ''} onChange={e => updateField('remarks', e.target.value)} />
            </div>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
}

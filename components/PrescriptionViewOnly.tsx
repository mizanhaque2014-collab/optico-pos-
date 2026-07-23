'use client';

import React from 'react';
import { Prescription } from '@/lib/types';
import { Eye, Stethoscope, Activity, FileText } from 'lucide-react';

export function PrescriptionViewOnly({ prescription }: { prescription: Prescription }) {
  if (!prescription) return null;

  const renderEyePower = (title: string, power: any) => (
    <div className="bg-[#0F172A] border border-white/5 rounded-xl p-4">
      <h4 className="text-[10px] font-black text-white/60 mb-3 uppercase tracking-widest">{title}</h4>
      <div className="grid grid-cols-5 gap-2">
        <div>
          <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">SPH</label>
          <div className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-mono">{power?.sph || '-'}</div>
        </div>
        <div>
          <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">CYL</label>
          <div className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-mono">{power?.cyl || '-'}</div>
        </div>
        <div>
          <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">AXIS</label>
          <div className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-mono">{power?.axis || '-'}</div>
        </div>
        <div>
          <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">ADD</label>
          <div className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-mono">{power?.add || '-'}</div>
        </div>
        <div>
          <label className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider font-bold">V/A</label>
          <div className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-mono">{power?.va || '-'}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#1E293B] border border-white/10 p-4 rounded-xl">
        <div>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Source</p>
          <p className="text-sm font-black text-cyan-400 tracking-wider uppercase">{prescription.source}</p>
        </div>
        <div className="text-right">
           <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Date</p>
           <p className="text-sm font-black text-white">{new Date(prescription.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderEyePower('Right Eye (OD)', prescription.rightEye)}
        {renderEyePower('Left Eye (OS)', prescription.leftEye)}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0F172A] border border-white/5 p-4 rounded-xl flex items-center justify-between">
           <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">PD Distance</span>
           <span className="text-sm font-black text-white">{prescription.pdDistance || 'N/A'}</span>
        </div>
        <div className="bg-[#0F172A] border border-white/5 p-4 rounded-xl flex items-center justify-between">
           <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">PD Near</span>
           <span className="text-sm font-black text-white">{prescription.pdNear || 'N/A'}</span>
        </div>
      </div>

      {prescription.remarks && (
         <div className="bg-[#0F172A] border border-white/5 p-4 rounded-xl">
           <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2">Remarks</p>
           <p className="text-xs text-white/80">{prescription.remarks}</p>
         </div>
      )}

      {prescription.doctorPrescriptionDetails && (
        <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-xl space-y-3">
          <h4 className="text-xs font-black text-purple-400 flex items-center gap-2 uppercase tracking-widest mb-3 border-b border-purple-500/20 pb-2">
            <Stethoscope size={14} /> Doctor Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-white/40 uppercase text-[9px] tracking-wider font-bold">Doctor Name</p>
              <p className="text-white font-bold">{prescription.doctorPrescriptionDetails.doctorName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-white/40 uppercase text-[9px] tracking-wider font-bold">Clinic</p>
              <p className="text-white font-bold">{prescription.doctorPrescriptionDetails.clinicName || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

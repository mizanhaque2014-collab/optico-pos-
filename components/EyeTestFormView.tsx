'use client';

import { useState, useEffect, useCallback } from 'react';
import { Customer } from '@/lib/types';
import { companyService, Company } from '@/lib/services/companyService';
import { branchService, Branch } from '@/lib/services/branchService';
import { prescriptionService, PrescriptionPascal, mapPascalToStandard } from '@/lib/services/prescriptionService';
import { eyeTestService, EyeTestRecord } from '@/lib/services/eyeTestService';
import { ArrowLeft, Save, ShoppingCart, Activity, Copy, FileText, Eye, Edit2, Plus, Calendar, User } from 'lucide-react';
import { useStore } from '@/lib/store';

interface Props {
  customer: Customer;
  onBack: () => void;
  onContinueToBilling: (customer: Customer, eyeTest: any, billingType: 'direct_sale' | 'sales_order') => void;
}

export function EyeTestFormView({ customer, onBack, onContinueToBilling }: Props) {
  const store = useStore();
  const [activeCustomer, setActiveCustomer] = useState<Customer>(customer);

  useEffect(() => {
    setActiveCustomer(customer);
  }, [customer]);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  
  // Prescription Form Fields
  const [prescriptionId, setPrescriptionId] = useState(''); // Empty for new, filled for edit
  const [examDate, setExamDate] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [complaint, setComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  const [remarks, setRemarks] = useState('');

  // Right Eye (OD)
  const [sphOd, setSphOd] = useState('');
  const [cylOd, setCylOd] = useState('');
  const [axisOd, setAxisOd] = useState('');

  // Left Eye (OS)
  const [sphOs, setSphOs] = useState('');
  const [cylOs, setCylOs] = useState('');
  const [axisOs, setAxisOs] = useState('');

  // Commmon Powers & PD
  const [addPower, setAddPower] = useState('');
  const [pdDistance, setPdDistance] = useState('');
  const [pdNear, setPdNear] = useState('');

  // History & Status States
  const [history, setHistory] = useState<PrescriptionPascal[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isFormDirty, setIsFormDirty] = useState(false);

  // View Modal State
  const [selectedViewPrescription, setSelectedViewPrescription] = useState<PrescriptionPascal | null>(null);
  
  // Billing selection modal states
  const [showBillingTypeModal, setShowBillingTypeModal] = useState(false);

  const loadHistoryData = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await prescriptionService.loadPrescriptionHistory(activeCustomer.id);
      setHistory(data);
      if (data && data.length > 0) {
        const latest = data[0];
        setPrescriptionId(latest.PrescriptionID || '');
        setDoctorName(latest.DoctorName || 'Optometrist');
        setExamDate(latest.ExamDate || new Date().toISOString().split('T')[0]);
        setComplaint(latest.Complaint || '');
        setDiagnosis(latest.Diagnosis || '');
        setAdvice(latest.Advice || '');
        setRemarks(latest.Remarks || '');
        setSphOd(latest.OD_Distance_SPH || '');
        setCylOd(latest.OD_Distance_CYL || '');
        setAxisOd(latest.OD_Distance_AXIS || '');
        setSphOs(latest.OS_Distance_SPH || '');
        setCylOs(latest.OS_Distance_CYL || '');
        setAxisOs(latest.OS_Distance_AXIS || '');
        setAddPower(latest.AddPower || '');
        setPdDistance(latest.PD_Distance || '');
        setPdNear(latest.PD_Near || '');
        if (latest.CompanyID) setSelectedCompanyId(latest.CompanyID);
        if (latest.BranchID) setSelectedBranchId(latest.BranchID);
        setIsFormDirty(false);
      } else {
        setPrescriptionId('');
        setDoctorName('Optometrist');
        setExamDate(new Date().toISOString().split('T')[0]);
        setComplaint('');
        setDiagnosis('');
        setAdvice('');
        setRemarks('');
        setSphOd('');
        setCylOd('');
        setAxisOd('');
        setSphOs('');
        setCylOs('');
        setAxisOs('');
        setAddPower('');
        setPdDistance('');
        setPdNear('');
        setIsFormDirty(false);
      }
    } catch (e) {
      console.error("Failed to load prescription history", e);
    } finally {
      setLoadingHistory(false);
    }
  }, [activeCustomer.id]);

  useEffect(() => {
    // Initial Defaults
    const today = new Date().toISOString().split('T')[0];
    setExamDate(today);

    // Load Companies & Branches
    companyService.getCompanies().then(list => {
      setCompanies(list);
      if (list.length > 0) {
        setSelectedCompanyId(list[0].id);
      }
    }).catch(err => console.warn("Failed to load companies:", err));

    branchService.getBranchesV2().then(list => {
      setBranches(list);
      if (list.length > 0) {
        setSelectedBranchId(list[0].id);
      }
    }).catch(err => console.warn("Failed to load branches:", err));

    // Load history
    loadHistoryData();
  }, [loadHistoryData]);

  const handleCopyPrevious = async () => {
    try {
      const latest = await prescriptionService.copyPreviousPrescription(activeCustomer.id);
      if (latest) {
        setDoctorName(latest.DoctorName || '');
        setComplaint(latest.Complaint || '');
        setDiagnosis(latest.Diagnosis || '');
        setAdvice(latest.Advice || '');
        setRemarks(latest.Remarks || '');
        setSphOd(latest.OD_Distance_SPH || '');
        setCylOd(latest.OD_Distance_CYL || '');
        setAxisOd(latest.OD_Distance_AXIS || '');
        setSphOs(latest.OS_Distance_SPH || '');
        setCylOs(latest.OS_Distance_CYL || '');
        setAxisOs(latest.OS_Distance_AXIS || '');
        setAddPower(latest.AddPower || '');
        setPdDistance(latest.PD_Distance || '');
        setPdNear(latest.PD_Near || '');
        setIsFormDirty(true);
        setMessage("Copied latest prescription fields successfully!");
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage("No previous prescription found to copy.");
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (e) {
      console.error("Failed to copy previous prescription", e);
    }
  };

  const resetForm = () => {
    setPrescriptionId('');
    const today = new Date().toISOString().split('T')[0];
    setExamDate(today);
    setDoctorName('');
    setComplaint('');
    setDiagnosis('');
    setAdvice('');
    setRemarks('');
    setSphOd('');
    setCylOd('');
    setAxisOd('');
    setSphOs('');
    setCylOs('');
    setAxisOs('');
    setAddPower('');
    setPdDistance('');
    setPdNear('');
    setIsFormDirty(false);
  };

  const loadPrescriptionIntoForm = (p: PrescriptionPascal) => {
    setPrescriptionId(p.PrescriptionID);
    setExamDate(p.ExamDate || new Date().toISOString().split('T')[0]);
    setDoctorName(p.DoctorName || '');
    setComplaint(p.Complaint || '');
    setDiagnosis(p.Diagnosis || '');
    setAdvice(p.Advice || '');
    setRemarks(p.Remarks || '');
    setSphOd(p.OD_Distance_SPH || '');
    setCylOd(p.OD_Distance_CYL || '');
    setAxisOd(p.OD_Distance_AXIS || '');
    setSphOs(p.OS_Distance_SPH || '');
    setCylOs(p.OS_Distance_CYL || '');
    setAxisOs(p.OS_Distance_AXIS || '');
    setAddPower(p.AddPower || '');
    setPdDistance(p.PD_Distance || '');
    setPdNear(p.PD_Near || '');
    if (p.CompanyID) setSelectedCompanyId(p.CompanyID);
    if (p.BranchID) setSelectedBranchId(p.BranchID);
    setIsFormDirty(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buildPrescriptionPayload = (): Partial<PrescriptionPascal> => {
    let resolvedCompanyId = selectedCompanyId;
    let resolvedBranchId = selectedBranchId;

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('opt_current_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (!resolvedCompanyId) {
            resolvedCompanyId = parsed.companyId || parsed.CompanyID || '';
          }
          if (!resolvedBranchId) {
            resolvedBranchId = parsed.branchId || parsed.BranchID || (parsed.branches && parsed.branches[0]) || '';
          }
        }
      } catch (e) {
        console.warn("Failed to read user credentials for payload resolution:", e);
      }
    }

    if (!resolvedCompanyId) resolvedCompanyId = 'COMP-default';
    if (!resolvedBranchId) resolvedBranchId = 'BR-default';

    const payload: Partial<PrescriptionPascal> = {
      CustomerID: activeCustomer.id,
      CompanyID: resolvedCompanyId,
      BranchID: resolvedBranchId,
      DoctorName: doctorName || 'Optometrist',
      ExamDate: examDate || new Date().toISOString().split('T')[0],
      Complaint: complaint,
      Diagnosis: diagnosis,
      Advice: advice,
      Remarks: remarks,
      OD_Distance_SPH: sphOd,
      OD_Distance_CYL: cylOd,
      OD_Distance_AXIS: axisOd,
      OS_Distance_SPH: sphOs,
      OS_Distance_CYL: cylOs,
      OS_Distance_AXIS: axisOs,
      AddPower: addPower,
      PD_Distance: pdDistance,
      PD_Near: pdNear,
      Source: 'Eye Test Performed In Shop'
    };

    if (prescriptionId) {
      payload.PrescriptionID = prescriptionId;
    }

    return payload;
  };

  const handleSavePrescription = async (): Promise<PrescriptionPascal | null> => {
    console.log("ENTER handleSavePrescription");
    console.log("CustomerID:", activeCustomer.id);
    console.log("PrescriptionID:", prescriptionId || "NEW_PRESCRIPTION");
    console.log("Action: savePrescription");
    console.log("INPUT: activeCustomer.id =", activeCustomer.id, "examDate =", examDate);

    // Validation
    if (!examDate) {
      console.warn("EXIT handleSavePrescription (Validation failed: examDate is mandatory)");
      setMessage("Error: ExamDate is mandatory.");
      console.log("Return value: null");
      return null;
    }

    setSaving(true);
    setMessage('');
    try {
      // 1. Save customer if new/local
      let currentCustomer = activeCustomer;
      const isNewCustomer = !currentCustomer.id || currentCustomer.id.startsWith('CUST-local-') || currentCustomer.id.startsWith('temp-');
      if (isNewCustomer) {
        console.log("Customer is new/local. Saving customer first...", currentCustomer);
        const savedCustomer = await store.saveCustomer(currentCustomer);
        console.log("Customer saved successfully. New Customer ID:", savedCustomer.id);
        currentCustomer = savedCustomer;
        setActiveCustomer(savedCustomer);
      }

      // 2. Build prescription payload using the resolved customer ID
      const payload = buildPrescriptionPayload();
      payload.CustomerID = currentCustomer.id;
      if (prescriptionId) {
        payload.PrescriptionID = prescriptionId;
      }

      console.log("Prescription object:", payload);
      console.log("CustomerID:", currentCustomer.id);
      
      console.log("Calling savePrescription...");
      const saved = await prescriptionService.savePrescription(payload);
      setPrescriptionId(saved.PrescriptionID);
      setIsFormDirty(false);
      setMessage('Eye Test Saved Successfully.');

      // Save Eye Test Record synchronously as well!
      try {
        const eyeTestPayload: EyeTestRecord = {
          id: `et-${Date.now()}`,
          companyId: payload.CompanyID || 'COMP-default',
          branchId: payload.BranchID || 'BR-default',
          customerId: currentCustomer.id,
          eyeTestDate: examDate || new Date().toISOString().split('T')[0],
          optometristName: doctorName || 'Optometrist',
          sphOd: sphOd || '',
          cylOd: cylOd || '',
          axisOd: axisOd || '',
          sphOs: sphOs || '',
          cylOs: cylOs || '',
          axisOs: axisOs || '',
          addPower: addPower || '',
          pdDistance: pdDistance || '',
          pdNear: pdNear || '',
          segmentHeight: '',
          lensRecommendation: advice || '',
          remarks: remarks || '',
          createdAt: Date.now()
        };
        console.log("Calling saveEyeTest...");
        await eyeTestService.saveEyeTest(eyeTestPayload);
        console.log("Eye test saved successfully!");
      } catch (etErr) {
        console.warn("Failed to save eye test record inside handleSavePrescription:", etErr);
      }

      // Reload history using the (potentially new) customer ID
      const updatedHistory = await prescriptionService.loadPrescriptionHistory(currentCustomer.id);
      setHistory(updatedHistory);
      setTimeout(() => setMessage(''), 5000);
      
      console.log("Return value:", saved);
      console.log("EXIT handleSavePrescription");
      return saved;
    } catch (e: any) {
      console.error(e);
      setMessage('Failed to save Eye Test: ' + (e.message || e.toString()));
      console.log("Return value: null");
      console.log("EXIT handleSavePrescription");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleContinueBilling = async () => {
    console.log("ENTER handleContinueToBilling");
    console.log("Payload:", null);
    console.log("CustomerID:", activeCustomer.id);
    console.log("PrescriptionID:", prescriptionId || "NEW_PRESCRIPTION");
    console.log("Action: continueToBilling");
    console.log("INPUT: isFormDirty =", isFormDirty, "prescriptionId =", prescriptionId);

    // If form has unsaved changes or is a new unsaved prescription, save it first
    let activePrescription: PrescriptionPascal | null = null;
    
    if (isFormDirty || !prescriptionId) {
      setMessage('Saving current changes before billing...');
      const saved = await handleSavePrescription();
      if (!saved) {
        setMessage('Cannot proceed to billing: failed to save prescription.');
        console.log("Return value: null");
        console.log("EXIT handleContinueToBilling");
        return;
      }
      activePrescription = saved;
    } else {
      // Load current form prescription
      const currentPayload = buildPrescriptionPayload() as PrescriptionPascal;
      currentPayload.PrescriptionID = prescriptionId;
      activePrescription = currentPayload;
    }

    // Convert active prescription to standard form expected by billing screen
    const stdRecord = mapPascalToStandard(activePrescription);
    setSelectedViewPrescription(activePrescription);
    
    console.log("Navigate To Billing");
    console.log("Return value:", stdRecord);
    console.log("EXIT handleContinueToBilling");
    
    setShowBillingTypeModal(true);
  };

  const handleHistoricalRowBilling = (p: PrescriptionPascal) => {
    const stdRecord = mapPascalToStandard(p);
    onContinueToBilling(activeCustomer, stdRecord, 'direct_sale'); // Default direct sale or can select inside
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
      
      {/* LEFT 2 COLS: EXAMINATION FORM */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between bg-[#0F172A] p-6 rounded-2xl border border-white/5 shadow-2xl">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-black text-cyan-400 tracking-widest uppercase">🔬 Prescription / Eye Test</h2>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-0.5">
                Customer: <span className="text-white">{activeCustomer.name}</span> | ID: {activeCustomer.id} | Status: <span className="text-cyan-400">{activeCustomer.status || 'N/A'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyPrevious}
            className="px-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-900 border border-cyan-800/40 rounded-lg text-[10px] font-bold uppercase tracking-wider text-cyan-300 transition-all flex items-center gap-1.5 active:scale-95"
            title="Pre-fill values from the latest saved prescription"
          >
            <Copy size={12} /> Copy Previous
          </button>
        </div>

        {/* FEEDBACK STATUS */}
        {message && (
          <div className={`p-4 rounded-xl border text-center font-bold text-xs uppercase tracking-wider ${message.includes('Successfully') ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' : 'bg-blue-950/40 border-blue-500/30 text-cyan-400'}`}>
            {message}
          </div>
        )}

        {/* PRESCRIPTION FORM CARD */}
        <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-xs font-black text-white/60 uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} className="text-cyan-400" /> 
              {prescriptionId ? `Editing Prescription [${prescriptionId}]` : 'New Eye Examination / Prescription'}
            </h3>
            {prescriptionId && (
              <button
                onClick={resetForm}
                className="text-[10px] font-bold uppercase text-rose-400 hover:text-rose-300 transition-colors"
              >
                + Start New
              </button>
            )}
          </div>

          {/* BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] text-white/40 block mb-1.5 uppercase tracking-wider font-bold">Doctor / Optometrist Name</label>
              <input 
                type="text" 
                placeholder="e.g. Dr. John Doe"
                value={doctorName} 
                onChange={e => { setDoctorName(e.target.value); setIsFormDirty(true); }}
                className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-white/40 block mb-1.5 uppercase tracking-wider font-bold">Exam Date *</label>
              <input 
                type="date" 
                value={examDate} 
                onChange={e => { setExamDate(e.target.value); setIsFormDirty(true); }}
                className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-white/40 block mb-1.5 uppercase tracking-wider font-bold">Company *</label>
              <select 
                value={selectedCompanyId} 
                onChange={e => { setSelectedCompanyId(e.target.value); setIsFormDirty(true); }}
                className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.companyName} ({c.id})</option>
                ))}
                {companies.length === 0 && <option value="">Default Company</option>}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-white/40 block mb-1.5 uppercase tracking-wider font-bold">Branch *</label>
              <select 
                value={selectedBranchId} 
                onChange={e => { setSelectedBranchId(e.target.value); setIsFormDirty(true); }}
                className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.branchName} ({b.id})</option>
                ))}
                {branches.length === 0 && <option value="">Default Branch</option>}
              </select>
            </div>
          </div>

          {/* EYE POWER MATRIX */}
          <h3 className="text-xs font-black text-white/60 uppercase tracking-widest border-b border-white/5 pb-2 pt-4">
            👁️ Distance Glass Power
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OD RIGHT EYE */}
            <div className="bg-[#0F172A] p-4 rounded-xl border border-white/5 space-y-4">
              <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-wider border-b border-white/5 pb-1.5">OD (Right Eye)</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold">SPH</label>
                  <input 
                    type="text" 
                    placeholder="-0.50" 
                    value={sphOd} 
                    onChange={e => { setSphOd(e.target.value); setIsFormDirty(true); }}
                    className="w-full bg-[#1E293B] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold">CYL</label>
                  <input 
                    type="text" 
                    placeholder="-0.25" 
                    value={cylOd} 
                    onChange={e => { setCylOd(e.target.value); setIsFormDirty(true); }}
                    className="w-full bg-[#1E293B] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold">AXIS</label>
                  <input 
                    type="text" 
                    placeholder="180" 
                    value={axisOd} 
                    onChange={e => { setAxisOd(e.target.value); setIsFormDirty(true); }}
                    className="w-full bg-[#1E293B] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* OS LEFT EYE */}
            <div className="bg-[#0F172A] p-4 rounded-xl border border-white/5 space-y-4">
              <h4 className="text-[10px] font-black text-pink-400 uppercase tracking-wider border-b border-white/5 pb-1.5">OS (Left Eye)</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold">SPH</label>
                  <input 
                    type="text" 
                    placeholder="-0.75" 
                    value={sphOs} 
                    onChange={e => { setSphOs(e.target.value); setIsFormDirty(true); }}
                    className="w-full bg-[#1E293B] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold">CYL</label>
                  <input 
                    type="text" 
                    placeholder="-0.50" 
                    value={cylOs} 
                    onChange={e => { setCylOs(e.target.value); setIsFormDirty(true); }}
                    className="w-full bg-[#1E293B] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold">AXIS</label>
                  <input 
                    type="text" 
                    placeholder="90" 
                    value={axisOs} 
                    onChange={e => { setAxisOs(e.target.value); setIsFormDirty(true); }}
                    className="w-full bg-[#1E293B] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* NEAR POWERS & PD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-[10px] text-white/40 block mb-1.5 uppercase tracking-wider font-bold">Add Power (Near ADD)</label>
              <input 
                type="text" 
                placeholder="e.g. +2.00" 
                value={addPower} 
                onChange={e => { setAddPower(e.target.value); setIsFormDirty(true); }}
                className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1.5 uppercase tracking-wider font-bold">PD Distance (mm)</label>
              <input 
                type="text" 
                placeholder="e.g. 64" 
                value={pdDistance} 
                onChange={e => { setPdDistance(e.target.value); setIsFormDirty(true); }}
                className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1.5 uppercase tracking-wider font-bold">PD Near (mm)</label>
              <input 
                type="text" 
                placeholder="e.g. 61" 
                value={pdNear} 
                onChange={e => { setPdNear(e.target.value); setIsFormDirty(true); }}
                className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* CLINICAL OBSERVATIONS */}
          <h3 className="text-xs font-black text-white/60 uppercase tracking-widest border-b border-white/5 pb-2 pt-4">
            📋 Clinical Assessment & Notes
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-white/40 block mb-1.5 uppercase tracking-wider font-bold">Chief Complaint</label>
              <textarea 
                placeholder="Patient's primary vision concerns..." 
                value={complaint} 
                onChange={e => { setComplaint(e.target.value); setIsFormDirty(true); }}
                className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white h-20 focus:border-cyan-500 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-white/40 block mb-1.5 uppercase tracking-wider font-bold">Diagnosis / Findings</label>
              <textarea 
                placeholder="Optometrist clinical diagnosis..." 
                value={diagnosis} 
                onChange={e => { setDiagnosis(e.target.value); setIsFormDirty(true); }}
                className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white h-20 focus:border-cyan-500 focus:outline-none resize-none"
              />
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-white/40 block mb-1.5 uppercase tracking-wider font-bold">Doctor&apos;s Advice / Lens Recommendation</label>
                <input 
                  type="text" 
                  placeholder="e.g. Progressive Blue-Cut lenses, use for computer tasks" 
                  value={advice} 
                  onChange={e => { setAdvice(e.target.value); setIsFormDirty(true); }}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/40 block mb-1.5 uppercase tracking-wider font-bold">Remarks</label>
                <input 
                  type="text" 
                  placeholder="General notes or administrative remarks..." 
                  value={remarks} 
                  onChange={e => { setRemarks(e.target.value); setIsFormDirty(true); }}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/5">
            <button 
              type="button"
              disabled={saving}
              onClick={handleSavePrescription}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-white font-black py-3 rounded-xl uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
            >
              <Save size={16} /> {saving ? 'Saving...' : 'SAVE EYE TEST'}
            </button>
            
            <button 
              type="button"
              disabled={saving}
              onClick={handleContinueBilling}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-black py-3 rounded-xl uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
            >
              <ShoppingCart size={16} /> CONTINUE TO BILLING
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: HISTORY & CUSTOMER PROFILE */}
      <div className="space-y-6">
        
        {/* CUSTOMER PROFILE CARD */}
        <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-xs font-black text-white/60 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2">
            <User size={16} className="text-cyan-400" /> Customer File
          </h3>

          <div className="space-y-2">
            <p className="text-lg font-black text-white tracking-wider">{activeCustomer.name}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-white/40 font-bold uppercase block text-[10px]">Mobile</span>
                <span className="text-white font-mono">{activeCustomer.mobile}</span>
              </div>
              <div>
                <span className="text-white/40 font-bold uppercase block text-[10px]">Birth Date</span>
                <span className="text-white">{activeCustomer.dob || 'N/A'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-white/40 font-bold uppercase block text-[10px]">Address</span>
                <span className="text-white text-xs">{activeCustomer.address || 'No Address Logged'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PRESCRIPTION HISTORY PANEL */}
        <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-xs font-black text-white/60 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2">
            <Calendar size={16} className="text-cyan-400" /> Prescription History
          </h3>

          {loadingHistory ? (
            <div className="text-center py-10 text-white/40 font-bold text-xs uppercase tracking-widest">
              Loading saved prescriptions...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 text-white/40 font-bold text-xs uppercase tracking-widest border border-dashed border-white/10 rounded-xl">
              No prescription record found
            </div>
          ) : (
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {history.map((p, idx) => (
                <div key={p.PrescriptionID} className="bg-[#0F172A] border border-white/5 p-4 rounded-xl space-y-3 hover:border-cyan-500/30 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-black text-cyan-400 font-mono tracking-wider">{p.PrescriptionID}</p>
                      <p className="text-[10px] text-white/40 font-bold uppercase mt-0.5">
                        🗓️ {p.ExamDate} {idx === 0 && <span className="text-emerald-400 font-black ml-1.5">(LATEST)</span>}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[10px] border-y border-white/5 py-2">
                    <div>
                      <span className="text-white/40 block">SPH (R/L)</span>
                      <span className="text-white font-mono font-bold">{p.OD_Distance_SPH || '0.00'} / {p.OS_Distance_SPH || '0.00'}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">CYL (R/L)</span>
                      <span className="text-white font-mono font-bold">{p.OD_Distance_CYL || '0.00'} / {p.OS_Distance_CYL || '0.00'}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Doctor</span>
                      <span className="text-white font-bold truncate max-w-[100px] block">{p.DoctorName || 'Optometrist'}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Diagnosis</span>
                      <span className="text-white font-bold truncate max-w-[100px] block">{p.Diagnosis || 'None'}</span>
                    </div>
                  </div>

                  {p.Remarks && (
                    <p className="text-[10px] text-white/60 italic line-clamp-1">&quot;{p.Remarks}&quot;</p>
                  )}

                  {/* ACTION TRIGGERS */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => setSelectedViewPrescription(p)}
                      className="py-1 bg-white/5 hover:bg-white/10 text-white/80 rounded font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
                    >
                      <Eye size={10} /> View
                    </button>
                    <button
                      onClick={() => loadPrescriptionIntoForm(p)}
                      className="py-1 bg-cyan-950/40 hover:bg-cyan-900 text-cyan-400 rounded font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 transition-colors border border-cyan-500/20"
                    >
                      <Edit2 size={10} /> Edit
                    </button>
                    <button
                      onClick={() => handleHistoricalRowBilling(p)}
                      className="py-1 bg-emerald-950/40 hover:bg-emerald-900 text-emerald-400 rounded font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 transition-colors border border-emerald-500/20"
                    >
                      <ShoppingCart size={10} /> Bill
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL FOR VIEWING PRESCRIPTION */}
      {selectedViewPrescription && !showBillingTypeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl max-w-2xl w-full shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <h3 className="text-base font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={18} /> Prescription Details
                </h3>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider mt-0.5 font-mono">{selectedViewPrescription.PrescriptionID}</p>
              </div>
              <button 
                onClick={() => setSelectedViewPrescription(null)}
                className="text-white/40 hover:text-white font-black uppercase text-xs tracking-wider"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs border-b border-white/5 pb-4">
              <div>
                <span className="text-white/40 block uppercase text-[10px] font-bold">Exam Date</span>
                <span className="text-white font-bold">{selectedViewPrescription.ExamDate}</span>
              </div>
              <div>
                <span className="text-white/40 block uppercase text-[10px] font-bold">Examining Doctor</span>
                <span className="text-white font-bold">{selectedViewPrescription.DoctorName || 'Optometrist'}</span>
              </div>
              <div>
                <span className="text-white/40 block uppercase text-[10px] font-bold">Company ID</span>
                <span className="text-white font-mono">{selectedViewPrescription.CompanyID || 'N/A'}</span>
              </div>
              <div>
                <span className="text-white/40 block uppercase text-[10px] font-bold">Branch ID</span>
                <span className="text-white font-mono">{selectedViewPrescription.BranchID || 'N/A'}</span>
              </div>
            </div>

            {/* POWER DETAILS BOX */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0F172A] p-4 rounded-xl border border-white/5 space-y-2">
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-wider border-b border-white/5 pb-1">OD (Right Eye)</p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-white/40 block text-[9px] uppercase">SPH</span>
                    <span className="font-bold font-mono text-white">{selectedViewPrescription.OD_Distance_SPH || '0.00'}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[9px] uppercase">CYL</span>
                    <span className="font-bold font-mono text-white">{selectedViewPrescription.OD_Distance_CYL || '0.00'}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[9px] uppercase">AXIS</span>
                    <span className="font-bold font-mono text-white">{selectedViewPrescription.OD_Distance_AXIS || '0'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0F172A] p-4 rounded-xl border border-white/5 space-y-2">
                <p className="text-[10px] font-black text-pink-400 uppercase tracking-wider border-b border-white/5 pb-1">OS (Left Eye)</p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-white/40 block text-[9px] uppercase">SPH</span>
                    <span className="font-bold font-mono text-white">{selectedViewPrescription.OS_Distance_SPH || '0.00'}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[9px] uppercase">CYL</span>
                    <span className="font-bold font-mono text-white">{selectedViewPrescription.OS_Distance_CYL || '0.00'}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[9px] uppercase">AXIS</span>
                    <span className="font-bold font-mono text-white">{selectedViewPrescription.OS_Distance_AXIS || '0'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center bg-[#0F172A] p-3 rounded-xl border border-white/5">
              <div>
                <span className="text-white/40 block text-[9px] uppercase font-bold">Add Power (ADD)</span>
                <span className="text-white font-bold font-mono">{selectedViewPrescription.AddPower || 'N/A'}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[9px] uppercase font-bold">PD Distance</span>
                <span className="text-white font-bold font-mono">{selectedViewPrescription.PD_Distance || 'N/A'}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[9px] uppercase font-bold">PD Near</span>
                <span className="text-white font-bold font-mono">{selectedViewPrescription.PD_Near || 'N/A'}</span>
              </div>
            </div>

            {/* CLINICAL DATA */}
            <div className="space-y-3 bg-[#0F172A]/40 p-4 rounded-xl border border-white/5 text-xs">
              {selectedViewPrescription.Complaint && (
                <div>
                  <span className="text-white/40 font-bold uppercase text-[9px] block">Chief Complaint</span>
                  <span className="text-white">{selectedViewPrescription.Complaint}</span>
                </div>
              )}
              {selectedViewPrescription.Diagnosis && (
                <div>
                  <span className="text-white/40 font-bold uppercase text-[9px] block">Diagnosis</span>
                  <span className="text-white">{selectedViewPrescription.Diagnosis}</span>
                </div>
              )}
              {selectedViewPrescription.Advice && (
                <div>
                  <span className="text-white/40 font-bold uppercase text-[9px] block">Doctor&apos;s Advice / Lens Choice</span>
                  <span className="text-white">{selectedViewPrescription.Advice}</span>
                </div>
              )}
              {selectedViewPrescription.Remarks && (
                <div>
                  <span className="text-white/40 font-bold uppercase text-[9px] block">Remarks</span>
                  <span className="text-white italic">&quot;{selectedViewPrescription.Remarks}&quot;</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-3">
              <button
                onClick={() => {
                  loadPrescriptionIntoForm(selectedViewPrescription);
                  setSelectedViewPrescription(null);
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Load/Edit Prescription
              </button>
              <button
                onClick={() => {
                  const std = mapPascalToStandard(selectedViewPrescription);
                  onContinueToBilling(activeCustomer, std, 'direct_sale');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Billing Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BILLING TYPE MODAL */}
      {showBillingTypeModal && selectedViewPrescription && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-black text-cyan-400 uppercase tracking-widest">Select Billing Type</h3>
              <p className="text-xs text-white/60 mt-1">Choose how you would like to proceed with the billing for {activeCustomer.name}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => {
                  const std = mapPascalToStandard(selectedViewPrescription!);
                  onContinueToBilling(activeCustomer, std, 'direct_sale');
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-xl font-bold flex items-center justify-between transition-colors shadow-lg text-left active:scale-[0.98]"
              >
                <div>
                  <p className="text-sm font-black uppercase tracking-wider">🧾 Direct Sale Invoice</p>
                  <p className="text-[10px] text-emerald-100 mt-1">Immediate checkout & full payment</p>
                </div>
                <span className="text-xl">➔</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const std = mapPascalToStandard(selectedViewPrescription!);
                  onContinueToBilling(activeCustomer, std, 'sales_order');
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-xl font-bold flex items-center justify-between transition-colors shadow-lg text-left active:scale-[0.98]"
              >
                <div>
                  <p className="text-sm font-black uppercase tracking-wider">📋 Sales Order</p>
                  <p className="text-[10px] text-purple-100 mt-1">Pending order, lab processing & advance payment</p>
                </div>
                <span className="text-xl">➔</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowBillingTypeModal(false);
              }}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
            >
              Cancel Billing Selection
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

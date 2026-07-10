'use client';

import { useState, useEffect } from 'react';
import { Customer } from '@/lib/types';
import { eyeTestService, EyeTestRecord } from '@/lib/services/eyeTestService';
import { companyService, Company } from '@/lib/services/companyService';
import { branchService, Branch } from '@/lib/services/branchService';
import { ArrowLeft, Save, ShoppingCart, Activity } from 'lucide-react';

interface Props {
  customer: Customer;
  onBack: () => void;
  onContinueToBilling: (customer: Customer, eyeTest: EyeTestRecord, billingType: 'direct_sale' | 'sales_order') => void;
}

export function EyeTestFormView({ customer, onBack, onContinueToBilling }: Props) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [eyeTestId, setEyeTestId] = useState('');
  const [eyeTestDate, setEyeTestDate] = useState('');
  const [optometristName, setOptometristName] = useState('');

  // Distance Vision
  const [sphOd, setSphOd] = useState('');
  const [cylOd, setCylOd] = useState('');
  const [axisOd, setAxisOd] = useState('');
  const [sphOs, setSphOs] = useState('');
  const [cylOs, setCylOs] = useState('');
  const [axisOs, setAxisOs] = useState('');
  const [addPower, setAddPower] = useState('');

  // Additional Measurements
  const [pdDistance, setPdDistance] = useState('');
  const [pdNear, setPdNear] = useState('');
  const [segmentHeight, setSegmentHeight] = useState('');
  const [lensRecommendation, setLensRecommendation] = useState('');
  const [remarks, setRemarks] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Billing selection modal states
  const [showBillingTypeModal, setShowBillingTypeModal] = useState(false);
  const [savedEyeTest, setSavedEyeTest] = useState<EyeTestRecord | null>(null);

  useEffect(() => {
    // Generate Eye Test ID
    const genId = 'ET-' + Math.random().toString(36).substring(2, 11).toUpperCase();
    setEyeTestId(genId);

    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    setEyeTestDate(today);

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
  }, []);

  const buildEyeTestRecord = (): EyeTestRecord => {
    return {
      id: eyeTestId,
      companyId: selectedCompanyId || 'COMP-default',
      branchId: selectedBranchId || 'BR-default',
      customerId: customer.id,
      eyeTestDate,
      optometristName,
      sphOd,
      cylOd,
      axisOd,
      sphOs,
      cylOs,
      axisOs,
      addPower,
      pdDistance,
      pdNear,
      segmentHeight,
      lensRecommendation,
      remarks,
      createdAt: Date.now()
    };
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const record = buildEyeTestRecord();
      await eyeTestService.saveEyeTest(record);
      setMessage('Eye Test Saved Successfully.');
      setTimeout(() => {
        onBack(); // Return to Customer list/profile
      }, 2000);
    } catch (e: any) {
      console.error(e);
      setMessage('Failed to save Eye Test.');
    } finally {
      setSaving(false);
    }
  };

  const handleContinueBilling = async () => {
    setSaving(true);
    setMessage('');
    try {
      const record = buildEyeTestRecord();
      const savedRecord = await eyeTestService.saveEyeTest(record);
      setSavedEyeTest(savedRecord);
      setMessage('Eye Test Saved Successfully. Please Choose Billing Type...');
      setTimeout(() => {
        setMessage('');
        setShowBillingTypeModal(true);
      }, 1000);
    } catch (e: any) {
      console.error(e);
      setMessage('Failed to save Eye Test.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between bg-[#0F172A] p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-black text-cyan-400 tracking-widest uppercase">🔬 Eye Examination</h2>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-0.5">
              Customer: <span className="text-white">{customer.name}</span> | ID: {customer.id}
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border text-center font-bold text-xs uppercase tracking-wider ${message.includes('Successfully') || message.includes('Redirecting') ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' : 'bg-rose-950/40 border-rose-500/30 text-rose-400'}`}>
          {message}
        </div>
      )}

      <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
        <h3 className="text-xs font-black text-white/60 uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2">
          <Activity size={16} className="text-cyan-400" /> Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] text-white/40 block mb-1.5 uppercase tracking-wider font-bold">Customer</label>
            <input 
              type="text" 
              readOnly 
              value={customer.name} 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-white/40 block mb-1.5 uppercase tracking-wider font-bold">Company ID *</label>
            <select 
              value={selectedCompanyId} 
              onChange={e => setSelectedCompanyId(e.target.value)}
              className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.companyName} ({c.id})</option>
              ))}
              {companies.length === 0 && <option value="">Default Company</option>}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-white/40 block mb-1.5 uppercase tracking-wider font-bold">Branch ID *</label>
            <select 
              value={selectedBranchId} 
              onChange={e => setSelectedBranchId(e.target.value)}
              className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.branchName} ({b.id})</option>
              ))}
              {branches.length === 0 && <option value="">Default Branch</option>}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-white/40 block mb-1.5 uppercase tracking-wider font-bold">Eye Test ID</label>
            <input 
              type="text" 
              readOnly 
              value={eyeTestId} 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-cyan-400 font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-white/40 block mb-1.5 uppercase tracking-wider font-bold">Eye Test Date</label>
            <input 
              type="date" 
              value={eyeTestDate} 
              onChange={e => setEyeTestDate(e.target.value)}
              className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-white/40 block mb-1.5 uppercase tracking-wider font-bold">Optometrist Name</label>
            <input 
              type="text" 
              placeholder="e.g. Dr. John Doe" 
              value={optometristName} 
              onChange={e => setOptometristName(e.target.value)}
              className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Distance Vision Section */}
        <h3 className="text-xs font-black text-white/60 uppercase tracking-widest border-b border-white/5 pb-3 pt-4">
          👁️ Distance Vision
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Right Eye */}
          <div className="bg-[#0F172A] p-4 rounded-xl border border-white/5 space-y-4">
            <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-wider border-b border-white/5 pb-1.5">OD (Right Eye)</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold">SPH</label>
                <input 
                  type="text" 
                  placeholder="-0.50" 
                  value={sphOd} 
                  onChange={e => setSphOd(e.target.value)}
                  className="w-full bg-[#1E293B] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold">CYL</label>
                <input 
                  type="text" 
                  placeholder="-0.25" 
                  value={cylOd} 
                  onChange={e => setCylOd(e.target.value)}
                  className="w-full bg-[#1E293B] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold">AXIS</label>
                <input 
                  type="text" 
                  placeholder="180" 
                  value={axisOd} 
                  onChange={e => setAxisOd(e.target.value)}
                  className="w-full bg-[#1E293B] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Left Eye */}
          <div className="bg-[#0F172A] p-4 rounded-xl border border-white/5 space-y-4">
            <h4 className="text-[10px] font-black text-pink-400 uppercase tracking-wider border-b border-white/5 pb-1.5">OS (Left Eye)</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold">SPH</label>
                <input 
                  type="text" 
                  placeholder="-0.75" 
                  value={sphOs} 
                  onChange={e => setSphOs(e.target.value)}
                  className="w-full bg-[#1E293B] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold">CYL</label>
                <input 
                  type="text" 
                  placeholder="-0.50" 
                  value={cylOs} 
                  onChange={e => setCylOs(e.target.value)}
                  className="w-full bg-[#1E293B] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold">AXIS</label>
                <input 
                  type="text" 
                  placeholder="90" 
                  value={axisOs} 
                  onChange={e => setAxisOs(e.target.value)}
                  className="w-full bg-[#1E293B] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Add Power */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-white/40 block mb-1.5 uppercase tracking-wider font-bold">Add Power (Near ADD)</label>
            <input 
              type="text" 
              placeholder="+2.00" 
              value={addPower} 
              onChange={e => setAddPower(e.target.value)}
              className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Additional Measurements */}
        <h3 className="text-xs font-black text-white/60 uppercase tracking-widest border-b border-white/5 pb-3 pt-4">
          📐 Additional Measurements & Recommendation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] text-white/40 block mb-1.5 uppercase tracking-wider font-bold">PD Distance</label>
            <input 
              type="text" 
              placeholder="e.g. 64" 
              value={pdDistance} 
              onChange={e => setPdDistance(e.target.value)}
              className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-white/40 block mb-1.5 uppercase tracking-wider font-bold">PD Near</label>
            <input 
              type="text" 
              placeholder="e.g. 61" 
              value={pdNear} 
              onChange={e => setPdNear(e.target.value)}
              className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-white/40 block mb-1.5 uppercase tracking-wider font-bold">Segment Height</label>
            <input 
              type="text" 
              placeholder="e.g. 18mm" 
              value={segmentHeight} 
              onChange={e => setSegmentHeight(e.target.value)}
              className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-white/40 block mb-1.5 uppercase tracking-wider font-bold">Lens Recommendation</label>
            <input 
              type="text" 
              placeholder="e.g. Progressive Blue Cut Lens" 
              value={lensRecommendation} 
              onChange={e => setLensRecommendation(e.target.value)}
              className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-white/40 block mb-1.5 uppercase tracking-wider font-bold">Remarks / Instructions</label>
            <input 
              type="text" 
              placeholder="Any other observations..." 
              value={remarks} 
              onChange={e => setRemarks(e.target.value)}
              className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/5">
          <button 
            type="button"
            disabled={saving}
            onClick={handleSave}
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
            <ShoppingCart size={16} /> {saving ? 'Processing...' : 'CONTINUE TO BILLING'}
          </button>
        </div>
      </div>

      {showBillingTypeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-black text-cyan-400 uppercase tracking-widest">Select Billing Type</h3>
              <p className="text-xs text-white/60 mt-1">Choose how you would like to proceed with the billing for {customer.name}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => {
                  if (savedEyeTest) {
                    onContinueToBilling(customer, savedEyeTest, 'direct_sale');
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-xl font-bold flex items-center justify-between transition-colors shadow-lg text-left"
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
                  if (savedEyeTest) {
                    onContinueToBilling(customer, savedEyeTest, 'sales_order');
                  }
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-xl font-bold flex items-center justify-between transition-colors shadow-lg text-left"
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
                onBack(); // Return to customer list/profile
              }}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
            >
              Cancel Billing (Eye Test Remains Saved)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

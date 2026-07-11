'use client';

import { useState, useMemo } from 'react';
import { Customer } from '@/lib/types';
import { useStore } from '@/lib/store';
import { Search, UserPlus } from 'lucide-react';

interface Props {
  selectedCustomer: Customer | null;
  onSelect: (c: Customer) => void;
}

export function CustomerSelect({ selectedCustomer, onSelect }: Props) {
  const { getCustomers, saveCustomer } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState('');
  
  // Customer form state (used for both Add and Edit)
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');

  const customers = getCustomers();
  
  const filteredCustomers = useMemo(() => {
    if (!String(search ?? "").trim()) return [];
    const query = search.toLowerCase();
    return customers.filter(c => 
      (c.name && c.name.toLowerCase().includes(query)) || 
      (c.mobile && String(c.mobile).includes(query))
    ).slice(0, 5); // top 5 results
  }, [search, customers]);

  const handleSaveCustomer = async () => {
    if (!name || !mobile) {
      alert("Name and Mobile are required");
      return;
    }
    
    // Explicitly set ID to blank if we are adding a brand-new customer
    // This triggers createCustomer() instead of updateCustomer()
    const customerPayload: Customer = {
      id: isEditing && selectedCustomer ? selectedCustomer.id : '', 
      name,
      mobile,
      dob,
      address,
      createdAt: isEditing && selectedCustomer ? selectedCustomer.createdAt : Date.now()
    };

    try {
      const saved = await saveCustomer(customerPayload);
      onSelect(saved);
      setIsAdding(false);
      setIsEditing(false);
      setSearch('');
    } catch (err: any) {
      alert("Failed to save customer: " + err.message);
    }
  };

  const handleStartEditing = () => {
    if (!selectedCustomer) return;
    setName(selectedCustomer.name);
    setMobile(selectedCustomer.mobile);
    setDob(selectedCustomer.dob || '');
    setAddress(selectedCustomer.address || '');
    setIsEditing(true);
    setIsAdding(false);
  };

  const handleStartAdding = () => {
    setName('');
    setMobile('');
    setDob('');
    setAddress('');
    setIsAdding(true);
    setIsEditing(false);
  };

  if (selectedCustomer && !isAdding && !isEditing) {
    return (
      <div className="bg-cyan-900/20 border border-cyan-500/20 p-4 rounded-xl flex justify-between items-center">
        <div>
          <p className="font-bold text-lg text-white">{selectedCustomer.name}</p>
          <p className="text-sm text-cyan-200/60">📞 {selectedCustomer.mobile} | 🏠 {selectedCustomer.address || 'N/A'}</p>
        </div>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={handleStartEditing}
            className="text-xs font-bold text-yellow-400 hover:text-yellow-300 px-3 py-1 rounded border border-yellow-500/30 bg-yellow-900/40 uppercase tracking-wider transition-colors"
          >
            Edit Details
          </button>
          <button 
            type="button"
            onClick={() => onSelect(null as any)}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 px-3 py-1 rounded border border-cyan-500/30 bg-cyan-900/40 uppercase tracking-wider transition-colors"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  if (isAdding || isEditing) {
    return (
      <div className="bg-[#1E293B] p-4 rounded-xl border border-white/10">
        <h3 className="font-black mb-3 flex items-center gap-2 text-emerald-400 uppercase tracking-wider text-xs">
          <UserPlus size={16} /> {isEditing ? 'Edit Customer Details' : 'Add New Customer'}
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input 
            type="text" placeholder="Full Name *" 
            className="bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white font-bold placeholder:text-white/30 focus:border-cyan-500 focus:outline-none"
            value={name} onChange={e => setName(e.target.value)}
          />
          <input 
            type="text" placeholder="Mobile Number *" 
            className="bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white font-bold placeholder:text-white/30 focus:border-cyan-500 focus:outline-none"
            value={mobile} onChange={e => setMobile(e.target.value)}
          />
          <input 
            type="date" placeholder="DOB" 
            className="bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:border-cyan-500 focus:outline-none"
            value={dob} onChange={e => setDob(e.target.value)}
          />
          <input 
            type="text" placeholder="Address" 
            className="bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white font-bold placeholder:text-white/30 focus:border-cyan-500 focus:outline-none"
            value={address} onChange={e => setAddress(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={handleSaveCustomer} 
            className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg font-black uppercase text-xs transition-colors"
          >
            {isEditing ? 'Update Customer' : 'Save & Select'}
          </button>
          <button 
            type="button"
            onClick={() => {
              setIsAdding(false);
              setIsEditing(false);
            }} 
            className="bg-[#020617] hover:bg-white/5 border border-white/10 text-white/60 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 flex flex-col gap-2">
        <label className="text-[10px] font-bold text-white/40 uppercase">Search Customer / Mobile</label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-white/40" size={18} />
          <input 
            type="text" 
            placeholder="Search by mobile or name..." 
            className="w-full bg-[#1E293B] border border-white/10 rounded-lg pl-10 pr-4 py-2 font-bold text-white focus:outline-none focus:border-cyan-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        {search && filteredCustomers.length > 0 && (
          <div className="absolute z-10 bg-[#1E293B] border border-white/10 rounded-xl overflow-hidden mt-[65px] w-full max-w-sm shadow-xl">
            {filteredCustomers.map(c => (
              <button 
                key={c.id} 
                onClick={() => onSelect(c)}
                className="w-full text-left p-3 hover:bg-white/5 border-b border-white/10 last:border-0 flex justify-between items-center"
              >
                <div>
                  <span className="font-bold text-white">{c.name}</span>
                  <span className="text-white/60 text-xs ml-2">{c.mobile}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {search && filteredCustomers.length === 0 && (
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mt-1">No customers found.</p>
        )}
      </div>

      <div className="w-[1px] h-12 bg-white/5 mx-2"></div>
      
      <button 
        onClick={handleStartAdding}
        className="flex flex-col items-center gap-1 text-emerald-400 group hover:text-emerald-300 transition-colors"
      >
        <div className="text-3xl">➕</div>
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400/80 group-hover:text-emerald-300">New Customer</span>
      </button>
    </div>
  );
}

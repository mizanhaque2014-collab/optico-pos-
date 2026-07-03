'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { Users, Search, ArrowLeft } from 'lucide-react';
import { Customer } from '@/lib/types';
import { CustomerProfileView } from './CustomerProfileView';

interface Props {
  onBack: () => void;
  onNavigateTo?: (view: any, customer?: any) => void;
}

export function CustomersView({ onBack, onNavigateTo }: Props) {
  const { getCustomers } = useStore();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const customers = useMemo(() => getCustomers(), []);

  const filtered = useMemo(() => {
    if(!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(q) || 
      (c.mobile && String(c.mobile).includes(q))
    );
  }, [search, customers]);

  if (selectedCustomer) {
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedCustomer(null)} className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-wider flex items-center gap-2 mb-4 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg w-fit transition-colors">
          <ArrowLeft size={14}/> Back to Customers
        </button>
        <CustomerProfileView customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} onNavigateTo={onNavigateTo} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5 shadow-2xl">
        <h2 className="text-sm font-black text-white/60 mb-6 flex items-center gap-2 uppercase tracking-widest border-b border-white/5 pb-4">
          <Users className="text-orange-400" size={18} /> Customer Database
        </h2>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3.5 text-white/40" size={18} />
          <input 
            type="text" 
            placeholder="Search customers by name or mobile..." 
            className="w-full bg-[#1E293B] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-bold focus:outline-none focus:border-orange-500 placeholder:text-white/20"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-white/40 text-[10px] font-bold tracking-widest text-center py-8 uppercase">No customers found.</p>
          ) : (
            filtered.map(c => (
               <button 
                 key={c.id}
                 onClick={() => setSelectedCustomer(c)} 
                 className="w-full text-left bg-[#1E293B] border border-white/5 p-5 rounded-xl flex items-center justify-between hover:bg-[#1E293B]/80 hover:border-orange-500/30 transition-colors shadow-sm"
               >
                <div>
                  <h3 className="font-black text-lg text-white tracking-widest">{c.name}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mt-1">📞 {c.mobile}</p>
                </div>
                <div className="text-right text-[10px] font-bold text-white/40 uppercase tracking-wider space-y-1">
                  <p>{c.address || 'No Address'}</p>
                  <p className="opacity-60">Added: {new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

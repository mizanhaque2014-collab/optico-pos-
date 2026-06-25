'use client';

import { useState } from 'react';
import { OrderItem, LensCategory, LensBrand, LensFeature } from '@/lib/types';
import { Eye } from 'lucide-react';

interface Props {
  onAdd: (item: OrderItem) => void;
}

const CATEGORIES: LensCategory[] = ['Single Vision', 'Bifocal', 'Progressive', 'Blue Cut', 'Photochromic', 'Anti Glare', 'High Index', 'Polycarbonate', 'Office Lens', 'Kids Lens', 'Driving Lens', 'Other'];
const BRANDS: LensBrand[] = ['Essilor', 'Crizal', 'Kodak', 'Zeiss', 'Hoya', 'Prime', 'GKB', 'Vision Rx', 'Local Brand', 'Other'];
const FEATURES: LensFeature[] = ['Blue Cut', 'UV Protection', 'Anti Glare', 'Scratch Resistant', 'Photochromic', 'Progressive', 'Water Repellent', 'Dust Resistant', 'Digital Protection', 'Polarized', 'High Index'];

export function LensSection({ onAdd }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<LensCategory>('Single Vision');
  const [brand, setBrand] = useState<LensBrand>('Local Brand');
  const [features, setFeatures] = useState<LensFeature[]>([]);
  const [qty, setQty] = useState(0);
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);

  const toggleFeature = (f: LensFeature) => {
    if (features.includes(f)) {
      setFeatures(features.filter(x => x !== f));
    } else {
      setFeatures([...features, f]);
    }
  };

  const handleAdd = () => {
    onAdd({
      id: crypto.randomUUID(),
      itemType: 'lens',
      lensCategory: category,
      lensBrand: brand,
      lensFeatures: features,
      quantity: qty,
      sellingPrice: price,
      discount,
      finalAmount: (price * qty) - discount
    });
    setQty(1); setPrice(0); setDiscount(0); setFeatures([]);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-[#1E293B] border border-white/5 hover:border-purple-500 hover:bg-[#1E293B]/80 p-4 rounded-xl flex items-center justify-between transition-colors shadow-sm"
      >
        <div className="flex items-center gap-3">
          <Eye className="text-purple-400" size={20} />
          <span className="font-bold text-sm tracking-wider uppercase text-white/80">Add Lenses</span>
        </div>
        <span className="text-xl text-white/40 font-bold">+</span>
      </button>
    );
  }

  return (
    <div className="bg-[#1E293B] border border-white/10 p-5 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
        <h3 className="font-black flex items-center gap-2 text-purple-400 uppercase text-xs tracking-wider"><Eye size={18} /> New Lens Entry</h3>
        <button onClick={() => setIsOpen(false)} className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-wider px-2 py-1 bg-white/5 rounded">Cancel</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="col-span-2">
          <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold tracking-wider">Category</label>
          <select className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:border-purple-500 focus:outline-none" value={category} onChange={e => setCategory(e.target.value as LensCategory)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold tracking-wider">Brand</label>
          <select className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:border-purple-500 focus:outline-none" value={brand} onChange={e => setBrand(e.target.value as LensBrand)}>
            {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="col-span-4">
          <label className="text-[10px] text-white/40 block mb-2 uppercase font-bold tracking-wider">Lens Features</label>
          <div className="flex flex-wrap gap-2">
            {FEATURES.map(f => (
              <button
                key={f}
                onClick={() => toggleFeature(f)}
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                  features.includes(f) ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                }`}
              >
                {f} {features.includes(f) ? '✕' : ''}
              </button>
            ))}
          </div>
        </div>
        
        <div className="col-span-1">
          <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold tracking-wider">Quantity</label>
          <input type="number" min="1" className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:border-purple-500 focus:outline-none" value={qty === 0 ? '' : qty} onChange={e => setQty(Number(e.target.value))} />
        </div>
        <div className="col-span-1">
          <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold tracking-wider">Price (₹)</label>
          <input type="number" min="0" className="w-full bg-cyan-900/40 border border-cyan-500/30 rounded-lg px-3 py-2 font-black text-cyan-400 focus:outline-none focus:border-cyan-400" value={price === 0 ? '' : price} onChange={e => setPrice(Number(e.target.value))} />
        </div>
        <div className="col-span-1">
          <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold tracking-wider">Discount (₹)</label>
          <input type="number" min="0" className="w-full bg-rose-900/20 border border-rose-500/30 rounded-lg px-3 py-2 font-black text-rose-400 focus:outline-none focus:border-rose-400" value={discount === 0 ? '' : discount} onChange={e => setDiscount(Number(e.target.value))} />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={handleAdd} className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2 rounded-lg text-xs tracking-wider uppercase transition-colors">
          Add Lenses (₹{(price * qty) - discount})
        </button>
      </div>
    </div>
  );
}

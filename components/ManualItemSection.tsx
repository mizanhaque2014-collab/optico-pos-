'use client';

import { useState } from 'react';
import { OrderItem } from '@/lib/types';
import { PlusCircle } from 'lucide-react';

interface Props {
  onAdd: (item: OrderItem) => void;
}

export function ManualItemSection({ onAdd }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);

  const handleAdd = () => {
    onAdd({
      id: crypto.randomUUID(),
      itemType: 'manual',
      itemName: itemName || 'Custom Item',
      description,
      quantity: qty,
      sellingPrice: price,
      discount,
      finalAmount: (price * qty) - discount
    });
    setItemName(''); setDescription(''); setQty(1); setPrice(0); setDiscount(0);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-[#1E293B] border border-white/5 hover:border-amber-500 hover:bg-[#1E293B]/80 p-4 rounded-xl flex items-center justify-between transition-colors shadow-sm"
      >
        <div className="flex items-center gap-3">
          <PlusCircle className="text-amber-400" size={20} />
          <span className="font-bold text-sm tracking-wider uppercase text-white/80">Add Manual Item</span>
        </div>
        <span className="text-xl text-white/40 font-bold">+</span>
      </button>
    );
  }

  return (
    <div className="bg-[#1E293B] border border-white/10 p-5 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
        <h3 className="font-black flex items-center gap-2 text-amber-400 uppercase text-xs tracking-wider"><PlusCircle size={18} /> New Manual Item</h3>
        <button onClick={() => setIsOpen(false)} className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-wider px-2 py-1 bg-white/5 rounded">Cancel</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="col-span-2 md:col-span-4">
          <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold tracking-wider">Item Name</label>
          <input type="text" className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:border-amber-500 focus:outline-none" value={itemName} onChange={e => setItemName(e.target.value)} />
        </div>
        <div className="col-span-2 md:col-span-4">
          <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold tracking-wider">Description</label>
          <input type="text" className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:border-amber-500 focus:outline-none placeholder:text-white/20" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className="col-span-1">
          <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold tracking-wider">Quantity</label>
          <input type="number" min="1" className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:border-amber-500 focus:outline-none" value={qty} onChange={e => setQty(Number(e.target.value))} />
        </div>
        <div className="col-span-1">
          <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold tracking-wider">Price (₹)</label>
          <input type="number" min="0" className="w-full bg-cyan-900/40 border border-cyan-500/30 rounded-lg px-3 py-2 font-black text-cyan-400 focus:outline-none focus:border-cyan-400" value={price} onChange={e => setPrice(Number(e.target.value))} />
        </div>
        <div className="col-span-1">
          <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold tracking-wider">Discount (₹)</label>
          <input type="number" min="0" className="w-full bg-rose-900/20 border border-rose-500/30 rounded-lg px-3 py-2 font-black text-rose-400 focus:outline-none focus:border-rose-400" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={handleAdd} className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-2 rounded-lg text-xs tracking-wider uppercase transition-colors">
          Add Form Item (₹{(price * qty) - discount})
        </button>
      </div>
    </div>
  );
}

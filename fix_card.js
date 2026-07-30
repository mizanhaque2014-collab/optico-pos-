const fs = require('fs');
let code = fs.readFileSync('components/SalesOrderDetailCard.tsx', 'utf-8');

// Replace the filters
const oldFilters = `  const parsedItems = Array.isArray(inv.items) ? inv.items : (typeof inv.items === 'string' ? JSON.parse(inv.items) : []);
  const frames = parsedItems.filter((item: any) => (item.itemType?.toLowerCase() === 'frame' || item.type?.toLowerCase() === 'frame') && item.productType !== 'Sunglass');
  const lenses = parsedItems.filter((item: any) => item.itemType?.toLowerCase() === 'lens' || item.type?.toLowerCase() === 'lens');
  const sunglasses = parsedItems.filter((item: any) => (item.itemType?.toLowerCase() === 'frame' || item.type?.toLowerCase() === 'frame') && item.productType === 'Sunglass');
  const accessories = parsedItems.filter((item: any) => item.itemType?.toLowerCase() === 'manual' || item.type?.toLowerCase() === 'manual');`;

const newFilters = `  const parsedItems = Array.isArray(inv.items) ? inv.items : (typeof inv.items === 'string' ? JSON.parse(inv.items) : []);

  const isSunglass = (item: any) => {
    const t = String(item.itemType || item.type || item.category || '').toLowerCase();
    const pt = String(item.productType || '').toLowerCase();
    return t.includes('sunglass') || pt.includes('sunglass');
  };

  const isLens = (item: any) => {
    const t = String(item.itemType || item.type || item.category || '').toLowerCase();
    const pt = String(item.productType || '').toLowerCase();
    return t.includes('lens') || pt.includes('lens') || item.lensBrand || item.lensType || item.lensCategory;
  };

  const isAccessory = (item: any) => {
    const t = String(item.itemType || item.type || item.category || '').toLowerCase();
    const pt = String(item.productType || '').toLowerCase();
    return t === 'manual' || t.includes('access') || pt.includes('access');
  };

  const isFrame = (item: any) => {
    if (isSunglass(item) || isLens(item) || isAccessory(item)) return false;
    const t = String(item.itemType || item.type || item.category || '').toLowerCase();
    const pt = String(item.productType || '').toLowerCase();
    if (t.includes('frame') || pt.includes('frame')) return true;
    if (item.brand || item.model || item.modelNumber) return true; // fallback for manual frames
    return false;
  };

  const frames = parsedItems.filter(isFrame);
  const lenses = parsedItems.filter(isLens);
  const sunglasses = parsedItems.filter(isSunglass);
  const accessories = parsedItems.filter(isAccessory);`;

code = code.replace(oldFilters, newFilters);

// Replace "No Frame Selected" block
const oldFramesBlock = `        <div className="space-y-3 mt-6">
          <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
             👓 Frame Details
          </h4>
          {frames.length === 0 ? (
            <p className="text-xs font-bold text-white/30 uppercase tracking-wider p-4 bg-white/5 rounded-xl text-center">No Frame Selected</p>
          ) : (
            frames.map((frame: any, idx: number) => (
              <div key={idx} className="bg-[#1E293B] border border-white/5 p-4 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Brand</span><span className="font-bold text-white">{frame.brand || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Model</span><span className="font-bold text-white">{frame.modelNumber || frame.model || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Code</span><span className="font-bold text-white">{frame.frameCode || frame.itemCode || frame.code || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Category</span><span className="font-bold text-white">{frame.frameCategory || frame.productType || frame.category || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Color</span><span className="font-bold text-white">{frame.color || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Size</span><span className="font-bold text-white">{frame.frameSize || frame.size || 'N/A'}</span></div>
                 
                 <div className="col-span-2 md:col-span-4 border-t border-white/5 pt-3 mt-1 grid grid-cols-4 gap-4 bg-white/5 p-3 rounded-lg">
                    <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Quantity</span><span className="font-black text-white">{frame.quantity || 1}</span></div>
                    <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Unit Price</span><span className="font-black text-white">₹{frame.sellingPrice || frame.price || 0}</span></div>
                    <div><span className="block text-[9px] text-rose-400 uppercase tracking-wider mb-1">Discount</span><span className="font-black text-rose-400">₹{frame.discount || 0}</span></div>
                    <div><span className="block text-[9px] text-emerald-400 uppercase tracking-wider mb-1">Final Amount</span><span className="font-black text-emerald-400 text-sm">₹{frame.finalAmount || 0}</span></div>
                 </div>
              </div>
            ))
          )}
        </div>`;

// Wait, let's use regex for replacing the entire frames block since I might have slightly different text in my file.

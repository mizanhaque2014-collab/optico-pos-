const fs = require('fs');
let code = fs.readFileSync('components/SalesOrderDetailCard.tsx', 'utf-8');

// Replace frames
code = code.replace(
  /<div className="space-y-3 mt-6">[\s\S]*?<h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 border-b border-white\/5 pb-2">[\s\S]*?👓 Frame Details[\s\S]*?<\/h4>[\s\S]*?\{frames\.length === 0 \? \([\s\S]*?<\/div>[\s\S]*?\)\)[\s\S]*?\}[\s\S]*?<\/div>/m,
  `{frames.length > 0 && (
        <div className="space-y-3 mt-6">
          <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
             👓 Frame Details
          </h4>
          {frames.map((frame: any, idx: number) => (
            <div key={idx} className="bg-[#1E293B] border border-white/5 p-4 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Brand</span><span className="font-bold text-white">{frame.brand || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Model</span><span className="font-bold text-white">{frame.modelNumber || frame.model || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Code</span><span className="font-bold text-white">{frame.frameCode || frame.itemCode || frame.code || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Category</span><span className="font-bold text-white">{frame.frameCategory || frame.productType || frame.category || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Color</span><span className="font-bold text-white">{frame.color || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Size</span><span className="font-bold text-white">{frame.frameSize || frame.size || 'N/A'}</span></div>
               
               <div className="col-span-2 md:col-span-4 border-t border-white/5 pt-3 mt-1 grid grid-cols-4 gap-4 bg-white/5 p-3 rounded-lg">
                  <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Quantity</span><span className="font-black text-white">{frame.quantity || 1}</span></div>
                  <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Unit Price</span><span className="font-black text-white">₹{frame.sellingPrice || frame.price || frame.purchasePrice || 0}</span></div>
                  <div><span className="block text-[9px] text-rose-400 uppercase tracking-wider mb-1">Discount</span><span className="font-black text-rose-400">₹{frame.discount || 0}</span></div>
                  <div><span className="block text-[9px] text-emerald-400 uppercase tracking-wider mb-1">Final Amount</span><span className="font-black text-emerald-400 text-sm">₹{frame.finalAmount || 0}</span></div>
               </div>
            </div>
          ))}
        </div>
        )}`
);

// Replace lenses
code = code.replace(
  /<div className="space-y-3 mt-6">[\s\S]*?<h4 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2 border-b border-white\/5 pb-2">[\s\S]*?🔍 Lens Details[\s\S]*?<\/h4>[\s\S]*?\{lenses\.length === 0 \? \([\s\S]*?<\/div>[\s\S]*?\)\)[\s\S]*?\}[\s\S]*?<\/div>/m,
  `{lenses.length > 0 && (
        <div className="space-y-3 mt-6">
          <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
             🔍 Lens Details
          </h4>
          {lenses.map((lens: any, idx: number) => (
            <div key={idx} className="bg-[#1E293B] border border-white/5 p-4 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Brand</span><span className="font-bold text-white">{lens.lensBrand || lens.brand || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Category</span><span className="font-bold text-white">{lens.lensCategory || lens.category || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Type</span><span className="font-bold text-white">{lens.lensType || lens.type || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Index</span><span className="font-bold text-white">{lens.lensIndex || lens.index || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Coating</span><span className="font-bold text-white">{lens.lensCoating || lens.coating || 'N/A'}</span></div>
               <div className="col-span-2 md:col-span-3"><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Features</span><span className="font-bold text-white">{lens.lensFeatures ? (Array.isArray(lens.lensFeatures) ? lens.lensFeatures.join(', ') : lens.lensFeatures) : lens.features || 'N/A'}</span></div>
               
               <div className="col-span-2 md:col-span-4 border-t border-white/5 pt-3 mt-1 grid grid-cols-4 gap-4 bg-white/5 p-3 rounded-lg">
                  <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Quantity</span><span className="font-black text-white">{lens.quantity || 1}</span></div>
                  <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Price</span><span className="font-black text-white">₹{lens.sellingPrice || lens.price || lens.purchasePrice || 0}</span></div>
                  <div><span className="block text-[9px] text-rose-400 uppercase tracking-wider mb-1">Discount</span><span className="font-black text-rose-400">₹{lens.discount || 0}</span></div>
                  <div><span className="block text-[9px] text-emerald-400 uppercase tracking-wider mb-1">Final Amount</span><span className="font-black text-emerald-400 text-sm">₹{lens.finalAmount || 0}</span></div>
               </div>
            </div>
          ))}
        </div>
        )}`
);

// Replace sunglasses
code = code.replace(
  /<div className="space-y-3 mt-6">[\s\S]*?<h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2 border-b border-white\/5 pb-2">[\s\S]*?🕶️ Sunglass Details[\s\S]*?<\/h4>[\s\S]*?\{sunglasses\.length === 0 \? \([\s\S]*?<\/div>[\s\S]*?\)\)[\s\S]*?\}[\s\S]*?<\/div>/m,
  `{sunglasses.length > 0 && (
        <div className="space-y-3 mt-6">
          <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
             🕶️ Sunglass Details
          </h4>
          {sunglasses.map((sg: any, idx: number) => (
            <div key={idx} className="bg-[#1E293B] border border-white/5 p-4 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Brand</span><span className="font-bold text-white">{sg.brand || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Model</span><span className="font-bold text-white">{sg.modelNumber || sg.model || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Color</span><span className="font-bold text-white">{sg.color || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Category</span><span className="font-bold text-white">{sg.frameCategory || sg.productType || sg.category || 'N/A'}</span></div>
               
               <div className="col-span-2 md:col-span-4 border-t border-white/5 pt-3 mt-1 grid grid-cols-4 gap-4 bg-white/5 p-3 rounded-lg">
                  <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Quantity</span><span className="font-black text-white">{sg.quantity || 1}</span></div>
                  <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Price</span><span className="font-black text-white">₹{sg.sellingPrice || sg.price || sg.purchasePrice || 0}</span></div>
                  <div><span className="block text-[9px] text-rose-400 uppercase tracking-wider mb-1">Discount</span><span className="font-black text-rose-400">₹{sg.discount || 0}</span></div>
                  <div><span className="block text-[9px] text-emerald-400 uppercase tracking-wider mb-1">Final Amount</span><span className="font-black text-emerald-400 text-sm">₹{sg.finalAmount || 0}</span></div>
               </div>
            </div>
          ))}
        </div>
        )}`
);

// Replace accessories
code = code.replace(
  /<div className="space-y-3 mt-6">[\s\S]*?<h4 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2 border-b border-white\/5 pb-2">[\s\S]*?🛍️ Accessories Details[\s\S]*?<\/h4>[\s\S]*?\{accessories\.length === 0 \? \([\s\S]*?<\/div>[\s\S]*?\)\)[\s\S]*?\}[\s\S]*?<\/div>/m,
  `{accessories.length > 0 && (
        <div className="space-y-3 mt-6">
          <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
             🛍️ Accessories Details
          </h4>
          {accessories.map((acc: any, idx: number) => {
            let accessoryType = acc.category || acc.productType || 'Accessories';
            const name = String(acc.itemName || acc.name || acc.brand || '').toLowerCase();
            if (name.includes('clean')) accessoryType = 'Cleaning Kit';
            if (name.includes('hard case')) accessoryType = 'Hard Case';
            if (name.includes('soft case')) accessoryType = 'Soft Case';
            if (name.includes('chain')) accessoryType = 'Chain';
            if (name.includes('cloth')) accessoryType = 'Cloth';
            
            return (
            <div key={idx} className="bg-[#1E293B] border border-white/5 p-4 rounded-xl grid grid-cols-2 gap-4 text-xs">
               <div className="col-span-2">
                  <span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Product Name</span>
                  <span className="font-bold text-white">{acc.itemName || acc.name || acc.brand || acc.modelNumber || 'N/A'}</span>
               </div>
               <div className="col-span-2"><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Category</span><span className="font-bold text-white">{accessoryType}</span></div>
               
               <div className="col-span-2 border-t border-white/5 pt-3 mt-1 grid grid-cols-4 gap-4 bg-white/5 p-3 rounded-lg">
                  <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Quantity</span><span className="font-black text-white">{acc.quantity || 1}</span></div>
                  <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Price</span><span className="font-black text-white">₹{acc.sellingPrice || acc.price || acc.purchasePrice || 0}</span></div>
                  <div><span className="block text-[9px] text-rose-400 uppercase tracking-wider mb-1">Discount</span><span className="font-black text-rose-400">₹{acc.discount || 0}</span></div>
                  <div><span className="block text-[9px] text-emerald-400 uppercase tracking-wider mb-1">Final Amount</span><span className="font-black text-emerald-400 text-sm">₹{acc.finalAmount || 0}</span></div>
               </div>
            </div>
          )})}
        </div>
        )}`
);

fs.writeFileSync('components/SalesOrderDetailCard.tsx', code);

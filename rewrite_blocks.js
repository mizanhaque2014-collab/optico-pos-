const fs = require('fs');
let code = fs.readFileSync('components/SalesOrderDetailCard.tsx', 'utf-8');

// Find the start of rendering
const renderStart = code.indexOf('return (');
const actionButtons = code.indexOf('{/* ACTION BUTTONS */}');

const beforeRender = code.substring(0, renderStart);
const afterButtons = code.substring(actionButtons);

const newRender = `return (
    <div className="bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl flex flex-col gap-6 overflow-hidden text-white w-full">
      {/* 1. CUSTOMER DETAILS */}
      <div className="bg-[#1E293B] p-5 border-b border-white/5">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
          <div>
            <h3 className="text-lg font-black uppercase tracking-widest text-white">{customer?.name || 'Walk-in Customer'}</h3>
            <div className="text-xs text-white/60 mt-2 space-y-1">
               <p><span className="text-white/40 font-bold uppercase tracking-wider">Customer ID:</span> {customer?.id || 'N/A'}</p>
               <p><span className="text-white/40 font-bold uppercase tracking-wider">Mobile Number:</span> {customer?.mobile || 'N/A'}</p>
            </div>
          </div>
          <div className="text-left md:text-right">
             <h4 className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-1">{inv.type}</h4>
             <p className="text-xs text-white/60 font-mono mb-1">{inv.invoiceNumber}</p>
             <p className="text-[10px] text-white/40 uppercase tracking-widest">{new Date(inv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
        
        {/* ORDER STATUS */}
        <div className="mt-4 pt-4 border-t border-white/5">
           <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Order Status</h4>
           <div className="flex flex-wrap gap-2">
             {['Ordered', 'In Lab', 'Ready', 'Delivered', 'Cancelled'].map(status => {
                const isActive = inv.status === status;
                let colorClass = "bg-white/5 text-white/40 border-white/10 opacity-50";
                if (isActive) {
                  switch(status) {
                    case 'Ordered': colorClass = "bg-blue-500/20 text-blue-400 border-blue-500/30"; break;
                    case 'In Lab': colorClass = "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"; break;
                    case 'Delivered': colorClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"; break;
                    case 'Cancelled': colorClass = "bg-rose-500/20 text-rose-400 border-rose-500/30"; break;
                    case 'Ready': colorClass = "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"; break;
                    default: colorClass = "bg-purple-500/20 text-purple-400 border-purple-500/30"; break;
                  }
                }
                return (
                  <span key={status} className={\`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border \${colorClass}\`}>
                    {isActive ? \`✓ \${status}\` : status}
                  </span>
                );
             })}
           </div>
        </div>
        
        {/* FRAME DETAILS */}
        <div className="space-y-3 mt-6">
          <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
             👓 Frame Details
          </h4>
          {frames.length === 0 ? (
            <p className="text-xs font-bold text-white/30 uppercase tracking-wider p-4 bg-white/5 rounded-xl text-center">No Frame Selected</p>
          ) : (
            frames.map((frame: any, idx: number) => (
              <div key={idx} className="bg-[#1E293B] border border-white/5 p-4 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Brand</span><span className="font-bold text-white">{frame.brand || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Model</span><span className="font-bold text-white">{frame.modelNumber || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Code</span><span className="font-bold text-white">{frame.frameCode || frame.itemCode || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Category</span><span className="font-bold text-white">{frame.frameCategory || frame.productType || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Color</span><span className="font-bold text-white">{frame.color || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Size</span><span className="font-bold text-white">{frame.frameSize || frame.size || 'N/A'}</span></div>
                 
                 <div className="col-span-2 md:col-span-4 border-t border-white/5 pt-3 mt-1 grid grid-cols-4 gap-4 bg-white/5 p-3 rounded-lg">
                    <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Quantity</span><span className="font-black text-white">{frame.quantity || 1}</span></div>
                    <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Unit Price</span><span className="font-black text-white">₹{frame.sellingPrice || 0}</span></div>
                    <div><span className="block text-[9px] text-rose-400 uppercase tracking-wider mb-1">Discount</span><span className="font-black text-rose-400">₹{frame.discount || 0}</span></div>
                    <div><span className="block text-[9px] text-emerald-400 uppercase tracking-wider mb-1">Final Amount</span><span className="font-black text-emerald-400 text-sm">₹{frame.finalAmount || 0}</span></div>
                 </div>
              </div>
            ))
          )}
        </div>

        {/* LENS DETAILS */}
        <div className="space-y-3 mt-6">
          <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
             🔍 Lens Details
          </h4>
          {lenses.length === 0 ? (
            <p className="text-xs font-bold text-white/30 uppercase tracking-wider p-4 bg-white/5 rounded-xl text-center">No Lens Selected</p>
          ) : (
            lenses.map((lens: any, idx: number) => (
              <div key={idx} className="bg-[#1E293B] border border-white/5 p-4 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Brand</span><span className="font-bold text-white">{lens.lensBrand || lens.brand || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Category</span><span className="font-bold text-white">{lens.lensCategory || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Type</span><span className="font-bold text-white">{lens.lensType || lens.type || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Index</span><span className="font-bold text-white">{lens.lensIndex || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Coating</span><span className="font-bold text-white">{lens.lensCoating || 'N/A'}</span></div>
                 <div className="col-span-2 md:col-span-3"><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Features</span><span className="font-bold text-white">{lens.lensFeatures?.join(', ') || 'N/A'}</span></div>
                 
                 <div className="col-span-2 md:col-span-4 border-t border-white/5 pt-3 mt-1 grid grid-cols-4 gap-4 bg-white/5 p-3 rounded-lg">
                    <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Quantity</span><span className="font-black text-white">{lens.quantity || 1}</span></div>
                    <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Unit Price</span><span className="font-black text-white">₹{lens.sellingPrice || 0}</span></div>
                    <div><span className="block text-[9px] text-rose-400 uppercase tracking-wider mb-1">Discount</span><span className="font-black text-rose-400">₹{lens.discount || 0}</span></div>
                    <div><span className="block text-[9px] text-emerald-400 uppercase tracking-wider mb-1">Final Amount</span><span className="font-black text-emerald-400 text-sm">₹{lens.finalAmount || 0}</span></div>
                 </div>
              </div>
            ))
          )}
        </div>

        {/* SUNGLASS DETAILS */}
        <div className="space-y-3 mt-6">
          <h4 className="text-xs font-black text-orange-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
             😎 Sunglass Details
          </h4>
          {sunglasses.length === 0 ? (
            <p className="text-xs font-bold text-white/30 uppercase tracking-wider p-4 bg-white/5 rounded-xl text-center">No Sunglass Ordered</p>
          ) : (
            sunglasses.map((sg: any, idx: number) => (
              <div key={idx} className="bg-[#1E293B] border border-white/5 p-4 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Brand</span><span className="font-bold text-white">{sg.brand || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Model</span><span className="font-bold text-white">{sg.modelNumber || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Color</span><span className="font-bold text-white">{sg.color || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Category</span><span className="font-bold text-white">{sg.frameCategory || sg.productType || 'N/A'}</span></div>
                 
                 <div className="col-span-2 md:col-span-4 border-t border-white/5 pt-3 mt-1 grid grid-cols-4 gap-4 bg-white/5 p-3 rounded-lg">
                    <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Quantity</span><span className="font-black text-white">{sg.quantity || 1}</span></div>
                    <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Price</span><span className="font-black text-white">₹{sg.sellingPrice || 0}</span></div>
                    <div><span className="block text-[9px] text-rose-400 uppercase tracking-wider mb-1">Discount</span><span className="font-black text-rose-400">₹{sg.discount || 0}</span></div>
                    <div><span className="block text-[9px] text-emerald-400 uppercase tracking-wider mb-1">Final Amount</span><span className="font-black text-emerald-400 text-sm">₹{sg.finalAmount || 0}</span></div>
                 </div>
              </div>
            ))
          )}
        </div>

        {/* ACCESSORIES DETAILS */}
        <div className="space-y-3 mt-6">
          <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
             🛍️ Accessories
          </h4>
          {accessories.length === 0 ? (
            <p className="text-xs font-bold text-white/30 uppercase tracking-wider p-4 bg-white/5 rounded-xl text-center">No Accessories Ordered</p>
          ) : (
            accessories.map((acc: any, idx: number) => {
              let accessoryType = 'Accessories';
              const name = (acc.itemName || '').toLowerCase();
              if (name.includes('clean')) accessoryType = 'Cleaning Kit';
              if (name.includes('hard case')) accessoryType = 'Hard Case';
              if (name.includes('soft case')) accessoryType = 'Soft Case';
              if (name.includes('chain')) accessoryType = 'Chain';
              if (name.includes('cloth')) accessoryType = 'Cloth';
              
              return (
              <div key={idx} className="bg-[#1E293B] border border-white/5 p-4 rounded-xl grid grid-cols-2 gap-4 text-xs">
                 <div className="col-span-2">
                    <span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Product Name</span>
                    <span className="font-bold text-white">{acc.itemName || 'N/A'}</span>
                 </div>
                 <div className="col-span-2"><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Category</span><span className="font-bold text-white">{accessoryType}</span></div>
                 
                 <div className="col-span-2 border-t border-white/5 pt-3 mt-1 grid grid-cols-4 gap-4 bg-white/5 p-3 rounded-lg">
                    <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Quantity</span><span className="font-black text-white">{acc.quantity || 1}</span></div>
                    <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Price</span><span className="font-black text-white">₹{acc.sellingPrice || 0}</span></div>
                    <div><span className="block text-[9px] text-rose-400 uppercase tracking-wider mb-1">Discount</span><span className="font-black text-rose-400">₹{acc.discount || 0}</span></div>
                    <div><span className="block text-[9px] text-emerald-400 uppercase tracking-wider mb-1">Final Amount</span><span className="font-black text-emerald-400 text-sm">₹{acc.finalAmount || 0}</span></div>
                 </div>
              </div>
            )})
          )}
        </div>

        {/* PRESCRIPTION DETAILS */}
        <div className="space-y-3 mt-6">
          <h4 className="text-xs font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
             📋 Prescription Details
          </h4>
          {!prescription ? (
            <p className="text-xs font-bold text-white/30 uppercase tracking-wider p-4 bg-white/5 rounded-xl text-center">No Prescription Linked</p>
          ) : (
            <div className="bg-[#1E293B] border border-white/5 p-4 rounded-xl space-y-4">
               {/* RIGHT EYE */}
               <div>
                 <span className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 bg-white/5 px-2 py-1 rounded inline-block">Right Eye (OD)</span>
                 <div className="grid grid-cols-5 gap-2">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                      <span className="block text-[9px] text-white/40 uppercase font-bold tracking-wider mb-1">SPH</span>
                      <span className="font-mono text-white text-xs">{prescription.rightEye?.sph || '-'}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                      <span className="block text-[9px] text-white/40 uppercase font-bold tracking-wider mb-1">CYL</span>
                      <span className="font-mono text-white text-xs">{prescription.rightEye?.cyl || '-'}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                      <span className="block text-[9px] text-white/40 uppercase font-bold tracking-wider mb-1">AXIS</span>
                      <span className="font-mono text-white text-xs">{prescription.rightEye?.axis || '-'}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                      <span className="block text-[9px] text-white/40 uppercase font-bold tracking-wider mb-1">ADD</span>
                      <span className="font-mono text-white text-xs">{prescription.rightEye?.add || '-'}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                      <span className="block text-[9px] text-white/40 uppercase font-bold tracking-wider mb-1">V/A</span>
                      <span className="font-mono text-white text-xs">{prescription.rightEye?.va || '-'}</span>
                    </div>
                 </div>
               </div>
               {/* LEFT EYE */}
               <div>
                 <span className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 bg-white/5 px-2 py-1 rounded inline-block">Left Eye (OS)</span>
                 <div className="grid grid-cols-5 gap-2">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                      <span className="block text-[9px] text-white/40 uppercase font-bold tracking-wider mb-1">SPH</span>
                      <span className="font-mono text-white text-xs">{prescription.leftEye?.sph || '-'}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                      <span className="block text-[9px] text-white/40 uppercase font-bold tracking-wider mb-1">CYL</span>
                      <span className="font-mono text-white text-xs">{prescription.leftEye?.cyl || '-'}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                      <span className="block text-[9px] text-white/40 uppercase font-bold tracking-wider mb-1">AXIS</span>
                      <span className="font-mono text-white text-xs">{prescription.leftEye?.axis || '-'}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                      <span className="block text-[9px] text-white/40 uppercase font-bold tracking-wider mb-1">ADD</span>
                      <span className="font-mono text-white text-xs">{prescription.leftEye?.add || '-'}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                      <span className="block text-[9px] text-white/40 uppercase font-bold tracking-wider mb-1">V/A</span>
                      <span className="font-mono text-white text-xs">{prescription.leftEye?.va || '-'}</span>
                    </div>
                 </div>
               </div>
               <div className="pt-2">
                 <span className="text-[10px] text-white/40 uppercase font-bold mr-2">PD:</span>
                 <span className="font-mono text-xs">{prescription.pdDistance || '-'} / {prescription.pdNear || '-'}</span>
               </div>
            </div>
          )}
        </div>

        {/* BILL SUMMARY & PAYMENT DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
           {/* BILL SUMMARY */}
           <div className="bg-[#1E293B] border border-white/5 p-4 rounded-xl space-y-3">
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Bill Summary</h4>
              <div className="space-y-2 text-xs">
                 <div className="flex justify-between text-white/60"><span>Product Total:</span> <span className="font-mono text-white">₹{productTotal}</span></div>
                 <div className="flex justify-between text-white/60"><span>Discount:</span> <span className="font-mono text-rose-400">-₹{discountAmount}</span></div>
                 <div className="flex justify-between text-white/60"><span>Tax:</span> <span className="font-mono text-white">₹{taxAmount}</span></div>
                 <div className="flex justify-between text-white/80 font-bold border-t border-white/5 pt-2"><span>Grand Total:</span> <span className="font-mono text-white">₹{grandTotal}</span></div>
                 <div className="flex justify-between text-emerald-400 font-bold"><span>Advance Received:</span> <span className="font-mono">₹{advanceAmount}</span></div>
                 <div className="flex justify-between text-rose-400 font-black border-t border-white/5 pt-2 mt-1"><span>Balance Amount:</span> <span className="font-mono text-sm">₹{balanceAmount}</span></div>
              </div>
           </div>

           {/* PAYMENT DETAILS */}
           <div className="bg-[#1E293B] border border-white/5 p-4 rounded-xl space-y-3">
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Payment Details</h4>
              <div className="space-y-2 text-xs">
                 <div className="flex justify-between items-center text-white/60 mb-2 border-b border-white/5 pb-2">
                    <span>Payment Mode:</span> 
                    <span className="font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 uppercase tracking-wider text-[10px]">{inv.paymentMode}</span>
                 </div>
                 
                 {(inv.paymentMode === 'Cash' || inv.paymentMode === 'Mixed') && (
                   <div className="flex justify-between text-white/80"><span>Cash Amount:</span> <span className="font-mono font-bold text-white">₹{inv.paymentDetail?.cash || 0}</span></div>
                 )}
                 {(inv.paymentMode === 'Card' || inv.paymentMode === 'Mixed') && (
                   <>
                     <div className="flex justify-between text-white/80"><span>Card Amount:</span> <span className="font-mono font-bold text-white">₹{inv.paymentDetail?.card || 0}</span></div>
                     <div className="flex justify-between text-white/50 text-[10px]"><span>Card Reference:</span> <span>{inv.paymentDetail?.cardLast4 || 'N/A'}</span></div>
                   </>
                 )}
                 {(inv.paymentMode === 'UPI' || inv.paymentMode === 'Mixed') && (
                   <>
                     <div className="flex justify-between text-white/80"><span>UPI Amount:</span> <span className="font-mono font-bold text-white">₹{inv.paymentDetail?.upi || 0}</span></div>
                     <div className="flex justify-between text-white/50 text-[10px]"><span>UPI Reference:</span> <span>{inv.paymentDetail?.upiTransactionId || 'N/A'}</span></div>
                   </>
                 )}
                 {(inv.paymentMode === 'Bank Transfer' || inv.paymentMode === 'Mixed') && (
                   <div className="flex justify-between text-white/80"><span>Bank Amount:</span> <span className="font-mono font-bold text-white">₹{inv.paymentDetail?.bank || 0}</span></div>
                 )}
                 {inv.paymentDetail?.transactionId && (
                   <div className="flex justify-between text-white/50 text-[10px]"><span>Transaction Number:</span> <span>{inv.paymentDetail?.transactionId || 'N/A'}</span></div>
                 )}
                 
                 <div className="flex justify-between text-emerald-400 font-bold border-t border-white/5 pt-2 mt-1"><span>Advance Received:</span> <span className="font-mono">₹{advanceAmount}</span></div>
                 <div className="flex justify-between text-rose-400 font-black"><span>Balance Amount:</span> <span className="font-mono text-sm">₹{balanceAmount}</span></div>
              </div>
           </div>
        </div>
      </div>
      
      `;

fs.writeFileSync('components/SalesOrderDetailCard.tsx', beforeRender + newRender + afterButtons);

const fs = require('fs');
let code = fs.readFileSync('components/CompanyReportsView.tsx', 'utf8');

const newTables = `
      {/* BRANCH COMPARISON */}
      {selectedBranchId === 'ALL' && (
        <div className="bg-[#0F172A] rounded-2xl border border-white/5 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1E293B]/50">
            <h2 className="text-sm font-bold text-white flex items-center gap-2"><Building size={16} className="text-cyan-400"/> Branch Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase tracking-wider text-white/50 border-b border-white/10">
                  <th className="p-4 font-black">Branch</th>
                  <th className="p-4 font-black text-right">Total Sales</th>
                  <th className="p-4 font-black text-right">Collections</th>
                  <th className="p-4 font-black text-right">Orders</th>
                  <th className="p-4 font-black text-right">Customers</th>
                </tr>
              </thead>
              <tbody className="text-xs text-white/80 divide-y divide-white/5">
                {branches.map(b => {
                  const bInv = filteredInvoices.filter(i => (i as any).branchId === b.BranchID || (i as any).branchId === b.id || (i as any).branchId === b.BranchName);
                  let bSales = 0;
                  let bColl = 0;
                  let bOrd = 0;
                  bInv.forEach(i => {
                    bSales += i.grandTotal;
                    const pd = i.paymentDetail || {};
                    bColl += (pd.cash || 0) + (pd.card || 0) + (pd.upi || 0);
                    if (i.type === 'Sales Order') bOrd++;
                  });
                  const bCust = reactiveCustomers.filter(c => (c as any).branchId === b.BranchID || (c as any).branchId === b.id).length;
                  return (
                    <tr key={b.BranchID || b.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => switchBranch(b.BranchID || b.id, b.BranchName || b.branchName)}>
                      <td className="p-4 font-bold text-cyan-400">{b.BranchName || b.branchName}</td>
                      <td className="p-4 text-right">{formatMoney(bSales)}</td>
                      <td className="p-4 text-right">{formatMoney(bColl)}</td>
                      <td className="p-4 text-right">{bOrd}</td>
                      <td className="p-4 text-right">{bCust}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TOP PRODUCTS */}
      <div className="bg-[#0F172A] rounded-2xl border border-white/5 shadow-xl overflow-hidden">
         <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1E293B]/50">
           <h2 className="text-sm font-bold text-white flex items-center gap-2"><Package size={16} className="text-purple-400"/> Top Products Sold</h2>
         </div>
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-white/5 text-[10px] uppercase tracking-wider text-white/50 border-b border-white/10">
                 <th className="p-4 font-black">Product</th>
                 <th className="p-4 font-black">Category</th>
                 <th className="p-4 font-black text-right">Quantity Sold</th>
                 <th className="p-4 font-black text-right">Sales Amount</th>
               </tr>
             </thead>
             <tbody className="text-xs text-white/80 divide-y divide-white/5">
               {(() => {
                 const prodMap: Record<string, {name: string, cat: string, qty: number, amt: number}> = {};
                 filteredInvoices.forEach(inv => {
                   if (inv.items) {
                     inv.items.forEach(it => {
                       const key = it.modelNumber || it.lensType || 'Unknown';
                       if (!prodMap[key]) prodMap[key] = {name: it.brand || 'N/A', cat: it.category || 'N/A', qty: 0, amt: 0};
                       prodMap[key].qty += (it.quantity || 1);
                       prodMap[key].amt += (it.subTotal || 0);
                     });
                   }
                 });
                 const sorted = Object.values(prodMap).sort((a,b) => b.amt - a.amt).slice(0, 10);
                 if (sorted.length === 0) return <tr><td colSpan={4} className="p-8 text-center text-white/40">No product data found.</td></tr>;
                 return sorted.map((p, i) => (
                   <tr key={i} className="hover:bg-white/5 transition-colors">
                     <td className="p-4">{p.name}</td>
                     <td className="p-4">{p.cat}</td>
                     <td className="p-4 text-right font-bold">{p.qty}</td>
                     <td className="p-4 text-right font-bold text-emerald-400">{formatMoney(p.amt)}</td>
                   </tr>
                 ));
               })()}
             </tbody>
           </table>
         </div>
      </div>

      {/* CUSTOMER REPORT */}
      <div className="bg-[#0F172A] rounded-2xl border border-white/5 shadow-xl overflow-hidden">
         <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1E293B]/50">
           <h2 className="text-sm font-bold text-white flex items-center gap-2"><Users size={16} className="text-orange-400"/> Customer Analytics</h2>
         </div>
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-white/5 text-[10px] uppercase tracking-wider text-white/50 border-b border-white/10">
                 <th className="p-4 font-black">Customer Name</th>
                 <th className="p-4 font-black">Mobile</th>
                 <th className="p-4 font-black text-right">Total Purchases</th>
                 <th className="p-4 font-black text-right">Last Purchase Date</th>
               </tr>
             </thead>
             <tbody className="text-xs text-white/80 divide-y divide-white/5">
               {(() => {
                 const custMap: Record<string, {name: string, mob: string, purchases: number, lastDate: number}> = {};
                 filteredInvoices.forEach(inv => {
                   if (!custMap[inv.customerId]) {
                     const c = reactiveCustomers.find(cx => cx.id === inv.customerId);
                     custMap[inv.customerId] = {
                       name: c ? c.fullName : inv.customerId,
                       mob: c ? (c.mobile || c.phone || 'N/A') : 'N/A',
                       purchases: 0,
                       lastDate: 0
                     };
                   }
                   custMap[inv.customerId].purchases += inv.grandTotal;
                   if (inv.createdAt > custMap[inv.customerId].lastDate) {
                     custMap[inv.customerId].lastDate = inv.createdAt;
                   }
                 });
                 const sorted = Object.values(custMap).sort((a,b) => b.purchases - a.purchases).slice(0, 10);
                 if (sorted.length === 0) return <tr><td colSpan={4} className="p-8 text-center text-white/40">No customer activity.</td></tr>;
                 return sorted.map((c, i) => (
                   <tr key={i} className="hover:bg-white/5 transition-colors">
                     <td className="p-4 font-bold text-white">{c.name}</td>
                     <td className="p-4 text-white/60">{c.mob}</td>
                     <td className="p-4 text-right font-bold text-emerald-400">{formatMoney(c.purchases)}</td>
                     <td className="p-4 text-right">{new Date(c.lastDate).toLocaleDateString()}</td>
                   </tr>
                 ));
               })()}
             </tbody>
           </table>
         </div>
      </div>
`;

code = code.replace(/\{\/\* SALES REPORT TABLE \*\/\}/, newTables + '\n\n      {/* SALES REPORT TABLE */}');

// Add "Payment" to Sales Report Table
code = code.replace(/<th className="p-4 font-black text-right">Amount<\/th>\n                 <th className="p-4 font-black">Status<\/th>/, '<th className="p-4 font-black text-right">Amount</th>\n                 <th className="p-4 font-black">Payment</th>\n                 <th className="p-4 font-black">Status</th>');

code = code.replace(/<td className="p-4 text-right font-bold text-white">\{formatMoney\(inv\.grandTotal\)\}<\/td>\n                       <td className="p-4">/g, 
  `<td className="p-4 text-right font-bold text-white">{formatMoney(inv.grandTotal)}</td>
                       <td className="p-4">
                         {inv.paymentDetail?.cash ? 'Cash ' : ''}
                         {inv.paymentDetail?.card ? 'Card ' : ''}
                         {inv.paymentDetail?.upi ? 'UPI ' : ''}
                         {!(inv.paymentDetail?.cash || inv.paymentDetail?.card || inv.paymentDetail?.upi) ? 'N/A' : ''}
                       </td>
                       <td className="p-4">`
);

fs.writeFileSync('components/CompanyReportsView.tsx', code);

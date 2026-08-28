const fs = require('fs');
let code = fs.readFileSync('components/CustomerProfileView.tsx', 'utf-8');

const target1 = `      {loadingHistory ? (
        <div className="text-center py-12 text-xs font-bold uppercase tracking-widest text-white/40">
          Loading Examination & Purchase Histories...
        </div>
      ) : (`;

const replace1 = `      {loadingHistory && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0F172A]/95 backdrop-blur-md">
           <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400 mb-6 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
           <p className="text-sm font-black uppercase tracking-widest text-cyan-400 animate-pulse">
             Please wait, loading customer data...
           </p>
        </div>
      )}
      
      {!loadingHistory && (`;

if (code.includes(target1)) {
  code = code.replace(target1, replace1);
  fs.writeFileSync('components/CustomerProfileView.tsx', code);
  console.log("Patched CustomerProfileView successfully.");
} else {
  console.log("Target not found in CustomerProfileView.");
}

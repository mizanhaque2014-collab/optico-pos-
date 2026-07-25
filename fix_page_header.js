const fs = require('fs');

let code = fs.readFileSync('app/page.tsx', 'utf8');

// I also noticed <LogOut /> might be in the code already because I ran fix_page.js.
// Let's check if the header Replace actually worked.

if (!code.includes('<LogOut size={18} />')) {
  console.log('LogOut button not found, injecting...');
  const headerSearch = `<div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSettingsModal(true)}`;

  const headerReplace = `<div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right mr-2">
               <span className="text-xs font-black text-white uppercase tracking-widest">{session.fullName}</span>
               <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider">{session.role.replace('_', ' ')} • {session.branchID}</span>
            </div>
            {session.role === 'SUPER_ADMIN' || session.role === 'COMPANY_ADMIN' ? (
              <button 
                onClick={() => setShowSettingsModal(true)}`;

  code = code.replace(headerSearch, headerReplace);
  
  const headerSearch2 = `title="Shop Settings"
            >
              <Building size={18} />
            </button>`;
  
  const headerReplace2 = `title="Shop Settings"
            >
              <Building size={18} />
            </button>
            ) : null}
            <button 
              onClick={logout}
              className="text-rose-400/70 hover:text-rose-400 transition-colors bg-white/5 p-2 rounded-xl border border-white/10 hover:border-white/20"
              title="Logout"
            >
              <LogOut size={18} />
            </button>`;
            
  code = code.replace(headerSearch2, headerReplace2);
} else {
  console.log('LogOut button already exists.');
}

fs.writeFileSync('app/page.tsx', code);
